import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';

/* ─────────────────────────────────────────────── HOOKS */
function useCountUp(target, duration = 2000, trigger = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let cancelled = false;
    const t0 = performance.now();
    const tick = (now) => {
      if (cancelled) return;
      const p = Math.min((now - t0) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setValue(Math.floor(e * target));
      if (p < 1) requestAnimationFrame(tick);
      else setValue(target);
    };
    requestAnimationFrame(tick);
    return () => { cancelled = true; };
  }, [target, duration, trigger]);
  return value;
}

function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ─────────────────────────────────────────────── SUNWARD MARK */
function SunwardMark({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      {[...Array(16)].map((_, i) => {
        const main = i % 2 === 0;
        return (
          <g key={i} transform={`rotate(${i * 22.5} 50 50)`}>
            <ellipse
              cx="50" cy={main ? 21 : 24}
              rx={main ? 4.5 : 3}
              ry={main ? 13 : 9}
              fill={main ? '#F4B41A' : '#EAB308'}
              opacity={main ? 1 : 0.72}
            />
          </g>
        );
      })}
      <circle cx="50" cy="50" r="23" fill="#0B0D10" />
      <circle cx="50" cy="50" r="18.5" stroke="#F4B41A" strokeWidth="0.6" strokeOpacity="0.30" fill="none" />
      <circle cx="50" cy="50" r="13"   stroke="#F4B41A" strokeWidth="0.4" strokeOpacity="0.18" fill="none" />
      <polygon points="50,36 47.5,50.5 50,48.5 52.5,50.5" fill="#F4B41A" />
      <polygon points="50,64 47.5,49.5 50,51.5 52.5,49.5" fill="rgba(255,255,255,0.28)" />
      <circle cx="50" cy="50" r="2.5" fill="#F4B41A" />
      <circle cx="50" cy="33.5" r="1.4" fill="#F4B41A" />
    </svg>
  );
}

/* ─────────────────────────────────────────────── HERO CANVAS
   Three-act entrance + coda:
   Act 1 (preintro) — one dramatic shooting star BL → TR (~2.5 s)
   Act 2 (bloom)    — North Star blooms at its landing point (~1.5 s)
   Act 3 (main)     — 3 slower follower stars sweep same path (~3 s)
   Coda             — North Star pulses gently, continuous           */
