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
      <circle cx="50" cy="50" r="23" fill="#1E2342" />
      <circle cx="50" cy="50" r="18.5" stroke="#F4B41A" strokeWidth="0.6" strokeOpacity="0.30" fill="none" />
      <circle cx="50" cy="50" r="13"   stroke="#F4B41A" strokeWidth="0.4" strokeOpacity="0.18" fill="none" />
      <polygon points="50,36 47.5,50.5 50,48.5 52.5,50.5" fill="#F4B41A" />
      <polygon points="50,64 47.5,49.5 50,51.5 52.5,49.5" fill="rgba(255,255,255,0.28)" />
      <circle cx="50" cy="50" r="2.5" fill="#F4B41A" />
      <circle cx="50" cy="33.5" r="1.4" fill="#F4B41A" />
    </svg>
  );
}

/* ─────────────────────────────────────────────── WAVE CANVAS
   Cursor-driven pseudo-3D topographic contour animation.
   22 organic closed curves rendered via parametric sine superposition.
   Mouse position drives:
     • formation centre drift
     • yScale (perspective ellipse squish — simulates X-axis tilt)
     • xShear (simulates Y-axis tilt)
   All state lives in refs; zero React re-renders during animation.        */
function WaveCanvas() {
  const canvasRef = useRef(null);
  const mouseRef  = useRef({ x: 600, y: 400 });   // raw mouse (viewport coords)
  const curRef    = useRef({ x: 600, y: 400 });   // lerped smooth position
  const timeRef   = useRef(0);
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onMouse = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    window.addEventListener('mousemove', onMouse, { passive: true });

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

      const mx  = curRef.current.x;
      const my  = curRef.current.y;
      const t   = timeRef.current;
      const IW  = window.innerWidth  || 1440;
      const IH  = window.innerHeight || 800;

      // Normalised mouse (0–1) across full viewport
      const normX = mx / IW;
      const normY = my / IH;

      // Formation centre — gentle drift with mouse
      const cx = W * 0.50 + (normX - 0.5) * 44;
      const cy = H * 0.46 + (normY - 0.5) * 30;

      // Pseudo-3D perspective parameters driven by mouse
      const yScale = 0.48 + normX * 0.24;        // 0.48–0.72  (X-tilt)
      const xShear = (normY - 0.5) * 0.16;       // ±0.08      (Y-tilt)

      const N     = 22;
      const STEPS = 64;

      for (let i = 0; i < N; i++) {
        const rBase = 20 + i * 15;

        ctx.beginPath();
        for (let j = 0; j <= STEPS; j++) {
          const angle = (j / STEPS) * Math.PI * 2;
          // Multi-frequency organic distortion
          const d =
            Math.sin(angle * 3 + t       + i * 0.42) * rBase * 0.22 +
            Math.sin(angle * 5 - t * 1.4 + i * 0.28) * rBase * 0.11 +
            Math.sin(angle * 7 + t * 0.9 + i * 0.17) * rBase * 0.055;
          const r    = rBase + d;
          const cosA = Math.cos(angle);
          const sinA = Math.sin(angle);
          // Apply perspective transform
          const px = cx + cosA * r + sinA * r * xShear;
          const py = cy + sinA * r * yScale + cosA * r * xShear * 0.35;
          j === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();

        const alpha    = Math.max(0.048, 0.28 - i * 0.009);
        const isGold   = i % 3 === 0 || i % 7 === 2;
        ctx.strokeStyle = isGold
          ? `rgba(244,180,26,${(alpha * 1.65).toFixed(3)})`
          : `rgba(30,35,66,${alpha.toFixed(3)})`;
        ctx.lineWidth  = isGold ? 1.0 : 0.75;
        ctx.stroke();
      }

      ctx.restore();
    }

    function loop() {
      // Smooth lerp toward mouse target
      curRef.current.x += (mouseRef.current.x - curRef.current.x) * 0.036;
      curRef.current.y += (mouseRef.current.y - curRef.current.y) * 0.036;
      timeRef.current  += 0.008;
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

/* ─────────────────────────────────────────────── DATA */
const NAV_LINKS = [
  { label: 'About',    href: '#manifesto'    },
  { label: 'Services', href: '#portfolio'    },
  { label: 'Sectors',  href: '#portfolio'    },
  { label: 'Results',  href: '#case-studies' },
  { label: 'Our Team', href: '#team-band'    },
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
              'linear-gradient(to bottom, transparent 0%, rgba(30,35,66,0.14) 12%, rgba(30,35,66,0.14) 88%, transparent 100%)',
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
        className={`fixed inset-x-0 top-0 z-40 bg-[#080E1F] transition-all duration-300 ${
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
              className="group hidden md:inline-flex items-center gap-2 border border-[#F4B41A] text-white font-sans text-[11.5px] font-medium px-5 py-[10px] rounded-sm tracking-[0.04em] transition-all duration-250 hover:bg-[#F4B41A] hover:text-[#1E2342]"
            >
              Book a Discovery Call
              <span className="text-[#F4B41A] group-hover:text-[#1E2342] transition-colors duration-250">↗</span>
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
          className={`md:hidden overflow-hidden transition-all duration-300 bg-[#080E1F] border-t border-white/[0.08] ${
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
              className="mt-1 inline-flex items-center gap-2 border border-[#F4B41A] text-white font-sans text-[13px] font-medium px-5 py-3 rounded-sm hover:bg-[#F4B41A] hover:text-[#1E2342] transition-all"
            >
              Book a Discovery Call ↗
            </a>
          </div>
        </div>
      </header>

      <main>

        {/* ══ §2  HERO — 85 vh cap, left text / right canvas ══════════ */}
        <section className="relative bg-[#FAF9F6] pt-[64px] overflow-hidden">

          {/* Hero body — height capped at 85 vh */}
          <div className="relative min-h-[85vh] flex items-center">

            {/* Interactive canvas — right 55 % of section (desktop only) */}
            <div className="absolute inset-y-0 right-0 w-[55%] hidden md:block">
              <WaveCanvas />
            </div>

            {/* Editorial text block — left column */}
            <div className="relative z-10 w-full max-w-[1440px] mx-auto px-8 md:px-14 py-20">
              <div className="flex flex-col items-center md:items-start text-center md:text-left md:max-w-[46%]">

                {/* Eyebrow */}
                <div className="flex items-center justify-center md:justify-start gap-4 mb-9">
                  <span className="w-8 h-px bg-[#F4B41A]" />
                  <span className="font-sans text-[10px] uppercase tracking-[0.32em] text-[#1E2342]/40">
                    Growth Advisory · Est. 2009
                  </span>
                  <span className="w-8 h-px bg-[#F4B41A] md:hidden" />
                </div>

                {/* Headline — crisp editorial scale, two lines */}
                <h1
                  className="font-serif text-[#1E2342] leading-[1.10] tracking-[-0.020em] mb-7"
                  style={{ fontSize: 'clamp(2.4rem, 3.5vw, 4.2rem)' }}
                >
                  Your North Star for
                  <br />
                  <span className="italic font-light">Business Transformation.</span>
                </h1>

                {/* Tagline */}
                <p
                  className="font-sans font-light text-[#1E2342]/48 tracking-[0.065em] mb-12 leading-relaxed max-w-sm md:max-w-none"
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
                    className="inline-flex items-center gap-2.5 bg-[#1E2342] text-[#FAF9F6] font-sans text-[12px] font-medium tracking-[0.05em] px-7 py-[13px] rounded-sm hover:bg-[#F4B41A] hover:text-[#1E2342] hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(244,180,26,0.30)] transition-all duration-300"
                  >
                    Book a Free Discovery Call
                    <span className="text-[14px] leading-none">↗</span>
                  </a>
                  <a
                    href="#portfolio"
                    className="inline-flex items-center gap-2 border border-[rgba(30,35,66,0.22)] text-[#1E2342] font-sans text-[12px] font-medium tracking-[0.05em] px-7 py-[13px] rounded-sm hover:border-[#F4B41A] hover:bg-[rgba(244,180,26,0.07)] transition-all duration-300"
                  >
                    View Our Work
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Infinite founder marquee band */}
          <div
            id="team-band"
            className="relative z-10 border-t border-[rgba(30,35,66,0.08)] py-9 overflow-hidden bg-[#FAF9F6]"
          >
            <div className="flex marquee-track" style={{ width: 'max-content' }}>
              {[...MARQUEE_SET, ...MARQUEE_SET].map((member, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 flex flex-col items-center px-10 cursor-default"
                >
                  <div className="w-[54px] h-[54px] rounded-full bg-[#1E2342] flex items-center justify-center font-serif text-[#F4B41A] text-[1.05rem] font-bold mb-3 ring-[1.5px] ring-offset-[3px] ring-offset-[#FAF9F6] ring-[rgba(30,35,66,0.12)]">
                    {member.initials}
                  </div>
                  <div className="font-serif text-[#1E2342] text-[13px] font-semibold text-center whitespace-nowrap leading-tight">
                    {member.name}
                  </div>
                  <div className="font-sans text-[#1E2342]/40 text-[10px] tracking-[0.05em] mt-0.5 text-center whitespace-nowrap">
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
                className="font-serif text-[#1E2342] font-semibold leading-[1.08] tracking-[-0.024em] mb-5"
                style={{ fontSize: 'clamp(2.2rem, 5.5vw, 5rem)' }}
              >
                Seed. Venture. Growth.{' '}
                <span className="italic font-light">Beyond.</span>
              </h2>
              <p
                className="font-sans font-light text-[#1E2342]/48 leading-relaxed tracking-[0.02em]"
                style={{ fontSize: 'clamp(0.92rem, 1.2vw, 1.04rem)' }}
              >
                We're a partner across stages, borders, and breakthroughs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-[rgba(30,35,66,0.10)] border border-[rgba(30,35,66,0.10)]">
              {PORTFOLIO.map((item, i) => (
                <div
                  key={i}
                  className={`group relative min-h-[240px] md:min-h-[256px] overflow-hidden cursor-pointer transition-all duration-300 hover:z-10 ${
                    item.logo
                      ? 'bg-[#FAF9F6] hover:scale-[1.02] hover:shadow-[0_20px_52px_rgba(30,35,66,0.13)]'
                      : item.segment
                        ? 'bg-[#0D1528]'
                        : 'bg-[#FAF9F6] hover:scale-[1.02] hover:shadow-[0_20px_52px_rgba(30,35,66,0.13)]'
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
                        <span className="mt-4 font-sans text-[8.5px] uppercase tracking-[0.26em] font-semibold text-[#1E2342]/28">
                          {item.tag}
                        </span>
                      </div>

                      {/* Logo card — hover: dark, logo top-left + blurb + READ MORE */}
                      <div className="absolute inset-0 bg-[#0D1528] p-7 md:p-8 flex flex-col justify-between opacity-0 translate-y-4 pointer-events-none transition-all duration-[380ms] ease-out group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto">
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
                          <p className="font-sans text-white/72 text-[12.5px] font-light leading-relaxed mb-4">
                            {item.teaser}
                          </p>
                          <ul className="space-y-1.5">
                            {item.details.slice(0, 3).map((line, li) => (
                              <li key={li} className="flex items-start gap-2 font-sans text-white/58 text-[11.5px] font-light leading-snug group-hover:text-white/78 transition-colors duration-300">
                                <span className="text-[#F4B41A]/70 mt-[3px] flex-shrink-0 text-[9px] group-hover:text-[#F4B41A] transition-colors duration-300">→</span>
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
                            className="font-serif text-[#1E2342] font-semibold leading-snug mb-2.5"
                            style={{ fontSize: 'clamp(1.02rem, 1.4vw, 1.28rem)' }}
                          >
                            {item.name}
                          </h3>
                          <p className="font-sans text-[#1E2342]/45 text-[12.5px] font-light leading-relaxed">
                            {item.teaser}
                          </p>
                        </div>
                      </div>

                      <div className="absolute inset-0 bg-[#0D1528] p-7 md:p-8 flex flex-col justify-between opacity-0 translate-y-5 pointer-events-none transition-all duration-[400ms] ease-out group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto">
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
          className="scroll-mt-[64px] bg-[#FAF9F6] px-6 md:px-14 xl:px-20 py-28 border-t border-[rgba(30,35,66,0.08)]"
        >
          <div className="max-w-[1440px] mx-auto grid md:grid-cols-[2fr_3fr] gap-20 md:gap-36 items-center">

            <blockquote
              className="font-serif italic font-light text-[#1E2342] leading-[1.42] pl-8 border-l-[2px] border-[#F4B41A]"
              style={{ fontSize: 'clamp(1.45rem, 2.6vw, 2.5rem)' }}
            >
              "Great products deserve great business systems."
            </blockquote>

            <div className="space-y-6 font-sans font-light text-[#1E2342]/54 text-[15px] leading-[1.92]">
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

        {/* ══ §5  CASE STUDIES — scroll-triggered dark ═════════════════ */}
        <section
          id="case-studies"
          ref={csRef}
          className={`scroll-mt-[64px] px-6 md:px-14 xl:px-20 py-28 border-t border-[rgba(30,35,66,0.08)] transition-colors duration-700 ${
            csDark ? 'bg-[#1E2342]' : 'bg-[#FAF9F6]'
          }`}
        >
          <div className="max-w-[1440px] mx-auto">

            <div className="mb-20 max-w-3xl">
              <div className="flex items-center gap-4 mb-8">
                <span className="w-8 h-px bg-[#F4B41A]" />
                <span className={`font-sans text-[10px] uppercase tracking-[0.3em] transition-colors duration-700 ${csDark ? 'text-[#F4B41A]' : 'text-[#1E2342]/38'}`}>
                  Client Work
                </span>
              </div>
              <h2
                className={`font-serif font-semibold leading-[1.1] tracking-[-0.022em] mb-5 transition-colors duration-700 ${csDark ? 'text-white' : 'text-[#1E2342]'}`}
                style={{ fontSize: 'clamp(2rem, 4.5vw, 4.2rem)' }}
              >
                What we've{' '}
                <span className="italic font-light">built together.</span>
              </h2>
              <p
                className={`font-sans font-light leading-relaxed tracking-[0.02em] transition-colors duration-700 ${csDark ? 'text-white/48' : 'text-[#1E2342]/48'}`}
                style={{ fontSize: 'clamp(0.92rem, 1.2vw, 1.04rem)' }}
              >
                Each engagement starts with diagnosis. Every outcome is earned.
              </p>
            </div>

            <div className="space-y-px">
              {CASE_STUDIES.map((cs) => (
                <div
                  key={cs.index}
                  className={`border transition-colors duration-700 ${csDark ? 'border-white/[0.09]' : 'border-[rgba(30,35,66,0.09)]'}`}
                >
                  <div className="p-8 md:p-12 grid md:grid-cols-[88px_1fr_1fr] gap-8 md:gap-14">

                    <div className="flex md:flex-col gap-4 md:gap-2">
                      <span className="font-serif text-[#F4B41A] font-bold leading-none" style={{ fontSize: 'clamp(2rem, 3vw, 2.8rem)' }}>
                        {cs.index}
                      </span>
                      <span className={`font-sans text-[9px] uppercase tracking-[0.25em] md:mt-1 transition-colors duration-700 ${csDark ? 'text-white/28' : 'text-[#1E2342]/30'}`}>
                        {cs.sector}
                      </span>
                    </div>

                    <div>
                      <h3
                        className={`font-serif font-semibold leading-snug mb-4 transition-colors duration-700 ${csDark ? 'text-white' : 'text-[#1E2342]'}`}
                        style={{ fontSize: 'clamp(1.12rem, 1.6vw, 1.5rem)' }}
                      >
                        {cs.name}
                      </h3>
                      <p className="font-sans text-[9px] uppercase tracking-[0.22em] mb-3 text-[#F4B41A]">
                        The Situation
                      </p>
                      <p className={`font-sans font-light text-[14px] leading-[1.88] transition-colors duration-700 ${csDark ? 'text-white/55' : 'text-[#1E2342]/52'}`}>
                        {cs.situation}
                      </p>
                    </div>

                    <div>
                      <p className="font-sans text-[9px] uppercase tracking-[0.22em] mb-4 text-[#F4B41A]">
                        Our Approach
                      </p>
                      <ul className="space-y-2.5 mb-8">
                        {cs.approach.map((line, li) => (
                          <li key={li} className={`flex items-start gap-2.5 font-sans font-light text-[13.5px] leading-snug transition-colors duration-700 ${csDark ? 'text-white/52' : 'text-[#1E2342]/52'}`}>
                            <span className="text-[#F4B41A] mt-[3px] flex-shrink-0 text-[10px]">→</span>
                            {line}
                          </li>
                        ))}
                      </ul>
                      <div className={`border-t pt-6 transition-colors duration-700 ${csDark ? 'border-white/[0.09]' : 'border-[rgba(30,35,66,0.09)]'}`}>
                        <p className="font-sans text-[9px] uppercase tracking-[0.22em] text-[#F4B41A]/70 mb-1.5">
                          Outcome
                        </p>
                        <p
                          className={`font-serif italic font-light leading-snug mb-1 transition-colors duration-700 ${csDark ? 'text-white' : 'text-[#1E2342]'}`}
                          style={{ fontSize: 'clamp(1rem, 1.3vw, 1.22rem)' }}
                        >
                          {cs.outcome}
                        </p>
                        <p className={`font-sans font-light text-[12.5px] leading-relaxed transition-colors duration-700 ${csDark ? 'text-white/36' : 'text-[#1E2342]/36'}`}>
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

          <div
            ref={metricsRef}
            className="px-6 md:px-14 xl:px-20 pt-20 pb-16 border-b border-white/[0.06]"
          >
            <div className="max-w-[1440px] mx-auto">
              <p
                className="font-serif italic font-light text-white/[0.062] select-none leading-none mb-14"
                style={{ fontSize: 'clamp(1.9rem, 4.5vw, 4.2rem)' }}
              >
                "Never build without direction."
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-10 md:gap-20">
                {[
                  { n: yearsCount, s: '+', label: 'Years of Experience'    },
                  { n: contCount,  s: '+', label: 'Continents'              },
                  { n: orgsCount,  s: '+', label: 'Organisations Supported' },
                ].map(({ n, s, label }) => (
                  <div key={label}>
                    <div
                      className="font-serif font-bold text-[#F4B41A] tabular-nums leading-none"
                      style={{ fontSize: 'clamp(3.2rem, 6.5vw, 6.5rem)' }}
                    >
                      {n}{s}
                    </div>
                    <div className="font-sans text-[10px] uppercase tracking-[0.22em] text-white/30 mt-3">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <footer id="footer" className="px-6 md:px-14 xl:px-20 pt-16 pb-12">
            <div className="max-w-[1440px] mx-auto">
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-12 mb-16">

                <div className="md:col-span-2">
                  <div className="flex items-center gap-2.5 mb-5">
                    <SunwardMark size={26} />
                    <span className="font-serif text-[12px] font-semibold text-white tracking-[0.18em] uppercase">
                      Sunward Growth Advisory
                    </span>
                  </div>
                  <p className="font-sans font-light text-[13px] text-white/26 leading-relaxed max-w-[280px]">
                    Hands-on growth consulting for founders serious about scale.
                    Strategy · Scale · Growth.
                  </p>
                </div>

                <div>
                  <div className="font-sans text-[9px] uppercase tracking-[0.28em] text-[#F4B41A] mb-5">
                    General Inquiries
                  </div>
                  <div className="space-y-2 font-sans font-light text-[13px] text-white/36">
                    <div>
                      <a href="mailto:info@sunwardgrowth.com" className="hover:text-white transition-colors duration-200 break-all">
                        info@sunwardgrowth.com
                      </a>
                    </div>
                    <div className="text-[10px] text-white/22 uppercase tracking-[0.12em] pt-2">Hotline</div>
                    <div>
                      <a href="tel:+918822456789" className="hover:text-white transition-colors duration-200">
                        +91 88224 56789
                      </a>
                    </div>
                    <div className="pt-2 space-y-0.5">
                      <div className="text-white/52">India</div>
                      <div className="text-white/26 text-[12px]">Bandra, Mumbai 400050</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="font-sans text-[9px] uppercase tracking-[0.28em] text-[#F4B41A] mb-5">
                    Navigate
                  </div>
                  <div className="space-y-2.5 font-sans font-light text-[13px] text-white/36">
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
                        className="text-[#F4B41A]/60 hover:text-[#F4B41A] transition-colors duration-200 font-medium"
                      >
                        Book a Discovery Call ↗
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/[0.05] flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <span className="font-sans text-white/14 text-[12px]">
                  © {new Date().getFullYear()} Sunward Growth Advisory. All Rights Reserved.
                </span>
                <span className="font-sans text-white/14 text-[11px] uppercase tracking-[0.18em]">
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
