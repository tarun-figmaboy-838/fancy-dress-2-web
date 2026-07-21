/* level-transition.js — themed "Level Complete → Next Challenge" transition.
   Balance-scale motif (tips, then settles level — the game's own metaphor), warm
   festive palette, confetti. Text and voice-over are kept in lock-step by the shared
   VoiceTextSync controller; the visual motion is short and then the finished frame is
   held until the narration completes.

   Sequence (matches the VO/text spec exactly):
     1. overlay fades in over the finished level
     2. balance scale pops + settles level + confetti burst (short visual motion)
     3. "Level Complete" text reveals in sync with its VO
     4. only after that VO ends → "Next Challenge" text + its VO
     5. hold 150–250 ms, swap to the next level UNDER the opaque overlay (narration gated)
     6. fade overlay out, then release the next level's instruction narration
*/
(function (global) {
  "use strict";
  var E = global.Engine;
  var VO = global.VoiceTextSync;

  // Theme lines. The project ships NO narration for these two lines, so `audio` is left null
  // on purpose: VoiceTextSync reveals the text on an estimated duration (identical on-screen
  // result) and — critically — no request is made, so there is no 404 / failed-audio spam on
  // every transition. To add real narration later, drop the clip on disk under the audio
  // folder AND set its path on the line below; VoiceTextSync will then play it automatically.
  var LINES = {
    complete: { text: "Level Complete", audio: null },
    next: { text: "Next Challenge", audio: null }
  };

  var busy = false;   // guards against rapid Next clicks stacking transitions

  /* ---- transition state machine ----
     Legal path:  idle → locking → animating → narrating → loading-next-level → revealing
                  → complete → idle.  Cancellation: <any active> → cancelling → cleanup → idle.
     `busy` is the hard re-entrancy guard (a second run()/preview() while active is rejected).
     The state is exposed for debugging and illegal/rejected calls are logged in dev builds
     only, so production gameplay is never affected. */
  var STATE = "idle";
  var LEGAL = {
    "idle": ["locking"],
    "locking": ["animating"],
    "animating": ["narrating"],
    "narrating": ["loading-next-level"],
    "loading-next-level": ["revealing"],
    "revealing": ["complete"],
    "complete": ["idle"],
    "cancelling": ["cleanup"],
    "cleanup": ["idle"]
  };
  function isDev() {
    try {
      if (global.BalancingGodMode || global.__GOD_DEBUG) return true;
      var h = (global.location && global.location.hostname) || "";
      return h === "localhost" || h === "127.0.0.1" || h === "";
    } catch (e) { return false; }
  }
  function setState(next, opts) {
    var force = opts && opts.force;
    var ok = force || (LEGAL[STATE] && LEGAL[STATE].indexOf(next) >= 0);
    if (!ok) {
      if (isDev()) console.warn("[LevelTransition] illegal state transition rejected: " + STATE + " → " + next);
      return false;
    }
    STATE = next;
    return true;
  }
  function toCancelled() { STATE = "cancelling"; STATE = "cleanup"; STATE = "idle"; } // recovery path

  function stage() { return E.stageEl ? E.stageEl() : document.getElementById("stage"); }

  // God Mode slow-motion: extend the VISUAL hold only (voice stays real-time).
  function speedFactor() {
    var v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--god-animation-speed"));
    return (v > 0 && isFinite(v)) ? v : 1;
  }

  var SCALE_SVG =
    '<svg class="lt-scale" viewBox="0 0 460 300" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<rect x="150" y="250" width="160" height="26" rx="10" fill="#8A410A"/>' +
    '<rect x="222" y="70" width="16" height="185" rx="8" fill="#A85B12"/>' +
    '<circle cx="230" cy="72" r="14" fill="#F6A623" stroke="#8A410A" stroke-width="4"/>' +
    '<g class="lt-beam">' +
    '<rect x="60" y="64" width="340" height="16" rx="8" fill="#B4560E"/>' +
    '<circle cx="70" cy="72" r="7" fill="#8A410A"/><circle cx="390" cy="72" r="7" fill="#8A410A"/>' +
    '</g>' +
    '<g class="lt-pan-l">' +
    '<line x1="70" y1="72" x2="40" y2="150" stroke="#8A410A" stroke-width="4"/>' +
    '<line x1="70" y1="72" x2="100" y2="150" stroke="#8A410A" stroke-width="4"/>' +
    '<path d="M28 150 H112 L96 188 H44 Z" fill="#F6A623" stroke="#8A410A" stroke-width="4" stroke-linejoin="round"/>' +
    '<rect x="52" y="120" width="36" height="34" rx="6" fill="#F2C14E" stroke="#8A410A" stroke-width="3"/>' +
    '</g>' +
    '<g class="lt-pan-r">' +
    '<line x1="390" y1="72" x2="360" y2="150" stroke="#8A410A" stroke-width="4"/>' +
    '<line x1="390" y1="72" x2="420" y2="150" stroke="#8A410A" stroke-width="4"/>' +
    '<path d="M348 150 H432 L416 188 H364 Z" fill="#F6A623" stroke="#8A410A" stroke-width="4" stroke-linejoin="round"/>' +
    '<rect x="372" y="120" width="36" height="34" rx="6" fill="#F2C14E" stroke="#8A410A" stroke-width="3"/>' +
    '</g>' +
    '<g class="lt-star"><path d="M230 8 l14 40 42 2 -33 26 12 41 -35-24 -35 24 12-41 -33-26 42-2 z" ' +
    'fill="#FFE47A" stroke="#8A410A" stroke-width="4" stroke-linejoin="round"/></g>' +
    '</svg>';

  function buildOverlay() {
    var ov = document.createElement("div");
    ov.className = "lt-overlay";
    var card = document.createElement("div");
    card.className = "lt-card";
    card.innerHTML = SCALE_SVG;
    var text = document.createElement("div");
    text.className = "lt-text";
    card.appendChild(text);
    ov.appendChild(card);
    return { overlay: ov, textEl: text };
  }

  function wait(sec) { return new Promise(function (r) { setTimeout(r, sec * 1000); }); }
  function raf() { return new Promise(function (r) { requestAnimationFrame(function () { r(); }); }); }

  // Burst confetti from the stage centre, then re-parent the layer INTO the overlay
  // (behind the card) so it renders above the opaque backdrop, not hidden beneath it.
  function burstConfetti(overlay) {
    try {
      if (!E.confetti) return;
      E.confetti("__lt_center__");
      var st = stage();
      var layers = st ? st.querySelectorAll(".confetti-layer") : [];
      var layer = layers[layers.length - 1];
      if (layer && overlay) { layer.style.zIndex = "1"; overlay.insertBefore(layer, overlay.firstChild); }
    } catch (e) { }
  }

  // Reveal one synced line into the overlay text node, in step with its VO.
  function speakLine(textEl, line, isSub) {
    textEl.className = "lt-text" + (isSub ? " lt-sub" : "") + " lt-typing";
    var session = VO.play({
      text: line.text,
      audio: line.audio,
      revealMode: "word",
      setText: function (t) { textEl.textContent = t; },
      holdAfter: 0.05
    });
    return session.promise.then(function () { textEl.classList.remove("lt-typing"); return session; });
  }

  /* Full transition.
     opts.onRevealNext  — REQUIRED: perform the level node swap here (runs under the
                          opaque overlay, with narration gated).
     opts.onNextReady   — optional: called once the overlay is gone and it is safe to
                          release / start the next level's narration.
     Returns a Promise that resolves after the overlay is fully removed. */
  function run(opts) {
    opts = opts || {};
    if (busy) { if (isDev()) console.warn("[LevelTransition] run() rejected — already " + STATE); return Promise.resolve(false); }
    busy = true;
    setState("locking");

    var ui = buildOverlay();
    stage().appendChild(ui.overlay);
    var self = this;
    var swapped = false;   // guard: onRevealNext must run exactly once, even on the error path

    function doSwap() {
      if (swapped) return; swapped = true;
      try { if (opts.onRevealNext) opts.onRevealNext(); } catch (e) { console.warn("[LevelTransition] onRevealNext", e); }
    }

    return raf()
      .then(function () { setState("animating"); ui.overlay.classList.add("lt-in"); return wait(0.35 / 1); })
      .then(function () {
        // short celebratory motion — confetti bursts from the stage centre
        burstConfetti(ui.overlay);
        return wait(0.55);   // let the scale settle before the text speaks
      })
      // 1) LEVEL COMPLETE — text + VO together
      .then(function () { setState("narrating"); return speakLine(ui.textEl, opts.completeLine || LINES.complete, false); })
      // 2) NEXT CHALLENGE — only after the first VO has finished
      .then(function () { return wait(0.15); })
      .then(function () { return speakLine(ui.textEl, opts.nextLine || LINES.next, true); })
      // 3) hold the finished frame briefly (extended, not the audio, in slow-mo)
      .then(function () {
        var f = speedFactor();
        var hold = 0.2 * (f < 1 ? 1 / f : 1);   // 150–250 ms at 1× ; longer in slow-mo
        return wait(hold);
      })
      // 4) swap to the next level under cover, with the next narration gated
      .then(function () {
        setState("loading-next-level");
        VO.suspend();
        doSwap();
        ui.overlay.classList.remove("lt-in");
        ui.overlay.classList.add("lt-out");
        return wait(0.4);
      })
      // 5) overlay gone → release the next level's instruction narration
      .then(function () {
        setState("revealing");
        if (ui.overlay.parentNode) ui.overlay.parentNode.removeChild(ui.overlay);
        try { if (opts.onNextReady) opts.onNextReady(); } catch (e) { console.warn("[LevelTransition] onNextReady", e); }
        VO.resume();
        setState("complete"); setState("idle");
        busy = false;
        return true;
      })
      .catch(function (e) {
        console.warn("[LevelTransition] failed", e);
        toCancelled();
        if (ui.overlay.parentNode) ui.overlay.parentNode.removeChild(ui.overlay);
        VO.resume();
        busy = false;
        // never block progression — perform the swap even if the animation broke
        // (doSwap is idempotent, so we never activate/start the next level twice)
        doSwap();
        try { if (opts.onNextReady) opts.onNextReady(); } catch (e2) { }
        return false;
      });
  }

  /* God Mode preview — run the visuals + VO WITHOUT swapping levels.
     kind: "transition" (both lines) | "complete" | "next". */
  function preview(kind) {
    if (busy) return Promise.resolve(false);
    busy = true;
    var ui = buildOverlay();
    stage().appendChild(ui.overlay);
    var seq = raf().then(function () { ui.overlay.classList.add("lt-in"); return wait(0.35); })
      .then(function () { burstConfetti(ui.overlay); return wait(0.4); });
    if (kind === "next") {
      seq = seq.then(function () { return speakLine(ui.textEl, LINES.next, true); });
    } else if (kind === "complete") {
      seq = seq.then(function () { return speakLine(ui.textEl, LINES.complete, false); });
    } else {
      seq = seq.then(function () { return speakLine(ui.textEl, LINES.complete, false); })
        .then(function () { return wait(0.15); })
        .then(function () { return speakLine(ui.textEl, LINES.next, true); });
    }
    return seq.then(function () { return wait(0.4); })
      .then(function () {
        ui.overlay.classList.remove("lt-in"); ui.overlay.classList.add("lt-out");
        return wait(0.4);
      })
      .then(function () { if (ui.overlay.parentNode) ui.overlay.parentNode.removeChild(ui.overlay); busy = false; return true; })
      .catch(function () { if (ui.overlay.parentNode) ui.overlay.parentNode.removeChild(ui.overlay); busy = false; return false; });
  }

  global.LevelTransition = {
    LINES: LINES,
    run: run,
    preview: preview,
    isRunning: function () { return busy; },
    state: function () { return STATE; }
  };
})(window);
