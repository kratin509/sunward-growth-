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

/* ─────────────────────────────────────────────── NORTH STAR CANVAS
   "North Star Launch" — three-layer premium hero animation:
   1. Pulsing 4-point gold cross-star in the upper-right quadrant
   2. Stardust micro-particles that float around the star on mouse proximity
   3. Scroll-triggered shooting star: bursts from star, shoots diagonally
      down-right, leaves a vector trail that decays with scroll depth.
   All state lives in a single ref object — zero React re-renders.        */
function NorthStarCanvas() {
  const canvasRef  = useRef(null);
  const rafRef     = useRef(null);
  const stateRef   = useRef({
    t:       0,
    scrollY: 0,
    mouse:   { x: -999, y: -999 },
    dust:    [],
    shoot: {
      active: false, triggered: false,
      x: 0, y: 0, vx: 0, vy: 0,
      life: 0, maxLife: 88, trail: [],
    },
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const S = stateRef.current;

    /* ── Event listeners ─────────────────────────────────────── */
    const onMouse = (e) => {
      const r  = canvas.getBoundingClientRect();
      S.mouse.x = e.clientX - r.left;
      S.mouse.y = e.clientY - r.top;
    };

    const onScroll = () => {
      S.scrollY = window.scrollY;
      if (!S.shoot.triggered && window.scrollY > 8) {
        const W  = canvas.clientWidth;
        const H  = canvas.clientHeight;
        const sx = W * 0.72, sy = H * 0.27;
        // 55° angle in canvas-space (y-down): cos=right, sin=down — diagonal launch
        const rad = (55 * Math.PI) / 180;
        const spd = Math.min(W, H) * 0.036;
        S.shoot = {
          active: true, triggered: true,
          x: sx, y: sy,
          vx: Math.cos(rad) * spd,
          vy: Math.sin(rad) * spd,
          life: 0, maxLife: 88, trail: [],
        };
      }
    };

    window.addEventListener('mousemove', onMouse, { passive: true });
    window.addEventListener('scroll',    onScroll, { passive: true });

    /* ── 4-point star geometry helper ───────────────────────── */
    function draw4Star(ctx, sx, sy, armLen, pulse) {
      const shortR = armLen * 0.13;

      // Wide ambient halo
      const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, armLen * 3.6);
      halo.addColorStop(0,    `rgba(244,180,26,${(0.11 * pulse).toFixed(3)})`);
      halo.addColorStop(0.45, `rgba(244,180,26,0.04)`);
      halo.addColorStop(1,    'rgba(244,180,26,0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(sx, sy, armLen * 3.6, 0, Math.PI * 2);
      ctx.fill();

      // Cardinal arms — N E S W kite diamonds
      ctx.fillStyle = `rgba(244,180,26,${(0.30 * pulse).toFixed(3)})`;
      for (const [dx, dy] of [[0,-1],[1,0],[0,1],[-1,0]]) {
        const px = -dy * shortR, py = dx * shortR;
        ctx.beginPath();
        ctx.moveTo(sx + px,          sy + py);
        ctx.lineTo(sx + dx * armLen, sy + dy * armLen);
        ctx.lineTo(sx - px,          sy - py);
        ctx.lineTo(sx,               sy);
        ctx.closePath();
        ctx.fill();
      }

      // Diagonal sub-arms — 45° offset, shorter and softer
      const diagLen = armLen * 0.52, diagR = shortR * 0.62;
      ctx.fillStyle = `rgba(244,180,26,${(0.14 * pulse).toFixed(3)})`;
      for (const [rx, ry] of [[1,-1],[1,1],[-1,1],[-1,-1]]) {
        const dx = rx / Math.SQRT2, dy = ry / Math.SQRT2;
        const px = -dy * diagR,     py = dx * diagR;
        ctx.beginPath();
        ctx.moveTo(sx + px,           sy + py);
        ctx.lineTo(sx + dx * diagLen, sy + dy * diagLen);
        ctx.lineTo(sx - px,           sy - py);
        ctx.lineTo(sx,                sy);
        ctx.closePath();
        ctx.fill();
      }

      // Bright core radial glow
      const core = ctx.createRadialGradient(sx, sy, 0, sx, sy, 5 * pulse);
      core.addColorStop(0,    `rgba(255,249,210,${(0.95 * pulse).toFixed(3)})`);
      core.addColorStop(0.45, `rgba(244,180,26,${(0.65 * pulse).toFixed(3)})`);
      core.addColorStop(1,    'rgba(244,180,26,0)');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(sx, sy, 5 * pulse, 0, Math.PI * 2);
      ctx.fill();
    }

    /* ── Main requestAnimationFrame loop ─────────────────────── */
    function loop() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W   = canvas.clientWidth;
      const H   = canvas.clientHeight;
      if (!W || !H) { rafRef.current = requestAnimationFrame(loop); return; }

      if (canvas.width  !== Math.round(W * dpr) ||
          canvas.height !== Math.round(H * dpr)) {
        canvas.width  = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
      }

      const ctx = canvas.getContext('2d');
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, W, H);

      S.t += 0.014;
      const pulse  = 0.88 + Math.sin(S.t * 1.1) * 0.12;
      const isMob  = W < 768;
      const sx     = W * 0.72;
      const sy     = H * 0.27;
      const armLen = (isMob ? 14 : 24) * pulse;

      /* Stardust — spawns when mouse within ~250px of star */
      const mdx = S.mouse.x - sx, mdy = S.mouse.y - sy;
      if (Math.sqrt(mdx * mdx + mdy * mdy) < 250 && Math.random() < 0.28) {
        const a  = Math.random() * Math.PI * 2;
        const sp = 0.2 + Math.random() * 0.5;
        S.dust.push({
          x:    sx + (Math.random() - 0.5) * 46,
          y:    sy + (Math.random() - 0.5) * 46,
          vx:   Math.cos(a) * sp,
          vy:   Math.sin(a) * sp - 0.14,
          life: 0.72 + Math.random() * 0.28,
          r:    0.7  + Math.random() * 1.35,
        });
        if (S.dust.length > 55) S.dust.shift();
      }

      S.dust = S.dust.filter(p => p.life > 0.016);
      for (const p of S.dust) {
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += 0.007;
        p.life *= 0.965;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(244,180,26,${(p.life * 0.42).toFixed(3)})`;
        ctx.fill();
      }

      /* North Star */
      draw4Star(ctx, sx, sy, armLen, pulse);

      /* Shooting star */
      const sh = S.shoot;
      if (sh.active) {
        sh.trail.push({ x: sh.x, y: sh.y });
        if (sh.trail.length > 48) sh.trail.shift();

        // Trail line — opacity modulated by trail-position AND scroll depth
        const scrollFade = Math.max(0, 1 - S.scrollY / 500);
        if (sh.trail.length > 1) {
          ctx.lineCap = 'round';
          for (let i = 1; i < sh.trail.length; i++) {
            const prog = i / sh.trail.length;
            const a    = prog * 0.58 * scrollFade * (1 - (sh.life / sh.maxLife) * 0.55);
            ctx.beginPath();
            ctx.moveTo(sh.trail[i - 1].x, sh.trail[i - 1].y);
            ctx.lineTo(sh.trail[i].x,     sh.trail[i].y);
            ctx.strokeStyle = `rgba(244,180,26,${a.toFixed(3)})`;
            ctx.lineWidth   = 0.55 + prog * 1.1;
            ctx.stroke();
          }
        }

        // Lead glow dot
        const ldFade = Math.max(0, 1 - sh.life / sh.maxLife) * scrollFade;
        const lg = ctx.createRadialGradient(sh.x, sh.y, 0, sh.x, sh.y, 12);
        lg.addColorStop(0,    `rgba(255,250,200,${(0.92 * ldFade).toFixed(3)})`);
        lg.addColorStop(0.38, `rgba(244,180,26,${(0.58 * ldFade).toFixed(3)})`);
        lg.addColorStop(1,    'rgba(244,180,26,0)');
        ctx.fillStyle = lg;
        ctx.beginPath();
        ctx.arc(sh.x, sh.y, 12, 0, Math.PI * 2);
        ctx.fill();

        sh.x  += sh.vx;  sh.y  += sh.vy;
        sh.vx *= 0.958;  sh.vy *= 0.958;
        sh.life++;

        if (sh.life >= sh.maxLife || sh.x > W + 60 || sh.y > H + 60 || sh.x < -60) {
          sh.active = false;
        }
      }

      ctx.restore();
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('scroll',    onScroll);
    };
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
        className={`fixed inset-x-0 top-0 z-40 bg-[#07080A] transition-all duration-300 ${
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
          className={`md:hidden overflow-hidden transition-all duration-300 bg-[#07080A] border-t border-white/[0.08] ${
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

        {/* ══ §2  HERO — strict 85 vh, North Star canvas system ═══════ */}
        <section className="relative bg-[#F2F0EC] overflow-hidden">

          {/* Hero body — strict 85 vh container */}
          <div className="relative h-[85vh] flex items-center overflow-hidden">

            {/* Full-span North Star canvas — absolute, pointer-events:none */}
            <NorthStarCanvas />

            {/* Editorial text block — Peak XV proportions */}
            <div className="relative z-10 w-full max-w-[1440px] mx-auto px-8 md:px-16 xl:px-24 pt-[64px]">
              <div className="flex flex-col items-center md:items-start text-center md:text-left md:max-w-[44%] lg:max-w-[40%]">

                {/* Eyebrow */}
                <div className="flex items-center justify-center md:justify-start gap-4 mb-9">
                  <span className="w-8 h-px bg-[#F4B41A]" />
                  <span className="font-sans text-[10px] uppercase tracking-[0.32em] text-[#0B0D10]/40">
                    Growth Advisory · Est. 2009
                  </span>
                  <span className="w-8 h-px bg-[#F4B41A] md:hidden" />
                </div>

                {/* Headline — crisp editorial scale, two lines */}
                <h1
                  className="font-serif text-[#0B0D10] leading-[1.10] tracking-[-0.020em] mb-7"
                  style={{ fontSize: 'clamp(2.4rem, 3.5vw, 4.2rem)' }}
                >
                  Your North Star for
                  <br />
                  <span className="italic font-light">Business Transformation.</span>
                </h1>

                {/* Tagline */}
                <p
                  className="font-sans font-light text-[#0B0D10]/48 tracking-[0.065em] mb-12 leading-relaxed max-w-sm md:max-w-none"
                  style={{ fontSize: 'clamp(0.80rem, 0.95vw, 0.90rem)' }}
                >
                  Strategy{' '}
                  <span className="text-[#F4B41A] mx-1.5">•</span>
                  {' '}Scale{' '}
                  <span className="text-[#F4B41A] mx-1.5">•</span>
                  {' '}Growth — for MSMEs, Startups, and Universities.
                </p>

                {/* CTA pair */}
                <div className="flex flex-col sm:flex-row items-center md:items-start gap-4">
                  <a
                    href="mailto:info@sunwardgrowth.com"
                    className="inline-flex items-center gap-2.5 bg-[#0B0D10] text-[#FAF9F6] font-sans text-[12px] font-medium tracking-[0.05em] px-7 py-[13px] rounded-sm hover:bg-[#F4B41A] hover:text-[#0B0D10] hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(244,180,26,0.30)] transition-all duration-300"
                  >
                    Book a Free Discovery Call
                    <span className="text-[14px] leading-none">↗</span>
                  </a>
                  <a
                    href="#portfolio"
                    className="inline-flex items-center gap-2 border border-[rgba(11,13,16,0.22)] text-[#0B0D10] font-sans text-[12px] font-medium tracking-[0.05em] px-7 py-[13px] rounded-sm hover:border-[#F4B41A] hover:bg-[rgba(244,180,26,0.07)] transition-all duration-300"
                  >
                    View Our Work
                  </a>
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* ══ §FOUNDERS — vertical img/text cards, 2-col grid ════════ */}
        <section
          id="team-band"
          className="scroll-mt-[64px] bg-[#F2F0EC] py-14 px-6 md:px-14 border-t border-[rgba(11,13,16,0.07)]"
        >
          <div className="max-w-[700px] mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5">

            {FOUNDERS.map((f, i) => (
              <div
                key={f.index}
                className="group cursor-default overflow-hidden rounded-[3px] flex flex-col
                  transition-all duration-400 ease-out
                  hover:-translate-y-2 hover:shadow-[0_18px_56px_rgba(11,13,16,0.14)]"
                style={{ boxShadow: '0 4px 18px rgba(11,13,16,0.09)' }}
              >
                {/* Photo — top, portrait aspect */}
                <div className="relative overflow-hidden" style={{ aspectRatio: '4/5' }}>
                  <img
                    src={f.photo}
                    alt={f.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                    style={{ objectPosition: f.photoPos }}
                  />
                  {/* Gold top bar on hover */}
                  <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-[#F4B41A] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-450 ease-out" />
                </div>

                {/* Text — bottom, tight */}
                <div className="bg-white border border-t-0 border-[rgba(180,130,20,0.14)] px-5 py-4 flex flex-col gap-1.5 relative overflow-hidden">
                  {/* Gold left bar on hover */}
                  <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#F4B41A] origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-400 ease-out" />

                  <span className="font-sans text-[#F4B41A] text-[7.5px] uppercase tracking-[0.3em] font-semibold">
                    {f.role}
                  </span>
                  <h3
                    className="font-serif text-[#0B0D10] font-semibold leading-tight"
                    style={{ fontSize: 'clamp(1.05rem, 1.6vw, 1.35rem)' }}
                  >
                    {f.name}
                  </h3>
                  <p className="font-sans text-[#0B0D10]/48 text-[9px] tracking-[0.07em] font-light leading-relaxed">
                    {f.credentials}
                  </p>
                  <p className="font-sans text-[#0B0D10]/58 text-[11.5px] font-light leading-[1.75] pt-1">
                    {f.bio.split('.').slice(0, 2).join('.') + '.'}
                  </p>
                  <span className="font-sans text-[7.5px] uppercase tracking-[0.22em] text-[#0B0D10]/18 pt-1">
                    {f.index} / 02
                  </span>
                </div>
              </div>
            ))}

            <p className="sm:col-span-2 pt-2 text-center font-sans text-[8px] uppercase tracking-[0.28em] text-[#0B0D10]/22 font-light">
              The people behind Sunward Growth Advisory
            </p>
          </div>
        </section>

        {/* ══ §3  PORTFOLIO MATRIX GRID ════════════════════════════════ */}
        <section
          id="portfolio"
          className="scroll-mt-[64px] bg-[#F2F0EC] px-6 md:px-14 xl:px-20 py-24 border-t border-[rgba(11,13,16,0.08)]"
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
                      ? 'bg-[#F2F0EC] hover:scale-[1.02] hover:shadow-[0_20px_52px_rgba(11,13,16,0.13)]'
                      : item.segment
                        ? 'bg-[#0B0D10]'
                        : 'bg-[#F2F0EC] hover:scale-[1.02] hover:shadow-[0_20px_52px_rgba(11,13,16,0.13)]'
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
          className="scroll-mt-[64px] bg-[#F2F0EC] px-6 md:px-14 xl:px-20 py-28 border-t border-[rgba(11,13,16,0.08)]"
        >
          <div className="max-w-[1440px] mx-auto grid md:grid-cols-[2fr_3fr] gap-20 md:gap-36 items-center">

            <blockquote
              className="font-serif italic font-light text-[#0B0D10] leading-[1.42] pl-8 border-l-[2px] border-[#F4B41A]"
              style={{ fontSize: 'clamp(1.45rem, 2.6vw, 2.5rem)' }}
            >
              "Great products deserve great business systems."
            </blockquote>

            <div className="space-y-6 font-sans font-light text-[#0B0D10]/54 text-[15px] leading-[1.92]">
              <p className="text-[#0B0D10] font-normal" style={{ fontSize: 'clamp(1rem, 1.2vw, 1.08rem)' }}>
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

        {/* ══ §5  CASE STUDIES — scroll-triggered dark ═════════════════ */}
        <section
          id="case-studies"
          ref={csRef}
          className={`scroll-mt-[64px] px-6 md:px-14 xl:px-20 py-28 border-t border-[rgba(11,13,16,0.08)] transition-colors duration-700 ${
            csDark ? 'bg-[#0B0D10]' : 'bg-[#F2F0EC]'
          }`}
        >
          <div className="max-w-[1440px] mx-auto">

            <div className="mb-20 max-w-3xl">
              <div className="flex items-center gap-4 mb-8">
                <span className="w-8 h-px bg-[#F4B41A]" />
                <span className={`font-sans text-[10px] uppercase tracking-[0.3em] transition-colors duration-700 ${csDark ? 'text-[#F4B41A]' : 'text-[#0B0D10]/38'}`}>
                  Client Work
                </span>
              </div>
              <h2
                className={`font-serif font-semibold leading-[1.1] tracking-[-0.022em] mb-5 transition-colors duration-700 ${csDark ? 'text-white' : 'text-[#0B0D10]'}`}
                style={{ fontSize: 'clamp(2rem, 4.5vw, 4.2rem)' }}
              >
                What we've{' '}
                <span className="italic font-light">built together.</span>
              </h2>
              <p
                className={`font-sans font-light leading-relaxed tracking-[0.02em] transition-colors duration-700 ${csDark ? 'text-white/48' : 'text-[#0B0D10]/48'}`}
                style={{ fontSize: 'clamp(0.92rem, 1.2vw, 1.04rem)' }}
              >
                Each engagement starts with diagnosis. Every outcome is earned.
              </p>
            </div>

            <div className="space-y-px">
              {CASE_STUDIES.map((cs) => (
                <div
                  key={cs.index}
                  className={`border transition-colors duration-700 ${csDark ? 'border-white/[0.09]' : 'border-[rgba(11,13,16,0.09)]'}`}
                >
                  <div className="p-8 md:p-12 grid md:grid-cols-[88px_1fr_1fr] gap-8 md:gap-14">

                    <div className="flex md:flex-col gap-4 md:gap-2">
                      <span className="font-serif text-[#F4B41A] font-bold leading-none" style={{ fontSize: 'clamp(2rem, 3vw, 2.8rem)' }}>
                        {cs.index}
                      </span>
                      <span className={`font-sans text-[9px] uppercase tracking-[0.25em] md:mt-1 transition-colors duration-700 ${csDark ? 'text-white/28' : 'text-[#0B0D10]/30'}`}>
                        {cs.sector}
                      </span>
                    </div>

                    <div>
                      <h3
                        className={`font-serif font-semibold leading-snug mb-4 transition-colors duration-700 ${csDark ? 'text-white' : 'text-[#0B0D10]'}`}
                        style={{ fontSize: 'clamp(1.12rem, 1.6vw, 1.5rem)' }}
                      >
                        {cs.name}
                      </h3>
                      <p className="font-sans text-[9px] uppercase tracking-[0.22em] mb-3 text-[#F4B41A]">
                        The Situation
                      </p>
                      <p
                        className="font-sans font-light text-[14px] leading-[1.88] transition-colors duration-700"
                        style={{ color: csDark ? 'rgba(255,255,255,0.82)' : 'rgba(11,13,16,0.68)' }}
                      >
                        {cs.situation}
                      </p>
                    </div>

                    <div>
                      <p className="font-sans text-[9px] uppercase tracking-[0.22em] mb-4 text-[#F4B41A]">
                        Our Approach
                      </p>
                      <ul className="space-y-2.5 mb-8">
                        {cs.approach.map((line, li) => (
                          <li
                            key={li}
                            className="flex items-start gap-2.5 font-sans font-light text-[13.5px] leading-snug transition-colors duration-700"
                            style={{ color: csDark ? 'rgba(255,255,255,0.85)' : 'rgba(11,13,16,0.70)' }}
                          >
                            <span className="text-[#F4B41A] mt-[3px] flex-shrink-0 text-[10px]">→</span>
                            {line}
                          </li>
                        ))}
                      </ul>
                      <div className={`border-t pt-6 transition-colors duration-700 ${csDark ? 'border-white/[0.09]' : 'border-[rgba(11,13,16,0.09)]'}`}>
                        <p className="font-sans text-[9px] uppercase tracking-[0.22em] text-[#F4B41A]/70 mb-1.5">
                          Outcome
                        </p>
                        <p
                          className={`font-serif italic font-light leading-snug mb-1 transition-colors duration-700 ${csDark ? 'text-white' : 'text-[#0B0D10]'}`}
                          style={{ fontSize: 'clamp(1rem, 1.3vw, 1.22rem)' }}
                        >
                          {cs.outcome}
                        </p>
                        <p
                          className="font-sans font-light text-[12.5px] leading-relaxed transition-colors duration-700"
                          style={{ color: csDark ? 'rgba(255,255,255,0.68)' : 'rgba(11,13,16,0.58)' }}
                        >
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
        <section className="bg-[#0B0D10]">

          <div
            ref={metricsRef}
            className="px-6 md:px-14 xl:px-20 pt-12 pb-10 border-b border-white/[0.07]"
          >
            <div className="max-w-[1440px] mx-auto">

              {/* Quote */}
              <div className="flex items-start gap-3 mb-10">
                <span className="w-6 h-px bg-[#F4B41A] mt-4 flex-shrink-0" />
                <p
                  className="font-serif italic font-light leading-snug"
                  style={{ fontSize: 'clamp(1.3rem, 2.5vw, 2.2rem)', color: 'rgba(255,255,255,0.72)' }}
                >
                  "Never build without direction."
                </p>
              </div>

              {/* Stats — full width, no constraint */}
              <div className="grid grid-cols-3 w-full border-t border-white/[0.07] pt-8">
                {[
                  { n: yearsCount, s: '+', label: 'Years of Experience'    },
                  { n: contCount,  s: '+', label: 'Continents'              },
                  { n: orgsCount,  s: '+', label: 'Organisations Supported' },
                ].map(({ n, s, label }, i) => (
                  <div key={label} className={`py-4 ${i !== 0 ? 'pl-10 md:pl-16 border-l border-white/[0.07]' : ''}`}>
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
          className="bg-[#0B0D10] border-t border-white/[0.06] px-6 md:px-14 xl:px-20 pt-14 pb-8"
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
