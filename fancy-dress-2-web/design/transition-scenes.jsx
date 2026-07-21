/* =============================================================================
   DESIGN REFERENCE — NOT SHIPPED / NOT LOADED BY THE GAME.
   -----------------------------------------------------------------------------
   This is the original React + `SceneStage` (animations-v2 "OM") authoring source
   for the level-transition motion design (Object Drop → Magic Wave → Next Level).
   The shipped game is dependency-free vanilla JS with no build step and no React,
   so this file is kept only as the design source of truth. Its VISUAL LANGUAGE —
   the balance-scale drop-and-settle and the blue "magic wave" (expanding water
   rings + sparkles + water-drop glow) — was ported into the real game transition:
       css/transition.css   (.lt-wave, water palette, ring/sparkle spectacle)
       js/level-transition.js (.lt-wave overlay layer + water-tinted scale motif)
   Do NOT add this file to index.html.
   ============================================================================= */

/* Balance-scale game level transition — scenes for animations-v2 SceneStage */
const { SceneStage, useScene, Easing, clamp, useTweaks, TweaksPanel, TweakSection, TweakSlider, TweakColor, TweakToggle } = window;
const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
const FONT = "'Nunito','Nunito Sans','Trebuchet MS',sans-serif";

/* ---------- tiny CSS-shaded object library (soft toy-plastic look) ---------- */
function Shine({ w, h, x, y, o = 0.55 }) {
  return <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: '50%', background: 'radial-gradient(ellipse at 40% 35%, rgba(255,255,255,' + o + '), rgba(255,255,255,0) 70%)', pointerEvents: 'none' }} />;
}
function Apple({ s = 1 }) {
  return (
    <div style={{ position: 'relative', width: 110 * s, height: 104 * s }}>
      <div style={{ position: 'absolute', left: '46%', top: -14 * s, width: 10 * s, height: 30 * s, borderRadius: 6 * s, background: 'linear-gradient(180deg,#7a4a22,#5d3517)' }} />
      <div style={{ position: 'absolute', left: '56%', top: -10 * s, width: 40 * s, height: 22 * s, borderRadius: '4% 96% 30% 70%', background: 'radial-gradient(ellipse at 35% 40%,#7ed957,#2CB64E 70%)', transform: 'rotate(24deg)' }} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: '48% 48% 46% 46%', background: 'radial-gradient(circle at 36% 30%, #ff7a6e, #e63946 55%, #b31f31 95%)', boxShadow: 'inset 0 -10px 18px rgba(90,0,10,.35), 0 10px 14px rgba(60,20,0,.25)' }} />
      <Shine w={44 * s} h={34 * s} x={16 * s} y={12 * s} />
    </div>
  );
}
function Block({ c = '#3B70C5', s = 1, letter = 'A' }) {
  return (
    <div style={{ position: 'relative', width: 76 * s, height: 76 * s, borderRadius: 16 * s, background: `radial-gradient(circle at 32% 26%, ${c}, ${c} 40%, rgba(0,0,0,.28) 130%)`, boxShadow: 'inset 0 4px 8px rgba(255,255,255,.45), inset 0 -8px 12px rgba(0,0,0,.3), 0 8px 12px rgba(60,20,0,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.9)', fontFamily: FONT, fontWeight: 800, fontSize: 34 * s, textShadow: '0 2px 3px rgba(0,0,0,.3)' }}>{letter}</div>
  );
}
function Book({ s = 1 }) {
  return (
    <div style={{ position: 'relative', width: 130 * s, height: 96 * s }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 12 * s, background: 'linear-gradient(160deg,#5BC4C4,#2f9d9d 70%)', boxShadow: 'inset 0 5px 8px rgba(255,255,255,.4), inset 0 -8px 12px rgba(0,40,40,.35), 0 10px 14px rgba(60,20,0,.25)' }} />
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 22 * s, borderRadius: `${12 * s}px 0 0 ${12 * s}px`, background: 'linear-gradient(90deg,#217a7a,#2f9d9d)' }} />
      <div style={{ position: 'absolute', left: 36 * s, top: 22 * s, right: 14 * s, height: 8 * s, borderRadius: 4 * s, background: 'rgba(255,255,255,.75)' }} />
      <div style={{ position: 'absolute', left: 36 * s, top: 40 * s, right: 30 * s, height: 8 * s, borderRadius: 4 * s, background: 'rgba(255,255,255,.55)' }} />
      <Shine w={54 * s} h={26 * s} x={30 * s} y={8 * s} o={0.4} />
    </div>
  );
}
function Bottle({ s = 1 }) {
  return (
    <div style={{ position: 'relative', width: 64 * s, height: 140 * s }}>
      <div style={{ position: 'absolute', left: 14 * s, top: 0, width: 36 * s, height: 26 * s, borderRadius: 8 * s, background: 'linear-gradient(180deg,#4746A0,#33327a)', boxShadow: 'inset 0 3px 5px rgba(255,255,255,.35)' }} />
      <div style={{ position: 'absolute', left: 0, top: 24 * s, width: 64 * s, height: 116 * s, borderRadius: `${26 * s}px ${26 * s}px ${18 * s}px ${18 * s}px`, background: 'linear-gradient(105deg, rgba(120,190,255,.95), #3B70C5 60%, #2b57a0)', boxShadow: 'inset 0 6px 10px rgba(255,255,255,.5), inset 0 -10px 14px rgba(10,30,90,.4), 0 10px 14px rgba(60,20,0,.25)' }} />
      <div style={{ position: 'absolute', left: 10 * s, top: 62 * s, width: 44 * s, height: 40 * s, borderRadius: 10 * s, background: 'rgba(255,255,255,.85)' }} />
      <Shine w={18 * s} h={70 * s} x={8 * s} y={34 * s} />
    </div>
  );
}
function SchoolBag({ s = 1 }) {
  return (
    <div style={{ position: 'relative', width: 170 * s, height: 190 * s }}>
      <div style={{ position: 'absolute', left: 58 * s, top: -14 * s, width: 54 * s, height: 30 * s, borderRadius: 16 * s, border: `${10 * s}px solid #b3452b`, borderBottom: 'none', borderRadius: `${20 * s}px ${20 * s}px 0 0` }} />
      <div style={{ position: 'absolute', left: 14 * s, top: 24 * s, width: 26 * s, height: 130 * s, borderRadius: 14 * s, background: 'linear-gradient(90deg,#a03e26,#c85335)', boxShadow: 'inset 0 -8px 10px rgba(0,0,0,.25)' }} />
      <div style={{ position: 'absolute', right: 14 * s, top: 24 * s, width: 26 * s, height: 130 * s, borderRadius: 14 * s, background: 'linear-gradient(90deg,#c85335,#a03e26)', boxShadow: 'inset 0 -8px 10px rgba(0,0,0,.25)' }} />
      <div style={{ position: 'absolute', left: 0, top: 8 * s, width: 170 * s, height: 176 * s, borderRadius: `${52 * s}px ${52 * s}px ${34 * s}px ${34 * s}px`, background: 'radial-gradient(circle at 34% 24%, #ff8a5f, #e8603a 45%, #b8431f 100%)', boxShadow: 'inset 0 8px 14px rgba(255,255,255,.4), inset 0 -14px 20px rgba(90,20,0,.4), 0 14px 20px rgba(60,20,0,.3)' }} />
      <div style={{ position: 'absolute', left: 30 * s, top: 84 * s, width: 110 * s, height: 84 * s, borderRadius: `${26 * s}px ${26 * s}px ${24 * s}px ${24 * s}px`, background: 'radial-gradient(circle at 36% 26%, #ffd27a, #f4a83a 55%, #cf831b)', boxShadow: 'inset 0 4px 8px rgba(255,255,255,.5), inset 0 -8px 12px rgba(120,60,0,.35)' }} />
      <div style={{ position: 'absolute', left: 30 * s, top: 108 * s, width: 110 * s, height: 8 * s, background: 'rgba(120,60,0,.35)', borderRadius: 4 * s }} />
      <div style={{ position: 'absolute', left: 74 * s, top: 100 * s, width: 22 * s, height: 22 * s, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #fff, #d8d8e6 60%)', boxShadow: '0 3px 5px rgba(0,0,0,.25)' }} />
      <Shine w={64 * s} h={44 * s} x={22 * s} y={20 * s} o={0.45} />
    </div>
  );
}
function WaterDrop({ s = 1, glow = 0, color = '#3B70C5' }) {
  return (
    <div style={{ position: 'relative', width: 70 * s, height: 70 * s }}>
      {glow > 0 && <div style={{ position: 'absolute', left: '50%', top: '50%', width: (170 + 240 * glow) * s, height: (170 + 240 * glow) * s, transform: 'translate(-50%,-50%)', borderRadius: '50%', border: `${6 * s}px solid rgba(91,196,196,${0.7 * glow})`, boxShadow: `0 0 ${60 * glow}px rgba(91,196,196,${0.8 * glow}), inset 0 0 ${40 * glow}px rgba(120,200,255,${0.5 * glow})`, pointerEvents: 'none' }} />}
      <div style={{ position: 'absolute', left: 8 * s, top: 6 * s, width: 54 * s, height: 54 * s, borderRadius: '4% 50% 50% 50%', transform: 'rotate(45deg)', background: `radial-gradient(circle at 38% 34%, #9fd4ff, ${color} 60%, #234a8f)`, boxShadow: `inset 0 4px 8px rgba(255,255,255,.6), inset 0 -6px 10px rgba(10,30,90,.5), 0 6px 12px rgba(20,40,120,.35), 0 0 ${14 + 40 * glow}px rgba(120,190,255,${0.35 + 0.6 * glow})` }} />
      <div style={{ position: 'absolute', left: 22 * s, top: 20 * s, width: 14 * s, height: 18 * s, borderRadius: '50%', background: 'rgba(255,255,255,.8)', transform: 'rotate(-20deg)' }} />
    </div>
  );
}
function Sparkle({ x, y, s, o, c = '#bfe8ff' }) {
  return <div style={{ position: 'absolute', left: x, top: y, width: 18 * s, height: 18 * s, transform: 'translate(-50%,-50%) rotate(45deg)', borderRadius: 4, background: `radial-gradient(circle, #fff, ${c} 70%)`, boxShadow: `0 0 ${16 * s}px ${c}`, opacity: o }} />;
}

/* ---------- teacher avatar ---------- */
function Teacher({ s = 1 }) {
  return (
    <div style={{ position: 'relative', width: 76 * s, height: 76 * s, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #fff, #e8ecf8 70%)', boxShadow: 'inset 0 -4px 8px rgba(71,70,160,.2), 0 4px 8px rgba(120,70,0,.3)', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 14 * s, top: 12 * s, width: 48 * s, height: 50 * s, borderRadius: '50% 50% 46% 46%', background: 'radial-gradient(circle at 40% 35%, #ffd9b3, #f2b98a 75%)' }} />
      <div style={{ position: 'absolute', left: 12 * s, top: 6 * s, width: 52 * s, height: 26 * s, borderRadius: '50% 50% 20% 20%', background: 'linear-gradient(180deg,#4a3222,#2e1e12)' }} />
      <div style={{ position: 'absolute', left: 26 * s, top: 32 * s, width: 7 * s, height: 9 * s, borderRadius: '50%', background: '#2e2233' }} />
      <div style={{ position: 'absolute', left: 44 * s, top: 32 * s, width: 7 * s, height: 9 * s, borderRadius: '50%', background: '#2e2233' }} />
      <div style={{ position: 'absolute', left: 30 * s, top: 46 * s, width: 18 * s, height: 9 * s, borderRadius: `0 0 ${12 * s}px ${12 * s}px`, background: '#c4553f' }} />
      <div style={{ position: 'absolute', left: 8 * s, top: 60 * s, width: 60 * s, height: 26 * s, borderRadius: `${18 * s}px ${18 * s}px 0 0`, background: 'linear-gradient(180deg,#4746A0,#3a3a86)' }} />
    </div>
  );
}

/* ---------- gameplay page (the locked layout, both levels) ---------- */
function Pan({ x, y, children }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0 }}>
      <div style={{ position: 'absolute', left: -3, top: 0, width: 6, height: 128, background: 'linear-gradient(180deg,#6b6bb8,#4746A0)', transform: 'rotate(26deg)', transformOrigin: 'top center', borderRadius: 3 }} />
      <div style={{ position: 'absolute', left: -3, top: 0, width: 6, height: 128, background: 'linear-gradient(180deg,#6b6bb8,#4746A0)', transform: 'rotate(-26deg)', transformOrigin: 'top center', borderRadius: 3 }} />
      <div style={{ position: 'absolute', left: -130, top: 96, width: 260, height: 54, borderRadius: '0 0 130px 130px', background: 'radial-gradient(ellipse at 50% 0%, #7c7cd0, #4746A0 60%, #32316f)', boxShadow: 'inset 0 6px 10px rgba(255,255,255,.35), inset 0 -8px 12px rgba(20,20,60,.5), 0 16px 22px rgba(60,20,0,.35)' }} />
      <div style={{ position: 'absolute', left: -110, top: 108, width: 220, height: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 6 }}>{children}</div>
    </div>
  );
}
function GamePage({ level, tilt = 0, bounce = 1, iconGlow = 0, waveColor = '#3B70C5', bag = null, pop = null }) {
  const popS = (i) => pop == null ? 1 : 0.001 + 0.999 * Easing.easeOutBack(seg(pop, 0.05 + i * 0.11, 0.42 + i * 0.11));
  const popW = (i, child) => <div key={i} style={{ transform: `scale(${popS(i)})`, transformOrigin: 'bottom center' }}>{child}</div>;
  const a = (tilt * Math.PI) / 180, px = 960, py = 430, arm = 330;
  const lx = px - arm * Math.cos(a), ly = py - arm * Math.sin(a);
  const rx = px + arm * Math.cos(a), ry = py + arm * Math.sin(a);
  const beamTilt = tilt;
  const L1 = level === 1;
  const instruction = L1 ? 'Which side is heavier? Watch the scale!' : 'Level 2 · Balance the book and the water bottle!';
  const frame = (side) => (
    <div style={{ position: 'absolute', top: 200, [side]: 64, width: 350, height: 660, borderRadius: 28, background: 'rgba(255,255,255,.94)', border: '9px solid #3B70C5', boxShadow: 'inset 0 0 0 5px rgba(120,170,240,.5), 0 14px 24px rgba(60,20,0,.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, padding: '26px 16px' }}>
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 27, color: '#3B70C5', background: '#e7effc', borderRadius: 999, padding: '6px 24px' }}>{side === 'left' ? 'Tray A' : 'Tray B'}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 22, alignItems: 'center', justifyContent: 'center', paddingTop: 12 }}>
        {(L1
          ? (side === 'left' ? [<Apple key="a" s={0.9} />, <Block key="b" c="#2CB64E" letter="B" />] : [<Block key="a" letter="C" />, <Block key="b" c="#f4a83a" letter="D" />, <Apple key="c" s={0.75} />])
          : (side === 'left' ? [<Book key="a" s={0.9} />, <Bottle key="b" s={0.8} />] : [<Bottle key="a" s={0.9} />, <Book key="b" s={0.75} />])
        ).map((c, i) => popW(i + (side === 'left' ? 0 : 2), c))}
      </div>
    </div>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `rotate(${tilt * 0}deg) scale(${bounce})`, transformOrigin: '50% 60%', overflow: 'hidden', background: 'linear-gradient(180deg,#b07a45 0%,#9a6435 45%,#82502a 100%)' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(180deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 118px, rgba(60,30,5,.28) 118px, rgba(60,30,5,.28) 124px), repeating-linear-gradient(90deg, rgba(255,220,170,.05) 0px, rgba(255,220,170,.05) 3px, rgba(0,0,0,0) 3px, rgba(0,0,0,0) 90px)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 35%, rgba(255,235,200,.16), rgba(40,15,0,.34) 90%)' }} />
      {/* yellow instruction bar */}
      <div style={{ position: 'absolute', left: '50%', top: 40, transform: 'translateX(-50%)', width: 1340, height: 108, borderRadius: 54, background: 'linear-gradient(180deg,#ffd95e,#ffc22e)', boxShadow: 'inset 0 5px 8px rgba(255,255,255,.6), inset 0 -8px 12px rgba(160,100,0,.35), 0 12px 22px rgba(60,20,0,.35)', display: 'flex', alignItems: 'center', gap: 26, padding: '0 24px' }}>
        <Teacher />
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 38, color: '#5b3a12', textShadow: '0 1px 0 rgba(255,255,255,.5)' }}>{instruction}</div>
        <div style={{ marginLeft: 'auto', fontFamily: FONT, fontWeight: 800, fontSize: 30, color: '#fff', background: L1 ? '#3B70C5' : '#2CB64E', borderRadius: 999, padding: '8px 28px', boxShadow: 'inset 0 3px 5px rgba(255,255,255,.4), 0 5px 8px rgba(60,20,0,.25)' }}>{L1 ? 'Level 1' : 'Level 2'}</div>
      </div>
      {frame('left')}
      {frame('right')}
      {/* balance scale */}
      <div style={{ position: 'absolute', left: 936, top: py, width: 48, height: 470, background: 'linear-gradient(90deg,#5a59b0,#4746A0 45%,#32316f)', borderRadius: 24, boxShadow: 'inset 4px 0 6px rgba(255,255,255,.3), 8px 10px 16px rgba(60,20,0,.3)' }} />
      <div style={{ position: 'absolute', left: 810, top: 872, width: 300, height: 64, borderRadius: '50%', background: 'radial-gradient(ellipse at 45% 30%, #5a59b0, #3a3a86 60%, #29285c)', boxShadow: 'inset 0 6px 10px rgba(255,255,255,.3), 0 14px 20px rgba(40,10,0,.4)' }} />
      <div style={{ position: 'absolute', left: px - arm - 20, top: py - 14, width: (arm + 20) * 2, height: 28, borderRadius: 14, background: 'linear-gradient(180deg,#6b6bb8,#4746A0 55%,#33327a)', boxShadow: 'inset 0 4px 6px rgba(255,255,255,.35), 0 8px 14px rgba(60,20,0,.3)', transform: `rotate(${beamTilt}deg)`, transformOrigin: '50% 50%' }} />
      <Pan x={lx} y={ly}>{popW(0, L1 ? <Apple s={0.95} /> : <Book />)}</Pan>
      <Pan x={rx} y={ry}>{popW(1, L1 ? <span style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}><Block letter="A" /><Block c="#2CB64E" letter="B" s={0.85} /></span> : <Bottle />)}</Pan>
      <div style={{ position: 'absolute', left: px - 35, top: py - 92 }}><WaterDrop glow={iconGlow} color={waveColor} /></div>
      {bag}
    </div>
  );
}

