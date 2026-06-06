import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';

/* ─────────────────────────────────────────── HOOKS */
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

/* ─────────────────────────────────────────── SUNWARD MARK */
function SunwardMark({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      {[...Array(16)].map((_, i) => {
        const main = i % 2 === 0;
        return (
          <g key={i} transform={`rotate(${i * 22.5} 50 50)`}>
            <ellipse
              cx="50"
              cy={main ? 21 : 24}
              rx={main ? 4.5 : 3}
              ry={main ? 13 : 9}
              fill={main ? '#F9C814' : '#EAB308'}
              opacity={main ? 1 : 0.72}
            />
          </g>
        );
      })}
      <circle cx="50" cy="50" r="23" fill="#1E2342" />
      <circle cx="50" cy="50" r="18.5" stroke="#F9C814" strokeWidth="0.6" strokeOpacity="0.28" fill="none" />
      <circle cx="50" cy="50" r="13"   stroke="#F9C814" strokeWidth="0.4" strokeOpacity="0.18" fill="none" />
      <polygon points="50,36 47.5,50.5 50,48.5 52.5,50.5" fill="#F9C814" />
      <polygon points="50,64 47.5,49.5 50,51.5 52.5,49.5" fill="rgba(255,255,255,0.28)" />
      <circle cx="50" cy="50" r="2.5" fill="#F9C814" />
      <circle cx="50" cy="33.5" r="1.4" fill="#F9C814" />
    </svg>
  );
}