function HeroCanvas3D() {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const FL     = 480;
    const Z_FAR  = 800;
    const Z_KILL = -80;
    const TRAIL  = 30;

    const BLOOM_DUR  = 52;   // frames for the North Star bloom (~0.85 s)
    const MAIN_POOL  = 4;    // continuous pool size

    let tick      = 0;
    let phase     = 'preintro';  // → 'bloom' → 'main' → 'coda'
    let bloomTick = 0;
    let mainTick  = 0;
    let northX    = 0;
    let northY    = 0;
    let piStar    = null;
    const mainStars = [];
    let W0 = 0, H0 = 0;

    /* ── star factories ─────────────────────────────────────────── */
    function makePreIntroStar(W, H) {
      const z  = Z_FAR * 0.35;
      const s0 = FL / (FL + z);
      const sF = FL / (FL + Z_KILL);
      const spx = W * (0.04 + Math.random() * 0.08);
      const spy = H * (0.78 + Math.random() * 0.14);
      const epx = W * 0.74;   // fixed North Star landing X
      const epy = H * 0.14;   // fixed North Star landing Y
      northX = epx; northY = epy;
      const wx0 = (spx - W * 0.5) / s0;
      const wy0 = (spy - H * 0.5) / s0;
      const wxF = (epx - W * 0.5) / sF;
      const wyF = (epy - H * 0.5) / sF;
      const maxLife = 68;
      return {
        wx: wx0, wy: wy0, wz: z,
        vx: (wxF - wx0) / maxLife,
        vy: (wyF - wy0) / maxLife,
        vz: (Z_KILL - z) / maxLife,
        trail: [], life: maxLife, maxLife,
        sz: 26, hue: true,
      };
    }

    function makeMainStar(W, H, ageOffset) {
      // Single lane: bottom-left → top-right, consistent with preintro direction
      const z  = Z_FAR * (0.22 + Math.random() * 0.38);
      const s0 = FL / (FL + z);
      const sF = FL / (FL + Z_KILL);
      const spx = W * (0.01 + Math.random() * 0.16);
      const spy = H * (0.70 + Math.random() * 0.26);
      const epx = W * (0.64 + Math.random() * 0.28);
      const epy = H * (-0.05 + Math.random() * 0.13);
      const wx0 = (spx - W * 0.5) / s0;
      const wy0 = (spy - H * 0.5) / s0;
      const wxF = (epx - W * 0.5) / sF;
      const wyF = (epy - H * 0.5) / sF;
      const maxLife = 118 + Math.floor(Math.random() * 22);
      const aged    = Math.floor((ageOffset || 0) * maxLife);
      return {
        wx: wx0 + (wxF - wx0) * aged / maxLife,
        wy: wy0 + (wyF - wy0) * aged / maxLife,
        wz: z   + (Z_KILL - z) * aged / maxLife,
        vx: (wxF - wx0) / maxLife,
        vy: (wyF - wy0) / maxLife,
        vz: (Z_KILL - z) / maxLife,
        trail: [], life: maxLife - aged, maxLife,
        sz: 11 + Math.random() * 7,
        hue: Math.random() < 0.55,
      };
    }

    /* ── draw helpers ───────────────────────────────────────────── */
    function draw4pt(ctx, cx, cy, R, alpha, hue, gMult, gAlpha) {
      if (R < 0.4) return;
      const r   = R * 0.26;
      const col = hue ? '244,180,26' : '234,179,8';
      const gr  = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * gMult);
      gr.addColorStop(0,   `rgba(${col},${(alpha * gAlpha).toFixed(3)})`);
      gr.addColorStop(0.5, `rgba(${col},${(alpha * gAlpha * 0.28).toFixed(3)})`);
      gr.addColorStop(1,   `rgba(${col},0)`);
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.arc(cx, cy, R * gMult, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const θ = i * Math.PI * 0.25;
        const ρ = i % 2 === 0 ? R : r;
        const x = cx + Math.cos(θ) * ρ;
        const y = cy + Math.sin(θ) * ρ;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = `rgba(${col},${(alpha * 0.92).toFixed(3)})`;
      ctx.fill();
    }

    function renderStar(ctx, s) {
      const tLen = s.trail.length;
      if (tLen < 2) return;
      const pct = s.life / s.maxLife;
      const bri = pct > 0.92 ? (1 - pct) / 0.08
                : pct > 0.12 ? 1.0
                : pct / 0.12;
      for (let t = 1; t < tLen; t++) {
        const [ax, ay]      = s.trail[t - 1];
        const [bx, by, bsc] = s.trail[t];
        const p    = t / tLen;
        const segA = Math.pow(p, 1.4) * bri * 0.76;
        const col  = s.hue ? '244,180,26' : '234,179,8';
        const gl   = ctx.createLinearGradient(ax, ay, bx, by);
        gl.addColorStop(0, `rgba(${col},0)`);
        gl.addColorStop(1, `rgba(${col},${Math.min(1, segA).toFixed(3)})`);
        ctx.strokeStyle = gl;
        ctx.lineWidth   = Math.max(0.5, Math.pow(p, 0.60) * s.sz * bsc * 1.10);
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      }
      const [hx, hy, hsc] = s.trail[tLen - 1];
      draw4pt(ctx, hx, hy, Math.max(1.0, s.sz * hsc * 0.85), bri, s.hue, 3.0, 0.28);
    }

    function stepStar(s, W, H) {
      const dz = FL + s.wz;
      if (dz > 1) {
        const sc = FL / dz;
        s.trail.push([s.wx * sc + W * 0.5, s.wy * sc + H * 0.5, sc]);
        if (s.trail.length > TRAIL) s.trail.shift();
      }
      s.wx += s.vx; s.wy += s.vy; s.wz += s.vz; s.life--;
    }

    function drawNorthStar(ctx, bx, by, t) {
      const bp = Math.min(1, t / BLOOM_DUR);
      // Three expanding rings during bloom
      if (bp < 1) {
        for (let k = 0; k < 3; k++) {
          const rP = Math.max(0, (bp - k * 0.18) / (1 - k * 0.18));
          const ringR = rP * 130;
          const ringA = (1 - rP) * 0.48;
          if (ringA > 0.005 && ringR > 0.5) {
            ctx.beginPath();
            ctx.arc(bx, by, ringR, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(244,180,26,${ringA.toFixed(3)})`;
            ctx.lineWidth = 2.2 * (1 - rP);
            ctx.stroke();
          }
        }
      }
      // Persistent radial glow behind the star
      const glowR = 55 + (phase !== 'bloom' ? 12 * Math.sin(t * 0.055) : 0);
      const ga = bp * (phase === 'bloom' ? 0.18 : 0.12 + 0.06 * Math.sin(t * 0.055));
      if (ga > 0.005) {
        const gr = ctx.createRadialGradient(bx, by, 0, bx, by, glowR);
        gr.addColorStop(0,   `rgba(244,180,26,${ga.toFixed(3)})`);
        gr.addColorStop(0.5, `rgba(244,180,26,${(ga * 0.35).toFixed(3)})`);
        gr.addColorStop(1,   'rgba(244,180,26,0)');
        ctx.fillStyle = gr;
        ctx.beginPath(); ctx.arc(bx, by, glowR, 0, Math.PI * 2); ctx.fill();
      }
      // 4-point star — grows in during bloom, pulses gently in coda
      const starP = Math.min(1, bp * 2.0);
      const pulse = phase === 'bloom' ? 1.0 : 0.60 + 0.40 * Math.sin(t * 0.055);
      const starR = (20 + pulse * 8) * starP;
      const starA = Math.min(1, starP * 2.2) * (0.75 + pulse * 0.25);
      if (starR > 0.4) draw4pt(ctx, bx, by, starR, starA, true, 4.5, 0.44);
    }

    /* ── render loop ────────────────────────────────────────────── */
    function frame() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W   = canvas.clientWidth;
      const H   = canvas.clientHeight;
      if (!W || !H) { rafRef.current = requestAnimationFrame(frame); return; }
      const cW = Math.round(W * dpr);
      const cH = Math.round(H * dpr);
      if (canvas.width !== cW || canvas.height !== cH) {
        canvas.width = cW; canvas.height = cH;
      }
      if (W !== W0 || H !== H0) {
        tick = 0; bloomTick = 0; mainTick = 0;
        phase = 'preintro';
        mainStars.length = 0;
        piStar = makePreIntroStar(W, H);
        W0 = W; H0 = H;
      }

      const ctx = canvas.getContext('2d');
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, W, H);
      ctx.lineCap  = 'round';
      ctx.lineJoin = 'round';
      tick++;

      if (phase === 'preintro') {
        stepStar(piStar, W, H);
        renderStar(ctx, piStar);
        if (piStar.life <= 0 || piStar.wz < Z_KILL) {
          if (piStar.trail.length > 0)
            [northX, northY] = piStar.trail[piStar.trail.length - 1];
          phase = 'bloom'; bloomTick = 0;
        }

      } else if (phase === 'bloom') {
        bloomTick++;
        drawNorthStar(ctx, northX, northY, bloomTick);
        if (bloomTick >= BLOOM_DUR) {
          phase = 'main'; mainTick = 0;
          for (let i = 0; i < MAIN_POOL; i++)
            mainStars.push(makeMainStar(W, H, Math.random()));
        }

      } else {
        // main — continuous pool, North Star glows throughout
        mainTick++;
        drawNorthStar(ctx, northX, northY, BLOOM_DUR + mainTick);
        for (let i = 0; i < mainStars.length; i++) {
          const s = mainStars[i];
          stepStar(s, W, H);
          if (s.life <= 0 || s.wz < Z_KILL) {
            mainStars[i] = makeMainStar(W, H, 0);
            continue;
          }
          renderStar(ctx, s);
        }
      }

      ctx.restore();
      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
    />
  );
}

/* ─────────────────────────────────────────────── TEAM SECTION */
function TeamSection() {
  const sectionRef = useRef(null);
  // progress: 0 = section entering from bottom, 0.5 = section centred, 1 = section exiting top
  const [progress, setProgress] = useState(0.5);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const raw  = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      setProgress(Math.max(0, Math.min(1, raw)));
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // offset: -0.5 when entering → 0 when centred → +0.5 when exiting
  const offset = progress - 0.5;

  const trackBase = {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '18vw',
    fontWeight: 900,
    letterSpacing: '-0.02em',
    lineHeight: 1,
    color: 'rgba(26,37,64,0.12)',
    WebkitTextStroke: 'none',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    display: 'block',
    width: '100%',
    textAlign: 'center',
    willChange: 'transform',
  };

  return (
    <section
      id="team-band"
      ref={sectionRef}
      className="scroll-mt-[64px] relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0B1629 0%, #1A2D4E 10%, rgba(26,37,64,0.18) 32%, #EFECE6 52%, #EAE5D8 65%, #FDFBF7 100%)',
      }}
    >
      {/* ── "OUR" / "TEAM" scroll-motion background text ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden pointer-events-none select-none"
        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.5rem' }}
      >
        {/* OUR — rests on RIGHT when section centred, drifts further right on scroll */}
        <span
          style={{
            ...trackBase,
            color: 'rgba(26,37,64,0.18)',
            transform: `translateX(calc(20vw + ${offset * 50}vw))`,
          }}
        >
          OUR
        </span>
        {/* TEAM — rests on LEFT when section centred, drifts further left on scroll */}
        <span
          style={{
            ...trackBase,
            color: 'rgba(26,37,64,0.18)',
            transform: `translateX(calc(-20vw + ${-offset * 50}vw))`,
          }}
        >
          TEAM
        </span>
      </div>

      {/* Edge vignettes */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background:
            'linear-gradient(to right, #0B1629 0%, transparent 7%, transparent 93%, #0B1629 100%)',
        }}
      />

      <div className="relative z-10 px-6 md:px-14 xl:px-20 py-14">

        {/* ── Section header ── */}
        <div className="max-w-[1440px] mx-auto mb-10">
          <div className="flex items-center gap-4 mb-6">
            <span className="w-8 h-px" style={{ background: '#F4B41A' }} />
            <span
              className="font-sans text-[10px] uppercase tracking-[0.3em]"
              style={{ color: 'rgba(255,255,255,0.42)' }}
            >
              The Team
            </span>
          </div>
          <h2
            className="font-serif font-semibold leading-[1.08] tracking-[-0.022em]"
            style={{ fontSize: 'clamp(2rem, 4.5vw, 4.2rem)', color: 'rgba(255,255,255,0.92)' }}
          >
            The people behind{' '}
            <span className="italic font-light" style={{ color: '#F4B41A' }}>Sunward.</span>
          </h2>
        </div>

        {/* ── Portrait grid ── */}
        <div className="flex flex-col sm:flex-row items-stretch justify-center gap-8 lg:gap-12 pb-8">

          {/* ── Card 1 — Baljeet Gujral ── */}
          <div
            className="group cursor-default flex flex-col overflow-hidden transition-all duration-500 ease-out hover:-translate-y-2"
            style={{
              width: '380px',
              maxWidth: '88vw',
              borderRadius: '2px',
              boxShadow: '0 2px 20px rgba(11,13,16,0.08), 0 12px 48px rgba(11,13,16,0.06)',
            }}
          >
            <div className="relative overflow-hidden flex-shrink-0" style={{ aspectRatio: '5/6' }}>
              <img
                src="/baljeet-gujral.png"
                alt="Baljeet Gujral"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                style={{ objectPosition: 'center 20%' }}
              />
              <div
                className="absolute top-0 left-0 right-0 h-[2px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"
                style={{ background: '#F4B41A' }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(to top, rgba(11,13,16,0.86) 0%, rgba(11,13,16,0.24) 38%, transparent 62%)',
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 px-6 pb-6">
                <span
                  className="font-sans text-[9px] uppercase tracking-[0.24em] font-semibold block mb-2"
                  style={{ color: '#F4B41A' }}
                >
                  Founder &amp; Strategic Advisor
                </span>
                <h3
                  className="font-serif text-white font-semibold leading-tight"
                  style={{ fontSize: '1.55rem' }}
                >
                  Baljeet Gujral
                </h3>
              </div>
            </div>

            <div
              className="px-6 py-6 flex flex-col gap-3 relative flex-1"
              style={{ background: '#FFFFFF', borderTop: '1px solid rgba(11,13,16,0.06)' }}
            >
              <span
                className="absolute left-0 top-0 bottom-0 w-[2px] origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out"
                style={{ background: '#F4B41A' }}
              />
              <p
                className="font-sans text-[9px] uppercase tracking-[0.14em] font-medium"
                style={{ color: 'rgba(11,13,16,0.30)' }}
              >
                Harvard · Stanford · Oxford · IIM Calcutta
              </p>
              <p
                className="font-sans text-[14px] font-light leading-[1.78]"
                style={{ color: 'rgba(11,13,16,0.66)' }}
              >
                15+ years turning ambitious ideas into real businesses. Built and scaled ventures across sales, strategy, and operations — partnering with early-stage startups and established companies scaling nationally. Founder of Enfield Riders and Bucket List Experiences.
              </p>
            </div>
          </div>

          {/* ── Card 2 — Dr. Suraj Kumar ── */}
          <div
            className="group cursor-default flex flex-col overflow-hidden transition-all duration-500 ease-out hover:-translate-y-2"
            style={{
              width: '380px',
              maxWidth: '88vw',
              borderRadius: '2px',
              boxShadow: '0 2px 20px rgba(11,13,16,0.08), 0 12px 48px rgba(11,13,16,0.06)',
            }}
          >
            <div className="relative overflow-hidden flex-shrink-0" style={{ aspectRatio: '5/6' }}>
              <img
                src="/dr-suraj-kumar.jpg"
                alt="Dr. Suraj Kumar"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                style={{ objectPosition: 'center 15%' }}
              />
              <div
                className="absolute top-0 left-0 right-0 h-[2px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"
                style={{ background: '#F4B41A' }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(to top, rgba(11,13,16,0.86) 0%, rgba(11,13,16,0.24) 38%, transparent 62%)',
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 px-6 pb-6">
                <span
                  className="font-sans text-[9px] uppercase tracking-[0.24em] font-semibold block mb-2"
                  style={{ color: '#F4B41A' }}
                >
                  PhD · Management · Research-Led Strategist
                </span>
                <h3
                  className="font-serif text-white font-semibold leading-tight"
                  style={{ fontSize: '1.55rem' }}
                >
                  Dr. Suraj Kumar
                </h3>
              </div>
            </div>

            <div
              className="px-6 py-6 flex flex-col gap-3 relative flex-1"
              style={{ background: '#FFFFFF', borderTop: '1px solid rgba(11,13,16,0.06)' }}
            >
              <span
                className="absolute left-0 top-0 bottom-0 w-[2px] origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out"
                style={{ background: '#F4B41A' }}
              />
              <p
                className="font-sans text-[9px] uppercase tracking-[0.14em] font-medium"
                style={{ color: 'rgba(11,13,16,0.30)' }}
              >
                India's Top 100 Young Leaders · 200+ Organisations
              </p>
              <p
                className="font-sans text-[14px] font-light leading-[1.78]"
                style={{ color: 'rgba(11,13,16,0.66)' }}
              >
                Combines academic rigour with entrepreneurial execution. Expertise spanning Entrepreneurship, Marketing, Org Behavior, and Innovation. Founder of The Dehradun Street — with over 200+ organisations collaborated with. Named among India's Top 100 Young Leaders.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────── FOUNDER CARD */
function FounderCard({ card }) {
  return (
    /* No card box — photo is the element, text floats below on the canvas */
    <div
      className="group relative flex-shrink-0 cursor-default"
      style={{ width: '340px', marginRight: '6px' }}
    >
      {/* Full-bleed portrait — no radius, no border, no shadow */}
      <div className="relative overflow-hidden" style={{ height: '450px' }}>
        <img
          src={card.photo}
          alt={card.founder}
          className="founder-card-photo w-full h-full object-cover"
          style={{ objectPosition: 'center top' }}
        />
        {/* Gold sweep line at bottom — slides in on hover */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#F4B41A] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"
        />
      </div>

      {/* Minimal text — sits directly on the page canvas */}
      <div className="pt-4 pb-2">
        <p
          className="font-serif font-semibold leading-tight mb-1"
          style={{ fontSize: '1.05rem', color: '#1A2540' }}
        >
          {card.founder}
        </p>
        <div className="flex items-center gap-2.5">
          <p
            className="font-sans text-[9.5px] uppercase tracking-[0.22em] font-medium"
            style={{ color: 'rgba(11,13,16,0.38)' }}
          >
            {card.company}
          </p>
          <img
            src={card.logo}
            alt=""
            aria-hidden="true"
            className="object-contain flex-shrink-0"
            style={{ height: '18px', width: 'auto', maxWidth: '52px', mixBlendMode: 'multiply', opacity: 0.65 }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────── FOUNDER TICKER */
const TICKER_CARDS = [
  {
    company: 'Kolkata Chai Company',
    founder:  'Ayan Sanyal',
    photo:    '/kolkata-chai-founder.jpg',
    logo:     '/kolkata-chai-logo.png',
    sector:   'Premium F&B',
  },
  {
    company: 'Mahati Wellness',
    founder:  'Aaditya Bhardwaj',
    photo:    '/mahati-founder.jpg',
    logo:     '/mahati-logo.png',
    sector:   'Wellness',
  },
  {
    company: 'Manam Chocolates',
    founder:  'Chaitanya Muppala',
    photo:    '/manam-chocolates-founder.jpg',
    logo:     '/manam-chocolates-logo.png',
    sector:   'Premium F&B',
  },
];

function FounderTicker() {
  // 4× repetition: translateX(-50%) = 2 full sets = seamless loop
  const track = [...TICKER_CARDS, ...TICKER_CARDS, ...TICKER_CARDS, ...TICKER_CARDS];

  return (
    /* No border, no label, no padding — photos flow directly from the hero canvas */
    <div className="overflow-hidden">
      <div className="marquee-track flex pb-14">
        {track.map((card, i) => (
          <FounderCard key={i} card={card} />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────── DATA */
const NAV_LINKS = [
  { label: 'About',    href: '#manifesto'    },
  { label: 'Services', href: '#portfolio'    },
  { label: 'Sectors',  href: '#portfolio'    },
  { label: 'Results',  href: '#case-studies' },
  { label: 'Our Team', href: '#team-band'    },
];

const FOUNDERS = [
  {
    index: '01',
    name: 'Baljeet Gujral',
    role: 'Founder & Strategic Advisor',
    credentials: 'Harvard  ·  Stanford  ·  Oxford  ·  IIM Calcutta',
    bio: 'With training across Harvard, Stanford, Oxford, and IIM Calcutta, Baljeet brings a rare convergence of global strategic thinking and ground-level operational precision. Over 15 years he has helped founders across India and Southeast Asia turn ambitious ideas into high-performing enterprises — navigating fundraising, scale, and entry into new markets.',
    photo: '/baljeet-gujral.png',
    photoPos: 'center 20%',
  },
  {
    index: '02',
    name: 'Dr. Suraj Kumar',
    role: 'Growth Systems Thinker',
    credentials: "PhD · Management  ·  India's Top 100 Young Leaders",
    bio: "Named among India's Top 100 Young Leaders and holding a PhD in Management, Suraj is the architect of the proprietary growth frameworks that power every Sunward engagement. He bridges academic rigour with sharp commercial instinct — building systems that don't just work in theory, but compound in practice.",
    photo: '/dr-suraj-kumar.jpg',
    photoPos: 'center 15%',
  },
];

const PORTFOLIO = [
  {
    tag: 'PREMIUM F&B · CASE STUDY',
    name: 'Manam Chocolates',
    logo: '/manam-chocolates.jpeg',
    teaser: 'Running on craft, not a system — until we fixed that.',
    blurb: "Manam is India's finest bean-to-bar chocolate brand. We helped them build a structured sales system and a store-by-store retail expansion playbook — turning exceptional craft into a scalable business.",
    details: [
      'Clarified brand positioning',
      'Built structured sales funnel',
      'Improved retail storytelling',
    ],
    outcome: 'Clear Growth Direction',
  },
  {
    tag: 'WELLNESS · CASE STUDY',
    name: 'Mahati Wellness',
    logo: '/mahati-wellness.jpg',
    teaser: 'Spreading thin across segments with no clear path to traction.',
    blurb: 'Mahati Wellness is a holistic health platform spanning yoga, nutrition, and mental wellness. We sharpened their customer targeting and built a full go-to-market strategy that drove measurable segment growth within 90 days.',
    details: [
      'Defined target customers with precision',
      'Built a complete GTM strategy',
      'Refined sales messaging',
    ],
    outcome: 'Stronger Market Positioning',
  },
  {
    tag: 'HOSPITALITY · CASE STUDY',
    name: 'Varai Hospitality',
    teaser: 'Premium properties, no framework to convert intent into bookings.',
    details: [
      'Developed revenue strategy',
      'Created experience-led branding',
      'Optimised sales channels',
    ],
    outcome: 'Better Visibility & Revenue Flow',
  },
  {
    segment: true,
    tag: 'SEGMENT · MSME',
    name: 'Consumer Brands & MSMEs',
    teaser: 'Ambitious brands ready to scale nationally.',
    details: [
      'Sales system design',
      'Retail & distribution optimisation',
      'Brand story refinement',
      'Founder coaching',
      'Revenue strategy',
    ],
    outcome: null,
  },
  {
    segment: true,
    tag: 'SEGMENT · STARTUP',
    name: 'Early-Stage Startups',
    teaser: 'Pre-seed to Series A founders finding their footing.',
    details: [
      'Fundraising & pitch coaching',
      'Go-to-market execution',
      'Investor readiness',
      'Strategic partnership structuring',
      'Scaling systems & ops design',
    ],
    outcome: null,
  },
  {
    segment: true,
    tag: 'SEGMENT · UNIVERSITY',
    name: 'University Innovation Hubs',
    teaser: "Building India's next innovation ecosystem, institution by institution.",
    details: [
      'Incubator setup & policy framework',
      'Government grant strategy (DST, BIRAC, AIM)',
      'Demo Day design & execution',
      'Startup funding pipeline',
      'Mentor & investor network setup',
    ],
    outcome: null,
  },
];

const CASE_STUDIES = [
  {
    index: '01',
    sector: 'Premium F&B',
    name: 'Manam Chocolates',
    tagline: 'Running on craft, not a system — until we fixed that.',
    situation:
      'Passionate founders making exceptional chocolates, operating purely on instinct. No structured sales process. No distribution strategy. No scalable revenue model. Great product, broken engine.',
    approach: [
      'Clarified brand positioning to differentiate in a crowded premium segment',
      'Built a structured sales funnel from discovery to close',
      'Improved retail storytelling and in-store experience design',
      'Created a replicable expansion playbook for new retail locations',
    ],
    outcome: 'Clear Growth Direction',
    outcomeDetail: 'A replicable system for store-by-store expansion across premium retail channels.',
  },
  {
    index: '02',
    sector: 'Wellness',
    name: 'Mahati Wellness',
    tagline: 'Spreading thin across segments with no clear path to traction.',
    situation:
      'Spreading across yoga, nutrition, and mental health with no clear ICP. Diluted messaging that confused potential customers and eroded brand trust. Strong offerings, invisible positioning.',
    approach: [
      'Defined target customer profiles with surgical precision using qualitative interviews and data mapping',
      'Built a complete GTM strategy tailored to each sub-segment',
      'Refined sales messaging for clarity and conversion across every channel',
      'Developed a phased market entry plan with measurable milestones',
    ],
    outcome: 'Stronger Market Positioning',
    outcomeDetail: 'Sharper customer acquisition and measurable segment growth within 90 days of implementation.',
  },
  {
    index: '03',
    sector: 'Hospitality',
    name: 'Varai Hospitality',
    tagline: 'Premium properties, no framework to convert intent into bookings.',
    situation:
      'Premium properties with strong aesthetics but no revenue framework. High walk-in interest, low conversion. Direct booking lagging. OTA dependency creating margin pressure across all properties.',
    approach: [
      'Developed a comprehensive revenue strategy spanning direct booking, OTA optimisation, and corporate accounts',
      'Created experience-led branding that communicated premium value at every touchpoint',
      'Optimised sales channels to maximise revenue per available room',
      'Built a B2B outreach engine for corporate bookings and long-stay clients',
    ],
    outcome: 'Better Visibility & Revenue Flow',
    outcomeDetail: 'Improved conversion from high-intent visitors and measurable corporate account growth.',
  },
];

/* ─────────────────────────────────────────────── PAGE */
export default function Home() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);

  const [metricsRef, metricsInView] = useInView(0.25);
  const [csRef,      csDark]        = useInView(0.08);

  const yearsCount = useCountUp(15,  1800, metricsInView);
  const contCount  = useCountUp(3,   1000, metricsInView);
  const orgsCount  = useCountUp(200, 2200, metricsInView);

  useEffect(() => {
    const fn = () => setNavScrolled(window.scrollY > 16);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);


  return (
    <>
      <Head>
        <title>Sunward Growth Advisory | Your North Star for Business Transformation</title>
        <meta name="description" content="Hands-on growth consulting for MSMEs, Startups, and Universities. Strategy · Scale · Growth." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Sunward Growth Advisory" />
        <meta property="og:description" content="Your North Star for Business Transformation." />
        <meta property="og:type" content="website" />
      </Head>

      {/* ── Fixed left-margin rule + diamond node ─────────────────── */}
      <aside
        aria-hidden="true"
        className="fixed left-0 top-0 h-full z-50 pointer-events-none select-none"
        style={{ width: '1px' }}
      >
        {/* Faint navy vertical rule */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, transparent 0%, rgba(11,13,16,0.14) 12%, rgba(11,13,16,0.14) 88%, transparent 100%)',
          }}
        />
        {/* Gold diamond node — at mid-hero text baseline */}
        <div
          className="absolute w-[9px] h-[9px] rotate-45 bg-[#F4B41A]"
          style={{ top: 'calc(50vh - 4.5px)', left: '-4px' }}
        />
      </aside>

      {/* ══ §1  HEADER ══════════════════════════════════════════════ */}
      <header
        className={`fixed inset-x-0 top-0 z-40 bg-[#1A2540] transition-all duration-300 ${
          navScrolled ? 'shadow-[0_1px_0_rgba(255,255,255,0.07)]' : ''
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-8 md:px-14 h-[64px] flex items-center justify-between">

          {/* Logo */}
          <a href="#" className="group flex items-center gap-3 select-none flex-shrink-0">
            <SunwardMark size={38} />
            <span className="hidden sm:inline font-serif text-[15px] font-semibold text-white tracking-[0.18em] uppercase group-hover:text-[#F4B41A] transition-colors duration-300">
              Sunward Growth Advisory
            </span>
          </a>

          {/* Desktop nav — gold underline scales from centre on hover */}
          <nav className="hidden md:flex items-center gap-10" aria-label="Primary navigation">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="group relative font-sans text-[12px] text-white/65 hover:text-white transition-colors duration-200 tracking-[0.04em] py-1"
              >
                {label}
                <span className="absolute bottom-0 left-0 w-full h-px bg-[#F4B41A] origin-center scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
              </a>
            ))}
          </nav>

          {/* CTA — gold border at rest, fills solid gold on hover */}
          <div className="flex items-center gap-4">
            <a
              href="mailto:info@sunwardgrowth.com"
              className="group hidden md:inline-flex items-center gap-2 border border-[#F4B41A] text-white font-sans text-[11.5px] font-medium px-5 py-[10px] rounded-sm tracking-[0.04em] transition-all duration-250 hover:bg-[#F4B41A] hover:text-[#0B0D10]"
            >
              Book a Discovery Call
              <span className="text-[#F4B41A] group-hover:text-[#0B0D10] transition-colors duration-250">↗</span>
            </a>
            <button
              className="md:hidden p-2 -mr-1"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
            >
              {menuOpen
                ? <X size={20} className="text-white" />
                : <Menu size={20} className="text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 bg-[#1A2540] border-t border-white/[0.08] ${
            menuOpen ? 'max-h-80' : 'max-h-0'
          }`}
        >
          <div className="px-8 py-7 flex flex-col gap-5">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="font-sans text-white/60 hover:text-white text-[15px] transition-colors"
              >
                {label}
              </a>
            ))}
            <a
              href="mailto:info@sunwardgrowth.com"
              onClick={() => setMenuOpen(false)}
              className="mt-1 inline-flex items-center gap-2 border border-[#F4B41A] text-white font-sans text-[13px] font-medium px-5 py-3 rounded-sm hover:bg-[#F4B41A] hover:text-[#0B0D10] transition-all"
            >
              Book a Discovery Call ↗
            </a>
          </div>
        </div>
      </header>

      <main>

        {/* ══ §2  HERO — strict 85 vh, 3D perspective canvas ══════════ */}
        <section className="relative bg-[#F9F8F5] overflow-hidden">

          {/* Hero body — strict 85 vh container */}
          <div className="relative h-[85vh] flex items-center overflow-hidden">

            {/* Full-span 3D canvas — absolute, pointer-events:none */}
            <HeroCanvas3D />

            {/* Editorial text — center-aligned, Peak XV scale */}
            <div className="relative z-10 w-full max-w-[1440px] mx-auto px-8 md:px-14 xl:px-20 pt-[64px]">
              <div className="flex flex-col items-center text-center mx-auto max-w-[320px] md:max-w-[700px]">

                {/* Eyebrow */}
                <div className="flex items-center justify-center gap-4 mb-9">
                  <span className="w-8 h-px bg-[#F4B41A]" />
                  <span className="font-sans text-[10px] uppercase tracking-[0.32em] text-[#0B0D10]/40">
                    Growth Advisory · Est. 2009
                  </span>
                  <span className="w-8 h-px bg-[#F4B41A]" />
                </div>

                {/* Headline — large editorial scale */}
                <h1
                  className="font-serif text-[#0B0D10] leading-[1.08] tracking-[-0.025em] mb-7"
                  style={{ fontSize: 'clamp(3.2rem, 5.5vw, 6.5rem)' }}
                >
                  Your North Star for
                  <br />
                  <span className="italic font-light">Business Transformation.</span>
                </h1>

                {/* Tagline */}
                <p
                  className="font-sans font-light tracking-[0.065em] mb-12 leading-relaxed max-w-[28ch] md:max-w-none"
                  style={{ fontSize: 'clamp(0.80rem, 1.0vw, 0.95rem)', color: 'rgba(11,13,16,0.52)' }}
                >
                  Strategy{' '}
                  <span className="text-[#F4B41A] mx-1.5">•</span>
                  {' '}Scale{' '}
                  <span className="text-[#F4B41A] mx-1.5">•</span>
                  {' '}Growth — for MSMEs, Startups, and Universities.
                </p>

                {/* CTA pair */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <a
                    href="mailto:info@sunwardgrowth.com"
                    className="inline-flex items-center gap-3 bg-[#0B0D10] text-[#FAF9F6] font-sans text-[14px] font-medium tracking-[0.05em] px-10 py-[17px] rounded-sm hover:bg-[#F4B41A] hover:text-[#0B0D10] hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(244,180,26,0.30)] transition-all duration-300"
                  >
                    Book a Free Discovery Call
                    <span className="text-[16px] leading-none">↗</span>
                  </a>
                  <a
                    href="#portfolio"
                    className="inline-flex items-center gap-2 border border-[rgba(11,13,16,0.22)] text-[#0B0D10] font-sans text-[14px] font-medium tracking-[0.05em] px-10 py-[17px] rounded-sm hover:border-[#F4B41A] hover:bg-[rgba(244,180,26,0.07)] transition-all duration-300"
                  >
                    View Our Work
                  </a>
                </div>
              </div>
            </div>
          </div>

        </section>

        <FounderTicker />

        <TeamSection />

        {/* ══ §3  PORTFOLIO MATRIX GRID ════════════════════════════════ */}
        <section
          id="portfolio"
          className="scroll-mt-[64px] bg-[#F9F8F5] px-6 md:px-14 xl:px-20 py-24 border-t border-[rgba(11,13,16,0.08)]"
        >
          <div className="max-w-[1440px] mx-auto">

            <div className="mb-16 max-w-4xl">
              <h2
                className="font-serif text-[#0B0D10] font-semibold leading-[1.08] tracking-[-0.024em] mb-5"
                style={{ fontSize: 'clamp(2.2rem, 5.5vw, 5rem)' }}
              >
                Seed. Venture. Growth.{' '}
                <span className="italic font-light">Beyond.</span>
              </h2>
              <p
                className="font-sans font-light text-[#0B0D10]/48 leading-relaxed tracking-[0.02em]"
                style={{ fontSize: 'clamp(0.92rem, 1.2vw, 1.04rem)' }}
              >
                We're a partner across stages, borders, and breakthroughs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-[rgba(11,13,16,0.10)] border border-[rgba(11,13,16,0.10)]">
              {PORTFOLIO.map((item, i) => (
                <div
                  key={i}
                  className={`group relative min-h-[240px] md:min-h-[256px] overflow-hidden cursor-pointer transition-all duration-300 hover:z-10 ${
                    item.logo
                      ? 'bg-[#F9F8F5] hover:scale-[1.02] hover:shadow-[0_20px_52px_rgba(11,13,16,0.13)]'
                      : item.segment
                        ? 'bg-[#0B0D10]'
                        : 'bg-[#F9F8F5] hover:scale-[1.02] hover:shadow-[0_20px_52px_rgba(11,13,16,0.13)]'
                  }`}
                >
                  {/* Gold bottom sweep — on all cards */}
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#F4B41A] z-10 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out pointer-events-none" />

                  {item.logo ? (
                    <>
                      {/* Logo card — default: centred logo on cream */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-[380ms] ease-out group-hover:opacity-0 group-hover:scale-[0.94]">
                        <img
                          src={item.logo}
                          alt={item.name}
                          className="max-h-[88px] max-w-[65%] object-contain"
                        />
                        <span className="mt-4 font-sans text-[8.5px] uppercase tracking-[0.26em] font-semibold text-[#0B0D10]/28">
                          {item.tag}
                        </span>
                      </div>

                      {/* Logo card — hover: dark, logo top-left + blurb + READ MORE */}
                      <div className="absolute inset-0 bg-[#0B0D10] p-7 md:p-8 flex flex-col justify-between opacity-0 translate-y-4 pointer-events-none transition-all duration-[380ms] ease-out group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto">
                        <img
                          src={item.logo}
                          alt={item.name}
                          className="h-[38px] object-contain object-left"
                        />
                        <div>
                          <p className="font-sans text-white/70 text-[12.5px] font-light leading-relaxed mb-6">
                            {item.blurb}
                          </p>
                          <a
                            href="#case-studies"
                            className="inline-flex items-center gap-2 font-sans text-white font-semibold text-[10.5px] tracking-[0.14em] uppercase border-b border-white/25 pb-px hover:border-white transition-colors duration-200"
                          >
                            READ MORE →
                          </a>
                        </div>
                      </div>
                    </>
                  ) : item.segment ? (
                    <>
                      {/* Segment card — always dark navy, content always visible */}
                      {/* Gold left bar slides in on hover */}
                      <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#F4B41A] origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-[380ms] ease-out z-10" />

                      {/* Subtle gold glow on hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(244,180,26,0.06) 0%, transparent 70%)' }} />

                      <div className="absolute inset-0 p-7 md:p-8 flex flex-col justify-between">
                        <span className="font-sans text-[8.5px] uppercase tracking-[0.28em] font-semibold text-[#F4B41A]">
                          {item.tag}
                        </span>
                        <div>
                          <h3
                            className="font-serif text-white font-semibold leading-snug mb-2.5"
                            style={{ fontSize: 'clamp(1.02rem, 1.4vw, 1.28rem)' }}
                          >
                            {item.name}
                          </h3>
                          <p className="font-sans text-white/85 text-[12.5px] font-light leading-relaxed mb-4">
                            {item.teaser}
                          </p>
                          <ul className="space-y-1.5">
                            {item.details.slice(0, 3).map((line, li) => (
                              <li key={li} className="flex items-start gap-2 font-sans text-white/75 text-[11.5px] font-light leading-snug">
                                <span className="text-[#F4B41A] mt-[3px] flex-shrink-0 text-[9px]">→</span>
                                {line}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Varai / client text card — cream default, dark flip on hover */}
                      <div className="absolute inset-0 p-7 md:p-8 flex flex-col justify-between transition-all duration-[400ms] ease-out group-hover:opacity-0 group-hover:-translate-y-4">
                        <span className="font-sans text-[8.5px] uppercase tracking-[0.28em] font-semibold text-[#F4B41A]">
                          {item.tag}
                        </span>
                        <div>
                          <h3
                            className="font-serif text-[#0B0D10] font-semibold leading-snug mb-2.5"
                            style={{ fontSize: 'clamp(1.02rem, 1.4vw, 1.28rem)' }}
                          >
                            {item.name}
                          </h3>
                          <p className="font-sans text-[#0B0D10]/45 text-[12.5px] font-light leading-relaxed">
                            {item.teaser}
                          </p>
                        </div>
                      </div>

                      <div className="absolute inset-0 bg-[#0B0D10] p-7 md:p-8 flex flex-col justify-between opacity-0 translate-y-5 pointer-events-none transition-all duration-[400ms] ease-out group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto">
                        <span className="font-sans text-[8.5px] uppercase tracking-[0.28em] font-semibold text-[#F4B41A]">
                          {item.tag}
                        </span>
                        <div>
                          <h3
                            className="font-serif text-white font-semibold leading-snug mb-4"
                            style={{ fontSize: 'clamp(1.02rem, 1.4vw, 1.28rem)' }}
                          >
                            {item.name}
                          </h3>
                          <ul className="space-y-2 mb-5">
                            {item.details.map((line, li) => (
                              <li key={li} className="flex items-start gap-2 font-sans text-white/65 text-[12px] font-light leading-snug">
                                <span className="text-[#F4B41A] mt-[3px] flex-shrink-0 text-[9px]">→</span>
                                {line}
                              </li>
                            ))}
                          </ul>
                          {item.outcome && (
                            <div className="font-sans text-[8.5px] uppercase tracking-[0.22em] text-[#F4B41A]/65">
                              Outcome: {item.outcome}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ §4  MANIFESTO ════════════════════════════════════════════ */}
        <section
          id="manifesto"
          className="scroll-mt-[64px] bg-[#1A2540] px-6 md:px-14 xl:px-20 py-28 border-t border-white/[0.08]"
        >
          <div className="max-w-[1440px] mx-auto grid md:grid-cols-[2fr_3fr] gap-20 md:gap-36 items-center">

            <blockquote
              className="font-serif italic font-light text-white leading-[1.42] pl-8 border-l-[2px] border-[#F4B41A]"
              style={{ fontSize: 'clamp(1.45rem, 2.6vw, 2.5rem)' }}
            >
              "Great products deserve great business systems."
            </blockquote>

            <div className="space-y-6 font-sans font-light text-white/70 text-[15px] leading-[1.92]">
              <p className="text-white font-normal" style={{ fontSize: 'clamp(1rem, 1.2vw, 1.08rem)' }}>
                We don't just advise. We build alongside you.
              </p>
              <p>
                Sunward Growth Advisory is a hands-on growth consulting firm partnering with
                consumer brands, startups, and institutions at every stage — from finding
                product-market fit to scaling nationally.
              </p>
              <p>
                We work shoulder-to-shoulder with founders and leaders to build the
                infrastructure that turns ambition into measurable, compounding growth.
              </p>
            </div>
          </div>
        </section>

        {/* ══ §5  CASE STUDIES — dark-reveal hover rows ════════════════ */}
        <section
          id="case-studies"
          ref={csRef}
          className="scroll-mt-[64px] px-6 md:px-14 xl:px-20 pt-24 pb-28 border-t border-[rgba(11,13,16,0.08)] bg-[#F9F8F5]"
        >
          <div className="max-w-[1440px] mx-auto">

            {/* Section header */}
            <div className="mb-16 max-w-3xl">
              <div className="flex items-center gap-4 mb-8">
                <span className="w-8 h-px bg-[#F4B41A]" />
                <span
                  className="font-sans text-[10px] uppercase tracking-[0.3em]"
                  style={{ color: 'rgba(11,13,16,0.38)' }}
                >
                  Client Work
                </span>
              </div>
              <h2
                className="font-serif font-semibold leading-[1.1] tracking-[-0.022em] mb-5 text-[#0B0D10]"
                style={{ fontSize: 'clamp(2rem, 4.5vw, 4.2rem)' }}
              >
                What we've{' '}
                <span className="italic font-light">built together.</span>
              </h2>
              <p
                className="font-sans font-light leading-relaxed tracking-[0.02em]"
                style={{ fontSize: 'clamp(0.92rem, 1.2vw, 1.04rem)', color: 'rgba(11,13,16,0.52)' }}
              >
                Each engagement starts with diagnosis. Every outcome is earned.
              </p>
            </div>

            {/* Case study rows — hover flips each row to dark navy */}
            <div>
              {CASE_STUDIES.map((cs) => (
                <div
                  key={cs.index}
                  className="group relative border-t border-black/[0.06] hover:border-white/[0.08] py-12 px-8 -mx-8 transition-all duration-500 ease-out hover:bg-[#1A2540] hover:shadow-[0_32px_64px_rgba(26,37,64,0.28)]"
                >
                  {/* Gold sweep line — origin-left, 500ms */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#F4B41A] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out pointer-events-none" />

                  <div className="grid grid-cols-1 md:grid-cols-[96px_1fr_1fr] gap-8 md:gap-14 lg:gap-20 items-start">

                    {/* ── Col 1: Index + sector ── */}
                    <div className="flex items-center gap-4 md:flex-col md:items-start md:gap-2">
                      <span
                        className="font-serif text-[#F4B41A] font-bold leading-none"
                        style={{ fontSize: 'clamp(2rem, 3vw, 2.8rem)' }}
                      >
                        {cs.index}
                      </span>
                      <span className="font-sans text-[9px] uppercase tracking-[0.25em] md:mt-1 text-[#0B0D10]/40 group-hover:text-white/50 transition-colors duration-500">
                        {cs.sector}
                      </span>
                    </div>

                    {/* ── Col 2: Brand name + tagline + situation ── */}
                    <div>
                      <h3
                        className="font-serif font-semibold leading-snug mb-2 text-[#0B0D10] group-hover:text-white transition-colors duration-500"
                        style={{ fontSize: 'clamp(1.12rem, 1.6vw, 1.5rem)' }}
                      >
                        {cs.name}
                      </h3>
                      <p className="font-sans text-[13.5px] italic leading-relaxed mb-5 text-[#0B0D10]/55 group-hover:text-white/60 transition-colors duration-500">
                        {cs.tagline}
                      </p>
                      <p className="font-sans text-[13px] font-semibold uppercase tracking-[0.18em] mb-3 text-[#F4B41A]">
                        The Situation
                      </p>
                      <p className="font-sans font-normal text-[15px] leading-[1.82] text-[#0B0D10]/80 group-hover:text-white/90 transition-colors duration-500">
                        {cs.situation}
                      </p>
                    </div>

                    {/* ── Col 3: Approach + outcome ── */}
                    <div>
                      <p className="font-sans text-[13px] font-semibold uppercase tracking-[0.18em] mb-4 text-[#F4B41A]">
                        Our Approach
                      </p>
                      <ul className="space-y-3 mb-8">
                        {cs.approach.map((line, li) => (
                          <li
                            key={li}
                            className="flex items-start gap-2.5 font-sans font-normal text-[15px] leading-snug text-[#0B0D10]/80 group-hover:text-white/90 transition-colors duration-500"
                          >
                            <span className="text-[#F4B41A] mt-[3px] flex-shrink-0 text-[10px] transition-transform duration-300 group-hover:translate-x-1.5">
                              →
                            </span>
                            {line}
                          </li>
                        ))}
                      </ul>
                      <div className="border-t border-[#0B0D10]/10 group-hover:border-white/[0.14] pt-6 transition-all duration-500 group-hover:pl-4">
                        <p className="font-sans text-[13px] font-semibold uppercase tracking-[0.18em] mb-2 text-[#F4B41A]/80 group-hover:text-[#F4B41A] transition-colors duration-500">
                          Outcome
                        </p>
                        <p
                          className="font-serif italic font-normal leading-snug mb-2 text-[#0B0D10] group-hover:text-white transition-colors duration-500"
                          style={{ fontSize: 'clamp(1.05rem, 1.4vw, 1.28rem)' }}
                        >
                          {cs.outcome}
                        </p>
                        <p className="font-sans font-normal text-[14px] leading-relaxed text-[#0B0D10]/70 group-hover:text-white/75 transition-colors duration-500">
                          {cs.outcomeDetail}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ══ §6  METRICS + FOOTER ════════════════════════════════════ */}
        <section className="bg-[#1A2540]">

          <div
            ref={metricsRef}
            className="px-6 md:px-14 xl:px-20 pt-12 pb-10 border-b border-white/[0.07]"
          >
            <div className="max-w-[1440px] mx-auto">

              {/* Quote */}
              <div className="flex flex-col items-center gap-3 mb-12 text-center">
                <span className="w-8 h-px bg-[#F4B41A]" />
                <p
                  className="font-serif italic font-light leading-snug"
                  style={{ fontSize: 'clamp(1.3rem, 2.5vw, 2.2rem)', color: 'rgba(255,255,255,0.72)' }}
                >
                  "Never build without direction."
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 w-full border-t border-white/[0.07] pt-10">
                {[
                  { n: yearsCount, s: '+', label: 'Years of Experience'    },
                  { n: contCount,  s: '+', label: 'Continents'              },
                  { n: orgsCount,  s: '+', label: 'Organisations Supported' },
                ].map(({ n, s, label }, i) => (
                  <div key={label} className={`py-4 flex flex-col items-center text-center ${i !== 0 ? 'border-l border-white/[0.07]' : ''}`}>
                    <div
                      className="font-serif font-bold text-[#F4B41A] tabular-nums leading-none"
                      style={{ fontSize: 'clamp(3rem, 7vw, 7.5rem)' }}
                    >
                      {n}{s}
                    </div>
                    <div className="font-sans text-[10px] uppercase tracking-[0.24em] mt-3" style={{ color: 'rgba(255,255,255,0.42)' }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </section>

        {/* ══ FOOTER ═════════════════════════════════════════════════ */}
        <footer
          id="footer"
          className="bg-[#1A2540] border-t border-white/[0.06] px-6 md:px-14 xl:px-20 pt-14 pb-8"
        >
          <div className="max-w-[1440px] mx-auto">

            {/* ── Main grid ── */}
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-12 mb-12">

              {/* Brand */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-2.5 mb-5">
                  <SunwardMark size={26} />
                  <span className="font-serif text-[12px] font-semibold tracking-[0.18em] uppercase" style={{ color: 'rgba(255,255,255,0.88)' }}>
                    Sunward Growth Advisory
                  </span>
                </div>
                <p className="font-sans font-light text-[13px] leading-relaxed max-w-[280px]" style={{ color: 'rgba(255,255,255,0.46)' }}>
                  Hands-on growth consulting for founders serious about scale.
                  Strategy · Scale · Growth.
                </p>
              </div>

              {/* General Inquiries */}
              <div>
                <div className="font-sans text-[9px] uppercase tracking-[0.28em] mb-5" style={{ color: '#F4B41A' }}>
                  General Inquiries
                </div>
                <div className="space-y-2 font-sans font-light text-[13px]">
                  <div>
                    <a
                      href="mailto:info@sunwardgrowth.com"
                      style={{ color: 'rgba(255,255,255,0.62)' }}
                      className="transition-colors duration-200 break-all"
                      onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.92)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.62)'}
                    >
                      info@sunwardgrowth.com
                    </a>
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.12em] pt-2" style={{ color: 'rgba(255,255,255,0.30)' }}>Hotline</div>
                  <div>
                    <a
                      href="tel:+918822456789"
                      style={{ color: 'rgba(255,255,255,0.62)' }}
                      className="transition-colors duration-200"
                      onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.92)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.62)'}
                    >
                      +91 88224 56789
                    </a>
                  </div>
                  <div className="pt-2 space-y-0.5">
                    <div style={{ color: 'rgba(255,255,255,0.62)' }}>India</div>
                    <div className="text-[12px]" style={{ color: 'rgba(255,255,255,0.36)' }}>Bandra, Mumbai 400050</div>
                  </div>
                </div>
              </div>

              {/* Navigate */}
              <div>
                <div className="font-sans text-[9px] uppercase tracking-[0.28em] mb-5" style={{ color: '#F4B41A' }}>
                  Navigate
                </div>
                <div className="space-y-2.5 font-sans font-light text-[13px]">
                  {NAV_LINKS.map(({ label, href }) => (
                    <div key={label}>
                      <a
                        href={href}
                        style={{ color: 'rgba(255,255,255,0.58)' }}
                        className="transition-colors duration-200"
                        onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.90)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.58)'}
                      >
                        {label}
                      </a>
                    </div>
                  ))}
                  <div className="pt-1">
                    <a
                      href="mailto:info@sunwardgrowth.com"
                      className="transition-colors duration-200 font-medium"
                      style={{ color: 'rgba(244,180,26,0.80)' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#F4B41A'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(244,180,26,0.80)'}
                    >
                      Book a Discovery Call ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Copyright bar ── */}
            <div className="pt-6 border-t border-white/[0.07] flex flex-col sm:flex-row justify-between items-center gap-4">
              <span className="font-sans text-[12px]" style={{ color: 'rgba(255,255,255,0.36)' }}>
                © {new Date().getFullYear()} Sunward Growth Advisory. All Rights Reserved.
              </span>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/sunward-growth-advisory/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 transition-colors duration-200"
                style={{ color: 'rgba(255,255,255,0.40)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.88)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.40)'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span className="font-sans text-[10px] uppercase tracking-[0.16em]">LinkedIn</span>
              </a>

              <span className="font-sans text-[11px] uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.20)' }}>
                Strategy · Scale · Growth
              </span>
            </div>
          </div>
        </footer>

      </main>
    </>
  );
}