/* ---------- magic wave overlay ---------- */
function MagicWave({ p, color = '#3B70C5', cx = 960, cy = 370, rot = 0 }) {
  if (p <= 0.001) return null;
  const rings = [0, 1, 2, 3, 4].map((i) => {
    const r = Math.max(0, p * (1250 + i * 160) - i * 170);
    if (r < 4) return null;
    return <div key={i} style={{ position: 'absolute', left: cx - r, top: cy - r, width: r * 2, height: r * 2, borderRadius: '50%', border: `${26 - i * 3}px solid rgba(140,215,255,${0.5 - i * 0.06})`, boxShadow: `0 0 60px rgba(91,196,196,.55), inset 0 0 80px rgba(120,190,255,.35)`, background: `radial-gradient(circle, rgba(120,190,255,${0.05 + 0.03 * i}) 60%, rgba(59,112,197,${0.16}) 100%)` }} />;
  });
  const stars = [...Array(10)].map((_, i) => {
    const ang = (i / 10) * Math.PI * 2 + i * 0.7;
    const d = p * (420 + (i % 3) * 260);
    return <Sparkle key={i} x={cx + Math.cos(ang) * d} y={cy + Math.sin(ang) * d * 0.72} s={0.7 + (i % 3) * 0.4} o={clamp(p * 2, 0, 0.9)} />;
  });
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: cx, top: cy, width: p * 2600, height: p * 2600, transform: 'translate(-50%,-50%)', borderRadius: '50%', background: `radial-gradient(circle, rgba(190,235,255,${0.9 * clamp(p * 1.4, 0, 1)}) 0%, ${color}e6 38%, rgba(59,112,197,${0.85 * clamp(p * 1.2, 0, 1)}) 62%, rgba(59,112,197,0) 78%)`, filter: 'blur(2px)' }} />
      {rings}
      <div style={{ position: 'absolute', inset: 0, transform: `rotate(${rot}deg)`, transformOrigin: `${cx}px ${cy}px` }}>{stars}</div>
    </div>
  );
}