/* ─────────────────────────────────────────── COMPASS CANVAS */
function CompassCanvas() {
  const canvasRef = useRef(null);
  const mouseRef  = useRef({ x: 0, y: 0 });
  const rotRef    = useRef({ x: 0.28, y: 0.1 });
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onMouse = (e) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth - 0.5,
        y: e.clientY / window.innerHeight - 0.5,
      };
    };
    window.addEventListener('mousemove', onMouse, { passive: true });

    function project(lat, lon, rx, ry, cx, cy, R) {
      const x0 =  Math.cos(lat) * Math.sin(lon);
      const y0 =  Math.sin(lat);
      const z0 =  Math.cos(lat) * Math.cos(lon);
      const x1 =  x0 * Math.cos(ry) + z0 * Math.sin(ry);
      const z1 = -x0 * Math.sin(ry) + z0 * Math.cos(ry);
      const y2 =  y0 * Math.cos(rx) - z1 * Math.sin(rx);
      const z2 =  y0 * Math.sin(rx) + z1 * Math.cos(rx);
      const fov = 4.2;
      const sc  = fov / (fov + z2 + 1);
      return { px: cx + x1 * R * sc, py: cy + y2 * R * sc, z: z2 };
    }

    function draw() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      if (!W || !H) return;
      if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
        canvas.width  = W * dpr;
        canvas.height = H * dpr;
      }
      const ctx = canvas.getContext('2d');
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);

      const cx = W / 2;
      const cy = H / 2;
      const R  = Math.min(W, H) * 0.38;
      const rx = rotRef.current.x;
      const ry = rotRef.current.y;

      // Meridians — 12, every 30°
      for (let m = 0; m < 12; m++) {
        const lon = (m / 12) * Math.PI * 2;
        ctx.beginPath();
        for (let j = 0; j <= 48; j++) {
          const lat = (j / 48 - 0.5) * Math.PI;
          const { px, py } = project(lat, lon, rx, ry, cx, cy, R);
          j === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.strokeStyle = 'rgba(249,200,20,0.10)';
        ctx.lineWidth   = 0.65;
        ctx.stroke();
      }

      // Parallels — 6 latitude bands
      [-70, -45, -20, 20, 45, 70].forEach((deg) => {
        const lat = (deg * Math.PI) / 180;
        ctx.beginPath();
        for (let j = 0; j <= 60; j++) {
          const lon = (j / 60) * Math.PI * 2;
          const { px, py } = project(lat, lon, rx, ry, cx, cy, R);
          j === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.strokeStyle = 'rgba(249,200,20,0.07)';
        ctx.lineWidth   = 0.5;
        ctx.stroke();
      });

      // Equator — highlighted
      ctx.beginPath();
      for (let j = 0; j <= 60; j++) {
        const lon = (j / 60) * Math.PI * 2;
        const { px, py } = project(0, lon, rx, ry, cx, cy, R);
        j === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.strokeStyle = 'rgba(249,200,20,0.30)';
      ctx.lineWidth   = 1.3;
      ctx.stroke();

      // N-S compass needle
      const north = project( Math.PI / 2, 0, rx, ry, cx, cy, R);
      const south = project(-Math.PI / 2, 0, rx, ry, cx, cy, R);

      // South arm
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(south.px, south.py);
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth   = 1;
      ctx.stroke();

      // North arm
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(north.px, north.py);
      ctx.strokeStyle = '#F9C814';
      ctx.lineWidth   = 2.2;
      ctx.stroke();

      // Arrowhead at North
      const adx  = north.px - cx;
      const ady  = north.py - cy;
      const alen = Math.hypot(adx, ady) || 1;
      const anx  = adx / alen;
      const any  = ady / alen;
      ctx.beginPath();
      ctx.moveTo(north.px, north.py);
      ctx.lineTo(north.px - anx * 8 - any * 4, north.py - any * 8 + anx * 4);
      ctx.lineTo(north.px - anx * 8 + any * 4, north.py - any * 8 - anx * 4);
      ctx.closePath();
      ctx.fillStyle = '#F9C814';
      ctx.fill();

      // Center dot + ring
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#F9C814';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(249,200,20,0.28)';
      ctx.lineWidth   = 0.8;
      ctx.stroke();

      ctx.restore();
    }

    function loop() {
      rotRef.current.x += (mouseRef.current.y * 0.7  - rotRef.current.x) * 0.03;
      rotRef.current.y += (mouseRef.current.x * 1.1  - rotRef.current.y) * 0.03;
      draw();
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    />
  );
}

/* ─────────────────────────────────────────── SUNRAY RINGS */
function SunrayRings() {
  const ref = useRef(null);

  useEffect(() => {
    const fn = () => {
      if (ref.current)
        ref.current.style.transform = `translateY(${window.scrollY * 0.18}px)`;
    };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-0 w-[62%] h-[130%] pointer-events-none select-none z-0"
      style={{ willChange: 'transform' }}
    >
      <svg viewBox="0 0 900 900" fill="none" className="w-full h-full" aria-hidden="true">
        {[...Array(14)].map((_, i) => (
          <circle
            key={i}
            cx={900}
            cy={450}
            r={60 + i * 58}
            stroke="#F9C814"
            strokeWidth={0.8}
            strokeOpacity={Math.max(0, 0.045 - i * 0.003)}
          />
        ))}
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────── DATA */
const NAV_LINKS = [
  { label: 'About',    href: '#manifesto'   },
  { label: 'Work',     href: '#portfolio'   },
  { label: 'Studies',  href: '#case-studies' },
  { label: 'Contact',  href: '#footer'      },
];

const TEAM_BASE = [
  {
    name: 'Baljeet Gujral',
    role: 'Founder & Strategic Advisor',
    sub: 'Harvard · Stanford · Oxford · IIM Calcutta',
    initials: 'BG',
  },
  {
    name: 'Dr. Suraj Kumar',
    role: 'Growth Systems Thinker',
    sub: "PhD · Management | India's Top 100 Young Leaders",
    initials: 'SK',
  },
];
const MARQUEE_SET = Array(10).fill(TEAM_BASE).flat();

const PORTFOLIO = [
  {
    tag: 'PREMIUM F&B · CASE STUDY',
    name: 'Manam Chocolates',
    teaser: 'Running on craft, not a system — until we fixed that.',
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
    teaser: 'Spreading thin across segments with no clear path to traction.',
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
      'Optimized sales channels',
    ],
    outcome: 'Better Visibility & Revenue Flow',
  },
  {
    tag: 'SEGMENT · MSME',
    name: 'Consumer Brands & MSMEs',
    teaser: 'Ambitious brands ready to scale nationally.',
    details: [
      'Sales system design',
      'Retail & distribution optimization',
      'Brand story refinement',
      'Founder coaching',
      'Revenue strategy',
    ],
    outcome: null,
  },
  {
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
    outcomeDetail:
      'A replicable system for store-by-store expansion across premium retail channels.',
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
    outcomeDetail:
      'Sharper customer acquisition and measurable segment growth within 90 days of implementation.',
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
    outcomeDetail:
      'Improved conversion from high-intent visitors and measurable corporate account growth.',
  },
];

/* ─────────────────────────────────────────── PAGE */
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
        <meta property="og:description" content="More than advice. Deep partnerships." />
        <meta property="og:type" content="website" />
      </Head>

      {/* ══ §1  HEADER ══════════════════════════════════════════════ */}
      <header
        className={`fixed inset-x-0 top-0 z-50 bg-[#FAF9F6] transition-all duration-300 ${
          navScrolled ? 'shadow-[0_1px_0_rgba(30,35,66,0.10)]' : ''
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 md:px-14 h-[64px] flex items-center justify-between">

          {/* Brand mark + wordmark */}
          <a href="#" className="group flex items-center gap-2.5 select-none flex-shrink-0">
            <SunwardMark size={32} />
            <span className="hidden sm:inline font-serif text-[13px] font-semibold text-[#1E2342] tracking-[0.18em] uppercase group-hover:text-[#F9C814] transition-colors duration-300">
              Sunward Growth Advisory
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-10" aria-label="Primary navigation">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="font-sans text-[12.5px] text-[#1E2342]/45 hover:text-[#1E2342] transition-colors duration-200 tracking-wide"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* CTA + hamburger */}
          <div className="flex items-center gap-4">
            <a
              href="mailto:info@sunwardgrowth.com"
              className="hidden md:inline-flex items-center gap-2 border border-[#1E2342] text-[#1E2342] font-sans text-[12px] font-medium px-5 py-[10px] rounded-sm tracking-wide hover:bg-[#1E2342] hover:text-[#FAF9F6] transition-all duration-250"
            >
              Book a Discovery Call
              <span className="text-[#F9C814]">↗</span>
            </a>
            <button
              className="md:hidden p-2 -mr-1"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
            >
              {menuOpen
                ? <X size={20} className="text-[#1E2342]" />
                : <Menu size={20} className="text-[#1E2342]" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 bg-[#FAF9F6] border-t border-[rgba(30,35,66,0.08)] ${
            menuOpen ? 'max-h-72' : 'max-h-0'
          }`}
        >
          <div className="px-6 py-7 flex flex-col gap-5">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="font-sans text-[#1E2342]/55 hover:text-[#1E2342] text-[15px] transition-colors"
              >
                {label}
              </a>
            ))}
            <a
              href="mailto:info@sunwardgrowth.com"
              onClick={() => setMenuOpen(false)}
              className="mt-1 inline-flex items-center gap-2 border border-[#1E2342] text-[#1E2342] font-sans text-[13px] font-medium px-5 py-3 rounded-sm hover:bg-[#1E2342] hover:text-[#FAF9F6] transition-all"
            >
              Book a Discovery Call ↗
            </a>
          </div>
        </div>
      </header>

      <main>

        {/* ══ §2  HERO ════════════════════════════════════════════════ */}
        <section className="relative min-h-screen bg-[#FAF9F6] flex flex-col pt-[64px] overflow-hidden">

          {/* Sunray rings — parallax background */}
          <SunrayRings />

          {/* 2-column hero body */}
          <div className="flex-1 flex items-center relative">

            {/* Left: editorial text */}
            <div className="relative z-10 w-full md:w-[52%] flex flex-col items-center md:items-start text-center md:text-left px-6 md:pl-14 xl:pl-20 py-20 md:py-28">

              {/* Eyebrow */}
              <div className="flex items-center gap-4 mb-10">
                <span className="w-10 h-px bg-[#F9C814]" />
                <span className="font-sans text-[10.5px] uppercase tracking-[0.3em] text-[#1E2342]/45">
                  Growth Advisory · Est. 2009
                </span>
                <span className="w-10 h-px bg-[#F9C814]" />
              </div>

              {/* Main headline */}
              <h1
                className="font-serif text-[#1E2342] leading-[1.07] tracking-[-0.022em] mb-8 max-w-2xl"
                style={{ fontSize: 'clamp(3rem, 7vw, 7rem)' }}
              >
                More than advice.
                <br />
                <span className="italic font-light">Deep partnerships.</span>
              </h1>

              {/* Tagline */}
              <p
                className="font-sans font-light text-[#1E2342]/50 max-w-md tracking-wide mb-12 leading-relaxed"
                style={{ fontSize: 'clamp(0.95rem, 1.3vw, 1.05rem)' }}
              >
                Strategy{' '}
                <span className="text-[#F9C814] mx-0.5">·</span>
                {' '}Scale{' '}
                <span className="text-[#F9C814] mx-0.5">·</span>
                {' '}Growth — for MSMEs, Startups, and Universities.
              </p>

              {/* CTA pair */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <a
                  href="mailto:info@sunwardgrowth.com"
                  className="inline-flex items-center gap-2.5 bg-[#1E2342] text-[#FAF9F6] font-sans text-[13px] font-medium tracking-wide px-8 py-4 rounded-sm hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(30,35,66,0.2)] transition-all duration-300"
                >
                  Book a Free Discovery Call
                  <span className="text-[#F9C814] text-[16px] leading-none">↗</span>
                </a>
                <a
                  href="#portfolio"
                  className="inline-flex items-center gap-2 border border-[rgba(30,35,66,0.22)] text-[#1E2342] font-sans text-[13px] font-medium tracking-wide px-8 py-4 rounded-sm hover:border-[#1E2342]/50 hover:bg-[#1E2342]/[0.03] transition-all duration-300"
                >
                  View Our Work
                </a>
              </div>
            </div>

            {/* Right: 3D compass canvas — desktop only */}
            <div className="hidden md:block relative flex-1 self-stretch min-h-[480px] z-10">
              <CompassCanvas />
            </div>
          </div>

          {/* Founder marquee band */}
          <div
            id="team-band"
            className="border-t border-[rgba(30,35,66,0.08)] py-9 overflow-hidden bg-[#FAF9F6] relative z-10"
          >
            <div className="flex marquee-track" style={{ width: 'max-content' }}>
              {[...MARQUEE_SET, ...MARQUEE_SET].map((member, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 flex flex-col items-center px-10 cursor-default"
                >
                  <div className="w-[58px] h-[58px] rounded-full bg-[#1E2342] flex items-center justify-center font-serif text-[#F9C814] text-[1.15rem] font-bold mb-3 ring-[1.5px] ring-offset-[3px] ring-offset-[#FAF9F6] ring-[rgba(30,35,66,0.14)]">
                    {member.initials}
                  </div>
                  <div className="font-serif text-[#1E2342] text-[13.5px] font-semibold text-center whitespace-nowrap leading-tight">
                    {member.name}
                  </div>
                  <div className="font-sans text-[#1E2342]/40 text-[10.5px] tracking-[0.05em] mt-0.5 text-center whitespace-nowrap">
                    {member.role}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ §3  PORTFOLIO MATRIX GRID ════════════════════════════════ */}
        <section
          id="portfolio"
          className="scroll-mt-[64px] bg-[#FAF9F6] px-6 md:px-14 xl:px-20 py-24 border-t border-[rgba(30,35,66,0.08)]"
        >
          <div className="max-w-[1440px] mx-auto">

            <div className="mb-16 max-w-4xl">
              <h2
                className="font-serif text-[#1E2342] font-semibold leading-[1.1] tracking-[-0.022em] mb-5"
                style={{ fontSize: 'clamp(2.2rem, 5.5vw, 5rem)' }}
              >
                Seed. Venture. Growth.{' '}
                <span className="italic font-light">Beyond.</span>
              </h2>
              <p
                className="font-sans font-light text-[#1E2342]/48 leading-relaxed"
                style={{ fontSize: 'clamp(0.95rem, 1.2vw, 1.05rem)' }}
              >
                We're a partner across stages, borders, and breakthroughs.
              </p>
            </div>

            {/* 3×2 grid — 1px gap reveals parent bg as hairline dividers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-[rgba(30,35,66,0.10)] border border-[rgba(30,35,66,0.10)]">
              {PORTFOLIO.map((item, i) => (
                <div
                  key={i}
                  className="group relative bg-[#FAF9F6] min-h-[310px] md:min-h-[330px] overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.025] hover:z-10 hover:shadow-[0_20px_48px_rgba(30,35,66,0.13)]"
                >
                  {/* Gold bottom border — slides in on hover */}
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#F9C814] z-10 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out pointer-events-none" />

                  {/* Default face */}
                  <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-between transition-all duration-[420ms] ease-out group-hover:opacity-0 group-hover:-translate-y-4">
                    <span className="font-sans text-[9.5px] uppercase tracking-[0.26em] font-semibold text-[#F9C814]">
                      {item.tag}
                    </span>
                    <div>
                      <h3
                        className="font-serif text-[#1E2342] font-semibold leading-snug mb-3"
                        style={{ fontSize: 'clamp(1.1rem, 1.5vw, 1.4rem)' }}
                      >
                        {item.name}
                      </h3>
                      <p className="font-sans text-[#1E2342]/42 text-[13px] font-light leading-relaxed">
                        {item.teaser}
                      </p>
                    </div>
                  </div>

                  {/* Hover face */}
                  <div className="absolute inset-0 bg-[#1E2342] p-8 md:p-10 flex flex-col justify-between opacity-0 translate-y-6 pointer-events-none transition-all duration-[420ms] ease-out group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto">
                    <span className="font-sans text-[9.5px] uppercase tracking-[0.26em] font-semibold text-[#F9C814]">
                      {item.tag}
                    </span>
                    <div>
                      <h3
                        className="font-serif text-white font-semibold leading-snug mb-5"
                        style={{ fontSize: 'clamp(1rem, 1.4vw, 1.3rem)' }}
                      >
                        {item.name}
                      </h3>
                      <ul className="space-y-2 mb-6">
                        {item.details.map((line, li) => (
                          <li key={li} className="flex items-start gap-2.5 font-sans text-white/58 text-[12.5px] font-light leading-snug">
                            <span className="text-[#F9C814] mt-[3px] flex-shrink-0 text-[10px] leading-none">→</span>
                            {line}
                          </li>
                        ))}
                      </ul>
                      {item.outcome && (
                        <div className="font-sans text-[9.5px] uppercase tracking-[0.2em] text-[#F9C814]/65 mb-3">
                          Outcome: {item.outcome}
                        </div>
                      )}
                      <span className="inline-flex items-center gap-1.5 font-sans text-[#F9C814] text-[11.5px] font-semibold tracking-[0.1em] border-b border-[#F9C814]/30 pb-px hover:border-[#F9C814] transition-colors">
                        READ MORE →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ §4  MANIFESTO ════════════════════════════════════════════ */}
        <section
          id="manifesto"
          className="scroll-mt-[64px] bg-[#FAF9F6] px-6 md:px-14 xl:px-20 py-28 border-t border-[rgba(30,35,66,0.08)]"
        >
          <div className="max-w-[1440px] mx-auto grid md:grid-cols-[2fr_3fr] gap-20 md:gap-36 items-center">

            <blockquote
              className="font-serif italic font-light text-[#1E2342] leading-[1.4] pl-8 border-l-[2px] border-[#F9C814]"
              style={{ fontSize: 'clamp(1.45rem, 2.6vw, 2.5rem)' }}
            >
              "Great products deserve great business systems."
            </blockquote>

            <div className="space-y-6 font-sans font-light text-[#1E2342]/56 text-[15px] leading-[1.92]">
              <p className="text-[#1E2342] font-normal" style={{ fontSize: 'clamp(1rem, 1.2vw, 1.08rem)' }}>
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

        {/* ══ §5  CASE STUDIES — scroll-triggered dark inversion ═══════ */}
        <section
          id="case-studies"
          ref={csRef}
          className={`scroll-mt-[64px] px-6 md:px-14 xl:px-20 py-28 border-t border-[rgba(30,35,66,0.08)] transition-colors duration-700 ${
            csDark ? 'bg-[#1E2342]' : 'bg-[#FAF9F6]'
          }`}
        >
          <div className="max-w-[1440px] mx-auto">

            {/* Section header */}
            <div className="mb-20 max-w-3xl">
              <div className="flex items-center gap-4 mb-8">
                <span className="w-8 h-px bg-[#F9C814]" />
                <span className={`font-sans text-[10px] uppercase tracking-[0.3em] transition-colors duration-700 ${csDark ? 'text-[#F9C814]' : 'text-[#1E2342]/40'}`}>
                  Client Work
                </span>
              </div>
              <h2
                className={`font-serif font-semibold leading-[1.1] tracking-[-0.02em] mb-5 transition-colors duration-700 ${csDark ? 'text-white' : 'text-[#1E2342]'}`}
                style={{ fontSize: 'clamp(2rem, 4.5vw, 4.2rem)' }}
              >
                What we've{' '}
                <span className="italic font-light">built together.</span>
              </h2>
              <p
                className={`font-sans font-light leading-relaxed transition-colors duration-700 ${csDark ? 'text-white/50' : 'text-[#1E2342]/50'}`}
                style={{ fontSize: 'clamp(0.95rem, 1.2vw, 1.05rem)' }}
              >
                Each engagement starts with diagnosis. Every outcome is earned.
              </p>
            </div>

            {/* Case study cards */}
            <div className="space-y-px">
              {CASE_STUDIES.map((cs) => (
                <div
                  key={cs.index}
                  className={`border transition-colors duration-700 ${
                    csDark ? 'border-white/10' : 'border-[rgba(30,35,66,0.10)]'
                  }`}
                >
                  <div className="p-8 md:p-12 grid md:grid-cols-[auto_1fr_1fr] gap-8 md:gap-16">

                    {/* Index + sector */}
                    <div className="flex md:flex-col gap-4 md:gap-2 items-start md:items-start md:min-w-[80px]">
                      <span className="font-serif text-[#F9C814] text-[2.5rem] font-bold leading-none">
                        {cs.index}
                      </span>
                      <span className={`font-sans text-[9.5px] uppercase tracking-[0.25em] mt-1 transition-colors duration-700 ${csDark ? 'text-white/30' : 'text-[#1E2342]/32'}`}>
                        {cs.sector}
                      </span>
                    </div>

                    {/* Situation */}
                    <div>
                      <h3
                        className={`font-serif font-semibold leading-snug mb-4 transition-colors duration-700 ${csDark ? 'text-white' : 'text-[#1E2342]'}`}
                        style={{ fontSize: 'clamp(1.15rem, 1.6vw, 1.55rem)' }}
                      >
                        {cs.name}
                      </h3>
                      <p className={`font-sans text-[10px] uppercase tracking-[0.2em] mb-3 text-[#F9C814]`}>
                        The Situation
                      </p>
                      <p className={`font-sans font-light text-[14px] leading-[1.85] transition-colors duration-700 ${csDark ? 'text-white/58' : 'text-[#1E2342]/55'}`}>
                        {cs.situation}
                      </p>
                    </div>

                    {/* Approach + outcome */}
                    <div>
                      <p className="font-sans text-[10px] uppercase tracking-[0.2em] mb-4 text-[#F9C814]">
                        Our Approach
                      </p>
                      <ul className="space-y-2.5 mb-8">
                        {cs.approach.map((line, li) => (
                          <li key={li} className={`flex items-start gap-2.5 font-sans font-light text-[13.5px] leading-snug transition-colors duration-700 ${csDark ? 'text-white/55' : 'text-[#1E2342]/55'}`}>
                            <span className="text-[#F9C814] mt-[3px] flex-shrink-0 text-[10px]">→</span>
                            {line}
                          </li>
                        ))}
                      </ul>
                      <div className={`border-t pt-6 transition-colors duration-700 ${csDark ? 'border-white/10' : 'border-[rgba(30,35,66,0.10)]'}`}>
                        <p className="font-sans text-[9.5px] uppercase tracking-[0.22em] text-[#F9C814]/70 mb-1.5">
                          Outcome
                        </p>
                        <p className={`font-serif italic font-light leading-snug mb-1 transition-colors duration-700 ${csDark ? 'text-white' : 'text-[#1E2342]'}`} style={{ fontSize: 'clamp(1rem, 1.3vw, 1.25rem)' }}>
                          {cs.outcome}
                        </p>
                        <p className={`font-sans font-light text-[12.5px] leading-relaxed transition-colors duration-700 ${csDark ? 'text-white/38' : 'text-[#1E2342]/38'}`}>
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
        <section className="bg-[#1E2342]">

          {/* Metric counting bar */}
          <div
            ref={metricsRef}
            className="px-6 md:px-14 xl:px-20 pt-20 pb-16 border-b border-white/[0.06]"
          >
            <div className="max-w-[1440px] mx-auto">
              <p
                className="font-serif italic font-light text-white/[0.065] select-none leading-none mb-14"
                style={{ fontSize: 'clamp(1.9rem, 4.5vw, 4.2rem)' }}
              >
                "Never build without direction."
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-10 md:gap-20">
                {[
                  { n: yearsCount, s: '+', label: 'Years of Experience'     },
                  { n: contCount,  s: '+', label: 'Continents'               },
                  { n: orgsCount,  s: '+', label: 'Organisations Supported'  },
                ].map(({ n, s, label }) => (
                  <div key={label}>
                    <div
                      className="font-serif font-bold text-[#F9C814] tabular-nums leading-none"
                      style={{ fontSize: 'clamp(3.2rem, 6.5vw, 6.5rem)' }}
                    >
                      {n}{s}
                    </div>
                    <div className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-white/32 mt-3">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer id="footer" className="px-6 md:px-14 xl:px-20 pt-16 pb-12">
            <div className="max-w-[1440px] mx-auto">
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-12 mb-16">

                {/* Brand block */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2.5 mb-5">
                    <SunwardMark size={28} />
                    <span className="font-serif text-[12.5px] font-semibold text-white tracking-[0.18em] uppercase">
                      Sunward Growth Advisory
                    </span>
                  </div>
                  <p className="font-sans font-light text-[13px] text-white/28 leading-relaxed max-w-[280px]">
                    Hands-on growth consulting for founders serious about scale.
                    Strategy · Scale · Growth.
                  </p>
                </div>

                {/* Contact */}
                <div>
                  <div className="font-sans text-[9.5px] uppercase tracking-[0.28em] text-[#F9C814] mb-5">
                    General Inquiries
                  </div>
                  <div className="space-y-2 font-sans font-light text-[13px] text-white/38">
                    <div>
                      <a href="mailto:info@sunwardgrowth.com" className="hover:text-white transition-colors duration-200 break-all">
                        info@sunwardgrowth.com
                      </a>
                    </div>
                    <div className="text-[10.5px] text-white/22 uppercase tracking-[0.12em] pt-2">Hotline</div>
                    <div>
                      <a href="tel:+918822456789" className="hover:text-white transition-colors duration-200">
                        +91 88224 56789
                      </a>
                    </div>
                    <div className="pt-2 space-y-0.5">
                      <div className="text-white/55">India</div>
                      <div className="text-white/28 text-[12px]">Bandra, Mumbai 400050</div>
                    </div>
                  </div>
                </div>

                {/* Navigate */}
                <div>
                  <div className="font-sans text-[9.5px] uppercase tracking-[0.28em] text-[#F9C814] mb-5">
                    Navigate
                  </div>
                  <div className="space-y-2.5 font-sans font-light text-[13px] text-white/38">
                    {NAV_LINKS.map(({ label, href }) => (
                      <div key={label}>
                        <a href={href} className="hover:text-white transition-colors duration-200">
                          {label}
                        </a>
                      </div>
                    ))}
                    <div className="pt-1">
                      <a
                        href="mailto:info@sunwardgrowth.com"
                        className="text-[#F9C814]/60 hover:text-[#F9C814] transition-colors duration-200 font-medium"
                      >
                        Book a Discovery Call ↗
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="pt-8 border-t border-white/[0.05] flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <span className="font-sans text-white/16 text-[12px]">
                  © {new Date().getFullYear()} Sunward Growth Advisory. All Rights Reserved.
                </span>
                <span className="font-sans text-white/16 text-[11px] uppercase tracking-[0.18em]">
                  Strategy · Scale · Growth
                </span>
              </div>
            </div>
          </footer>
        </section>

      </main>
    </>
  );
}
