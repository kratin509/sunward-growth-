import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════
   HOOKS
═══════════════════════════════════════════════════════════════════ */
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
      ([entry]) => {
        if (entry.isIntersecting) { setInView(true); obs.unobserve(el); }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ═══════════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════════ */
const NAV_LINKS = [
  { label: 'About',    href: '#manifesto' },
  { label: 'Work',     href: '#portfolio'  },
  { label: 'Team',     href: '#team-band'  },
  { label: 'Contact',  href: '#footer'     },
];

/* Team base — repeated many times for a smooth infinite marquee */
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
/* 10 repetitions × 2 members = 20 items per set; doubled in JSX → 40 total, animate -50% */
const MARQUEE_SET = Array(10).fill(TEAM_BASE).flat();

/* Portfolio grid — 3 case studies + 3 segments */
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

/* ═══════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════ */
export default function Home() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);

  /* Metrics count-up — triggers when the dark section enters view */
  const [metricsRef, metricsInView] = useInView(0.25);
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
        <meta
          name="description"
          content="Hands-on growth consulting for MSMEs, Startups, and Universities. Strategy · Scale · Growth."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Sunward Growth Advisory" />
        <meta property="og:description" content="More than advice. Deep partnerships." />
        <meta property="og:type" content="website" />
      </Head>

      {/* ══════════════════════════════════════════════════════════════
          §1  EDITORIAL HEADER & NAVIGATION
      ══════════════════════════════════════════════════════════════ */}
      <header
        className={`fixed inset-x-0 top-0 z-50 bg-[#FAF9F6] transition-all duration-300 ${
          navScrolled ? 'shadow-[0_1px_0_rgba(10,17,40,0.1)]' : ''
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-8 md:px-14 h-[64px] flex items-center justify-between">

          {/* ── Brand wordmark ── */}
          <a href="#" className="group select-none flex-shrink-0">
            <span className="font-serif text-[13.5px] font-semibold text-[#0A1128] tracking-[0.2em] uppercase group-hover:text-[#F4B41A] transition-colors duration-300">
              Sunward Growth Advisory
            </span>
          </a>

          {/* ── Desktop links ── */}
          <nav className="hidden md:flex items-center gap-10" aria-label="Primary navigation">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="font-sans text-[12.5px] text-[#0A1128]/45 hover:text-[#0A1128] transition-colors duration-200 tracking-wide"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* ── Ghost CTA + hamburger ── */}
          <div className="flex items-center gap-4">
            <a
              href="mailto:info@sunwardgrowth.com"
              className="hidden md:inline-flex items-center gap-2 border border-[#0A1128] text-[#0A1128] font-sans text-[12px] font-medium px-5 py-[10px] rounded-sm tracking-wide group hover:bg-[#0A1128] hover:text-[#FAF9F6] transition-all duration-250"
            >
              Book a Discovery Call
              <span className="text-[#F4B41A]">↗</span>
            </a>

            <button
              className="md:hidden p-2 -mr-1"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
            >
              {menuOpen
                ? <X size={20} className="text-[#0A1128]" />
                : <Menu size={20} className="text-[#0A1128]" />}
            </button>
          </div>
        </div>

        {/* ── Mobile drawer ── */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 bg-[#FAF9F6] border-t border-[rgba(10,17,40,0.08)] ${
            menuOpen ? 'max-h-72' : 'max-h-0'
          }`}
        >
          <div className="px-8 py-7 flex flex-col gap-5">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="font-sans text-[#0A1128]/55 hover:text-[#0A1128] text-[15px] transition-colors"
              >
                {label}
              </a>
            ))}
            <a
              href="mailto:info@sunwardgrowth.com"
              onClick={() => setMenuOpen(false)}
              className="mt-1 inline-flex items-center gap-2 border border-[#0A1128] text-[#0A1128] font-sans text-[13px] font-medium px-5 py-3 rounded-sm hover:bg-[#0A1128] hover:text-[#FAF9F6] transition-all"
            >
              Book a Discovery Call ↗
            </a>
          </div>
        </div>
      </header>

      <main>

        {/* ══════════════════════════════════════════════════════════════
            §2  EDITORIAL HERO + FOUNDER MARQUEE
        ══════════════════════════════════════════════════════════════ */}
        <section className="relative min-h-screen bg-[#FAF9F6] flex flex-col pt-[64px] overflow-hidden">

          {/* Topographic vector overlay — emanates from top-right corner */}
          <svg
            className="absolute top-0 right-0 pointer-events-none select-none"
            style={{ width: 'min(56%, 620px)', height: 'auto' }}
            viewBox="0 0 620 540"
            fill="none"
            aria-hidden="true"
          >
            <clipPath id="topo-clip">
              <rect width="620" height="540" />
            </clipPath>
            <g clipPath="url(#topo-clip)">
              {[...Array(18)].map((_, i) => (
                <ellipse
                  key={i}
                  cx="610"
                  cy="0"
                  rx={52 + i * 46}
                  ry={40 + i * 34}
                  stroke="#0A1128"
                  strokeWidth="0.75"
                  strokeOpacity={Math.max(0.006, 0.07 - i * 0.0036)}
                  fill="none"
                />
              ))}
            </g>
          </svg>

          {/* ── Hero editorial type — vertically centered ── */}
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 md:px-14 pt-12 pb-24">

            {/* Eyebrow pill */}
            <div className="flex items-center gap-4 mb-10">
              <span className="w-10 h-px bg-[#F4B41A]" />
              <span className="font-sans text-[10.5px] uppercase tracking-[0.3em] text-[#0A1128]/45">
                Growth Advisory · Est. 2009
              </span>
              <span className="w-10 h-px bg-[#F4B41A]" />
            </div>

            {/* Main statement */}
            <h1
              className="font-serif text-[#0A1128] leading-[1.07] tracking-[-0.022em] mb-8 max-w-5xl"
              style={{ fontSize: 'clamp(3rem, 9vw, 8.5rem)' }}
            >
              More than advice.
              <br />
              <span className="italic font-light">Deep partnerships.</span>
            </h1>

            {/* Tagline */}
            <p
              className="font-sans font-light text-[#0A1128]/50 max-w-xl tracking-wide mb-12 leading-relaxed"
              style={{ fontSize: 'clamp(0.95rem, 1.3vw, 1.1rem)' }}
            >
              Strategy{' '}
              <span className="text-[#F4B41A] mx-0.5">·</span>
              {' '}Scale{' '}
              <span className="text-[#F4B41A] mx-0.5">·</span>
              {' '}Growth — for MSMEs, Startups, and Universities.
            </p>

            {/* CTA pair */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <a
                href="mailto:info@sunwardgrowth.com"
                className="inline-flex items-center gap-2.5 bg-[#0A1128] text-[#FAF9F6] font-sans text-[13px] font-medium tracking-wide px-8 py-4 rounded-sm hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(10,17,40,0.18)] transition-all duration-300"
              >
                Book a Free Discovery Call
                <span className="text-[#F4B41A] text-[16px] leading-none">↗</span>
              </a>
              <a
                href="#portfolio"
                className="inline-flex items-center gap-2 border border-[rgba(10,17,40,0.22)] text-[#0A1128] font-sans text-[13px] font-medium tracking-wide px-8 py-4 rounded-sm hover:border-[#0A1128]/50 hover:bg-[#0A1128]/[0.025] transition-all duration-300"
              >
                View Our Work
              </a>
            </div>
          </div>

          {/* ── Infinite founder marquee band ── */}
          <div
            id="team-band"
            className="border-t border-[rgba(10,17,40,0.08)] py-9 overflow-hidden bg-[#FAF9F6]"
          >
            {/* Track: MARQUEE_SET doubled → animate -50% = seamless loop */}
            <div
              className="flex marquee-track"
              style={{ width: 'max-content' }}
            >
              {[...MARQUEE_SET, ...MARQUEE_SET].map((member, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 flex flex-col items-center px-10 cursor-default"
                >
                  {/* Circular avatar */}
                  <div className="w-[58px] h-[58px] rounded-full bg-[#0A1128] flex items-center justify-center font-serif text-[#F4B41A] text-[1.15rem] font-bold mb-3 ring-[1.5px] ring-offset-[3px] ring-offset-[#FAF9F6] ring-[rgba(10,17,40,0.14)]">
                    {member.initials}
                  </div>
                  {/* Name */}
                  <div className="font-serif text-[#0A1128] text-[13.5px] font-semibold text-center whitespace-nowrap leading-tight">
                    {member.name}
                  </div>
                  {/* Role */}
                  <div className="font-sans text-[#0A1128]/40 text-[10.5px] tracking-[0.05em] mt-0.5 text-center whitespace-nowrap">
                    {member.role}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            §3  PORTFOLIO MATRIX GRID
        ══════════════════════════════════════════════════════════════ */}
        <section
          id="portfolio"
          className="scroll-mt-[64px] bg-[#FAF9F6] px-6 md:px-14 xl:px-20 py-24 border-t border-[rgba(10,17,40,0.08)]"
        >
          <div className="max-w-[1440px] mx-auto">

            {/* Section header */}
            <div className="mb-16 max-w-4xl">
              <h2
                className="font-serif text-[#0A1128] font-semibold leading-[1.1] tracking-[-0.022em] mb-5"
                style={{ fontSize: 'clamp(2.2rem, 5.5vw, 5rem)' }}
              >
                Seed. Venture. Growth.{' '}
                <span className="italic font-light">Beyond.</span>
              </h2>
              <p
                className="font-sans font-light text-[#0A1128]/48 leading-relaxed"
                style={{ fontSize: 'clamp(0.95rem, 1.2vw, 1.05rem)' }}
              >
                We're a partner across stages, borders, and breakthroughs.
              </p>
            </div>

            {/* 3×2 grid — gap-[1px] against parent bg creates crisp 1px dividers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-[rgba(10,17,40,0.1)] border border-[rgba(10,17,40,0.1)]">
              {PORTFOLIO.map((item, i) => (
                <div
                  key={i}
                  className="group relative bg-[#FAF9F6] min-h-[310px] md:min-h-[330px] overflow-hidden cursor-pointer"
                >

                  {/* ─── Default face: warm canvas, navy type ─── */}
                  <div
                    className={`
                      absolute inset-0 p-8 md:p-10 flex flex-col justify-between
                      transition-all duration-[420ms] ease-out
                      group-hover:opacity-0 group-hover:-translate-y-4
                    `}
                  >
                    {/* Tag */}
                    <span className="font-sans text-[9.5px] uppercase tracking-[0.26em] font-semibold text-[#F4B41A]">
                      {item.tag}
                    </span>

                    {/* Name + teaser */}
                    <div>
                      <h3
                        className="font-serif text-[#0A1128] font-semibold leading-snug mb-3"
                        style={{ fontSize: 'clamp(1.1rem, 1.5vw, 1.4rem)' }}
                      >
                        {item.name}
                      </h3>
                      <p className="font-sans text-[#0A1128]/42 text-[13px] font-light leading-relaxed">
                        {item.teaser}
                      </p>
                    </div>
                  </div>

                  {/* ─── Hover face: deep navy, white type, gold arrow ─── */}
                  <div
                    className={`
                      absolute inset-0 bg-[#0A1128] p-8 md:p-10 flex flex-col justify-between
                      opacity-0 translate-y-6 pointer-events-none
                      transition-all duration-[420ms] ease-out
                      group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto
                    `}
                  >
                    {/* Tag */}
                    <span className="font-sans text-[9.5px] uppercase tracking-[0.26em] font-semibold text-[#F4B41A]">
                      {item.tag}
                    </span>

                    <div>
                      {/* Name */}
                      <h3
                        className="font-serif text-white font-semibold leading-snug mb-5"
                        style={{ fontSize: 'clamp(1rem, 1.4vw, 1.3rem)' }}
                      >
                        {item.name}
                      </h3>

                      {/* Detail lines */}
                      <ul className="space-y-2 mb-6">
                        {item.details.map((line, li) => (
                          <li
                            key={li}
                            className="flex items-start gap-2.5 font-sans text-white/58 text-[12.5px] font-light leading-snug"
                          >
                            <span className="text-[#F4B41A] mt-[3px] flex-shrink-0 text-[10px] leading-none">
                              →
                            </span>
                            {line}
                          </li>
                        ))}
                      </ul>

                      {/* Outcome badge */}
                      {item.outcome && (
                        <div className="font-sans text-[9.5px] uppercase tracking-[0.2em] text-[#F4B41A]/65 mb-3">
                          Outcome: {item.outcome}
                        </div>
                      )}

                      {/* CTA link */}
                      <span className="inline-flex items-center gap-1.5 font-sans text-[#F4B41A] text-[11.5px] font-semibold tracking-[0.1em] border-b border-[#F4B41A]/30 pb-px hover:border-[#F4B41A] transition-colors">
                        READ MORE →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            §4  MANIFESTO — SPLIT EDITORIAL LAYOUT
        ══════════════════════════════════════════════════════════════ */}
        <section
          id="manifesto"
          className="scroll-mt-[64px] bg-[#FAF9F6] px-6 md:px-14 xl:px-20 py-28 border-t border-[rgba(10,17,40,0.08)]"
        >
          <div className="max-w-[1440px] mx-auto grid md:grid-cols-[2fr_3fr] gap-20 md:gap-36 items-center">

            {/* Pull quote */}
            <blockquote
              className="font-serif italic font-light text-[#0A1128] leading-[1.4] pl-8 border-l-[2px] border-[#F4B41A]"
              style={{ fontSize: 'clamp(1.45rem, 2.6vw, 2.5rem)' }}
            >
              "Great products deserve great business systems."
            </blockquote>

            {/* Narrative block */}
            <div className="space-y-6 font-sans font-light text-[#0A1128]/56 text-[15px] leading-[1.92]">
              <p
                className="text-[#0A1128] font-normal"
                style={{ fontSize: 'clamp(1rem, 1.2vw, 1.08rem)' }}
              >
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

        {/* ══════════════════════════════════════════════════════════════
            §5  COUNTING METRICS + LUXURY FOOTER
        ══════════════════════════════════════════════════════════════ */}
        <section className="bg-[#0A1128]">

          {/* ── Metric counting bar ── */}
          <div
            ref={metricsRef}
            className="px-6 md:px-14 xl:px-20 pt-20 pb-16 border-b border-white/[0.06]"
          >
            <div className="max-w-[1440px] mx-auto">

              {/* Watermark quote — large, near-invisible */}
              <p
                className="font-serif italic font-light text-white/[0.065] select-none leading-none mb-14"
                style={{ fontSize: 'clamp(1.9rem, 4.5vw, 4.2rem)' }}
              >
                "Never build without direction."
              </p>

              {/* Numbers */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-10 md:gap-20">
                {[
                  { n: yearsCount, s: '+', label: 'Years of Experience'        },
                  { n: contCount,  s: '+', label: 'Continents'                  },
                  { n: orgsCount,  s: '+', label: 'Organisations Supported'     },
                ].map(({ n, s, label }) => (
                  <div key={label}>
                    <div
                      className="font-serif font-bold text-[#F4B41A] tabular-nums leading-none"
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

          {/* ── Footer ── */}
          <footer id="footer" className="px-6 md:px-14 xl:px-20 pt-16 pb-12">
            <div className="max-w-[1440px] mx-auto">

              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-12 mb-16">

                {/* Brand block */}
                <div className="md:col-span-2">
                  <div className="font-serif text-[13.5px] font-semibold text-white tracking-[0.2em] uppercase mb-[3px]">
                    Sunward Growth Advisory
                  </div>
                  <p className="font-sans font-light text-[13px] text-white/28 leading-relaxed max-w-[280px] mt-5">
                    Hands-on growth consulting for founders serious about scale.
                    Strategy · Scale · Growth.
                  </p>
                </div>

                {/* Contact */}
                <div>
                  <div className="font-sans text-[9.5px] uppercase tracking-[0.28em] text-[#F4B41A] mb-5">
                    General Inquiries
                  </div>
                  <div className="space-y-2 font-sans font-light text-[13px] text-white/38">
                    <div>
                      <a
                        href="mailto:info@sunwardgrowth.com"
                        className="hover:text-white transition-colors duration-200 break-all"
                      >
                        info@sunwardgrowth.com
                      </a>
                    </div>
                    <div className="text-[10.5px] text-white/22 uppercase tracking-[0.12em] pt-2">
                      Hotline
                    </div>
                    <div>
                      <a
                        href="tel:+918822456789"
                        className="hover:text-white transition-colors duration-200"
                      >
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
                  <div className="font-sans text-[9.5px] uppercase tracking-[0.28em] text-[#F4B41A] mb-5">
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
                        className="text-[#F4B41A]/60 hover:text-[#F4B41A] transition-colors duration-200 font-medium"
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