/* ---------- scenes ---------- */
function SceneDrop({ tweaks }) {
  const { progress: p } = useScene();
  const E = Easing;
  const fall = E.easeInQuad(seg(p, 0.1, 0.5));
  const bagX = 1320 - 120 * fall, bagYf = -280 + 1000 * fall;
  const b = seg(p, 0.5, 0.68);
  const bagY = p < 0.5 ? bagYf : 720 - 80 * Math.sin(Math.PI * b);
  const rot = p < 0.5 ? 24 - 30 * fall : -6 + 6 * seg(p, 0.5, 0.8);
  const k = seg(p, 0.5, 0.62);
  const sq = p < 0.5 ? 1 : 0.8 + 0.2 * E.easeOutBack(k);
  const x = seg(p, 0.5, 1);
  const amp = tweaks.tiltDeg ?? 5.5;
  const tilt = x > 0 ? amp * Math.exp(-3 * x) * Math.sin(x * Math.PI * 2.2) * (1 - seg(p, 0.9, 1)) : 0;
  const near = clamp((bagY + 280) / 1000, 0, 1);
  const dust = x > 0 && x < 0.5 ? [...Array(6)].map((_, i) => {
    const ang = Math.PI + (i / 5) * Math.PI;
    const dp = Easing.easeOutCubic(seg(x, 0, 0.45));
    return <div key={i} style={{ position: 'absolute', left: 1285 + Math.cos(ang) * dp * (120 + i * 30), top: 900 - Math.abs(Math.sin(ang)) * dp * (60 + i * 14), width: 46 - i * 4, height: 30 - i * 2, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(230,200,160,.55), rgba(230,200,160,0) 70%)', opacity: (1 - dp) * 0.9, filter: 'blur(3px)' }} />;
  }) : null;
  const trail = p > 0.14 && p < 0.5 ? [1, 2, 3].map((i) => {
    const tp = E.easeInQuad(seg(p - 0.035 * i, 0.1, 0.5));
    return <div key={i} style={{ position: 'absolute', left: 1320 - 120 * tp, top: -280 + 1000 * tp, opacity: 0.16 - i * 0.045, filter: 'blur(6px)', transform: `rotate(${24 - 30 * tp}deg)` }}><SchoolBag /></div>;
  }) : null;
  const bag = (
    <div>
      {p > 0.16 && <div style={{ position: 'absolute', left: 1145, top: 890, width: 300 * (0.4 + 0.6 * near), height: 60 * (0.4 + 0.6 * near), borderRadius: '50%', background: `radial-gradient(ellipse, rgba(30,10,0,${0.38 * near}), rgba(30,10,0,0) 70%)`, filter: 'blur(4px)' }} />}
      {trail}
      {p > 0.1 && <div style={{ position: 'absolute', left: bagX, top: bagY, transform: `rotate(${rot}deg) scale(1,${sq})`, transformOrigin: 'bottom center', filter: p < 0.5 ? 'blur(0.6px)' : 'none' }}><SchoolBag /></div>}
      {dust}
    </div>
  );
  const zoom = 1 + (x > 0 ? 0.05 * Math.exp(-3.5 * x) * (1 - seg(p, 0.9, 1)) : 0);
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `rotate(${tilt}deg) scale(${zoom})`, transformOrigin: '62% 75%' }}>
      <GamePage level={1} tilt={-4 + 1.5 * Math.sin(p * Math.PI)} waveColor={tweaks.waveColor} bag={bag} />
    </div>
  );
}
function SceneWave({ tweaks }) {
  const { progress: p } = useScene();
  const charge = seg(p, 0, 0.3);
  const wp = Easing.easeOutCubic(seg(p, 0.3, 0.85));
  const burst = seg(p, 0.3, 1);
  const flash = Math.sin(Math.PI * seg(p, 0.28, 0.46)) * 0.55;
  const shake = burst > 0 ? 10 * Math.exp(-6 * burst) * Math.sin(burst * 42) : 0;
  const suck = charge > 0 && charge < 1 ? [...Array(8)].map((_, i) => {
    const ang = (i / 8) * Math.PI * 2 + 1.2;
    const d = (1 - Easing.easeInCubic(charge)) * (300 + (i % 3) * 120) + 40;
    return <Sparkle key={i} x={960 + Math.cos(ang) * d} y={370 + Math.sin(ang) * d * 0.75} s={0.6 + (i % 3) * 0.3} o={Math.sin(Math.PI * charge) * 0.9} />;
  }) : null;
  const zoomIn = 1 + 0.04 * Easing.easeInOutCubic(charge) * (1 - seg(p, 0.3, 0.5));
  const bag = <div style={{ position: 'absolute', left: 1145, top: 890, width: 300, height: 60, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(30,10,0,.38), rgba(30,10,0,0) 70%)', filter: 'blur(4px)' }}><div style={{ position: 'absolute', left: 55, top: -170 }}><SchoolBag /></div></div>;
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translate(${shake}px,${-shake * 0.6}px) scale(${zoomIn})`, transformOrigin: '50% 40%' }}>
      <GamePage level={1} tilt={-4} iconGlow={Easing.easeInCubic(charge) * (1 - wp)} waveColor={tweaks.waveColor} bag={bag} />
      {suck}
      <MagicWave p={wp * 0.92} color={tweaks.waveColor} rot={p * 150} />
      {flash > 0.01 && <div style={{ position: 'absolute', inset: 0, background: '#eaf6ff', opacity: flash, pointerEvents: 'none' }} />}
    </div>
  );
}
function SceneReveal({ tweaks }) {
  const { progress: p } = useScene();
  const wp = 0.92 * (1 - Easing.easeInOutCubic(seg(p, 0, 0.42)));
  const glow = Math.sin(Math.PI * seg(p, 0.3, 0.75)) * 0.9;
  const x = seg(p, 0.34, 1);
  const bounce = 1 + (x > 0 ? 0.014 * Math.exp(-3.4 * x) * Math.sin(x * Math.PI * 2.4) * (1 - seg(p, 0.9, 1)) : 0);
  const sp = seg(p, 0.35, 0.85);
  const sparkles = sp > 0 && sp < 1 ? [...Array(7)].map((_, i) => {
    const ang = (i / 7) * Math.PI * 2 + 0.5;
    const d = 90 + Easing.easeOutCubic(sp) * 150;
    return <Sparkle key={i} x={960 + Math.cos(ang) * d} y={370 + Math.sin(ang) * d * 0.8} s={0.9} o={Math.sin(Math.PI * sp) * 0.9} c="#8fe0d8" />;
  }) : null;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <GamePage level={2} tilt={2.5} bounce={bounce} iconGlow={glow} waveColor={tweaks.waveColor} pop={seg(p, 0.15, 0.75)} />
      {sparkles}
      <MagicWave p={wp} color={tweaks.waveColor} rot={150 + p * 60} />
    </div>
  );
}

/* ---------- app ---------- */
function TransitionApp() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  const wrap = (C) => (props) => <C {...props} tweaks={t} />;
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0E0E30' }}>
      <SceneStage width={1920} height={1080} bg="#82502a" scenes={window.OM_SCENES} playback={window.OM_PLAYBACK}>
        {{ 'Object Drop': wrap(SceneDrop), 'Magic Wave': wrap(SceneWave), 'Next Level': wrap(SceneReveal) }}
      </SceneStage>
      <TweaksPanel>
        <TweakSection label="Transition" />
        <TweakSlider label="Tilt intensity" value={t.tiltDeg} min={2} max={10} step={0.5} unit="°" onChange={(v) => setTweak('tiltDeg', v)} />
        <TweakColor label="Wave color" value={t.waveColor} options={['#3B70C5', '#5BC4C4', '#4746A0']} onChange={(v) => setTweak('waveColor', v)} />
        <TweakSection label="Editor" />
        <TweakToggle label="Motion editor" value={t.motionEditor} onChange={(v) => setTweak('motionEditor', v)} />
      </TweaksPanel>
    </div>
  );
}
window.TransitionApp = TransitionApp;
