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
      const e = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setValue(Math.floor(e * target));
      if (p < 1) requestAnimationFrame(tick);
      else setValue(target);
    };
    requestAnimationFrame(tick);
    return () => { cancelled = true; };
  }, [target, duration, trigger]);
  return value;
}

function useInView(threshold = 0.15) {
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

/* ═══════════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════════ */
const NAV_LINKS = [
  { label: 'About',    href: '#manifesto' },
  { label: 'Services', href: '#services'  },
  { label: 'Sectors',  href: '#sectors'   },
  { label: 'Results',  href: '#results'   },
  { label: 'Our Team', href: '#team'      },
];

const CAPABILITIES = [
  {
    num: '01',
    title: 'Diagnose Growth Blockers',
    desc: 'Surface the real constraints killing your growth — before throwing more resources at the wrong problem.',
  },
  {
    num: '02',
    title: 'Build Simple Growth Plans',
    desc: 'Clear, actionable roadmaps your team can execute on Monday. No 80-page decks, just what matters.',
  },
  {
    num: '03',
    title: 'Improve Retail & Distribution',
    desc: 'Optimize how your product reaches shelves and customers at every touchpoint.',
  },
  {
    num: '04',
    title: 'GTM Execution & Scale',
    desc: 'Channel strategy, sales motion design, revenue strategy, and launch playbooks that drive real revenue.',
  },
];

const SEGMENTS = [
  {
    title: 'Consumer Brands & MSMEs',
    target: 'Ambitious brands ready to scale.',
    features: [
      'Sales system design',
      'Retail & distribution optimization',
      'Brand story refinement',
      'Founder coaching',
      'Revenue strategy',
    ],
  },
  {
    title: 'Early-Stage Startups',
    target: 'Pre-seed to Series A founders.',
    features: [
      'Fundraising support & pitch coaching',
      'Go-to-market execution',
      'Investor readiness',
      'Strategic partnership structuring',
      'Scaling systems & ops design',
    ],
  },
  {
    title: 'University Innovation Hubs',
    target: "Building India's innovation ecosystem.",
    features: [
      'Incubator setup & policy framework',
      'Government grant strategy (DST, BIRAC, AIM)',
      'Demo Day design & execution',
      'Startup funding pipeline',
      'Mentor & investor network setup',
    ],
  },
];

const METRIC_TABS = {
  msme: {
    label: 'MSMEs',
    numericValue: 50,
    display: (n) => `${n}+`,
    counterLabel: 'Consumer Brands Advised',
    context: 'Optimizing how physical products reach shelves and create consistent, compounding revenue.',
  },
  startup: {
    label: 'Startups',
    numericValue: 200,
    display: (n) => `₹${n}Cr+`,
    counterLabel: 'Capital Raised For Clients',
    context: 'Providing investor readiness, pitching frameworks, and fundraising strategy that closes rounds.',
  },
  university: {
    label: 'Universities',
    numericValue: 200,
    display: (n) => `${n}+`,
    counterLabel: 'Ecosystem Collaborations',
    context: 'Building institutional policy layouts, running demo days, and wiring startup funding pipelines.',
  },
};

const CASE_STUDIES = [
  {
    num: '01',
    brand: 'Manam Chocolates',
    tag: 'PREMIUM F&B',
    situation:
      'Great product and devoted customers, yet sales stayed inconsistent and revenue unpredictable. Running on craft, not a system.',
    approach: [
      'Clarified brand positioning',
      'Built structured sales funnel',
      'Improved retail storytelling',
    ],
    results: ['Clear Growth Direction', 'Better Store Performance', 'Stronger Customer Connect'],
  },
  {
    num: '02',
    brand: 'Mahati Wellness',
    tag: 'WELLNESS',
    situation:
      'Chasing too many customer segments at once, without a clear go to market strategy. Hard to gain traction in any single channel.',
    approach: [
      'Defined target customers with precision',
      'Built a complete GTM strategy',
      'Refined sales messaging',
    ],
    results: ['Clear Market Direction', 'Stronger Positioning', 'Smarter Acquisition'],
  },
  {
    num: '03',
    brand: 'Varai Hospitality',
    tag: 'HOSPITALITY',
    situation:
      'Premium properties and bold vision, but no strategic framework to consistently convert interest into high value bookings.',
    approach: [
      'Developed revenue strategy',
      'Created experience led branding',
      'Optimized sales channels',
    ],
    results: ['Better Visibility', 'Higher Engagement', 'Stronger Revenue Flow'],
  },
];

const TEAM = [
  {
    name: 'Baljeet Gujral',
    role: 'Founder & Strategic Advisor',
    credentials: 'Harvard • Stanford • Oxford • IIM Calcutta',
    initials: 'BG',
    bio: '15+ years turning ambitious ideas into real businesses. Baljeet has built and scaled ventures across sales, strategy, and operations — partnering with brands at every stage, from early-stage startups searching for product-market fit to established companies scaling nationally. He is the founder of Enfield Riders and Bucket List Experiences, ventures that redefined travel and lifestyle experiences in India.',
    awards: null,
  },
  {
    name: 'Dr. Suraj Kumar',
    role: 'Research-Led Strategist & Mentor',
    credentials: 'PhD · Management',
    initials: 'SK',
    bio: "Combines academic rigour with entrepreneurial execution to build high-impact growth systems. Expertise spanning Entrepreneurship, Marketing, Org Behavior, and Innovation. Founder of The Dehradun Street with over 200+ organizations collaborated with. Recipient of India's Top 100 Young Leaders and Engaging Young India Award.",
    awards: ["India's Top 100 Young Leaders", 'Engaging Young India Award'],
  },
];

/* ═══════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════ */
export default function Home() {
  /* ── state ── */
  const [navScrolled, setNavScrolled] = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [hoverCap,    setHoverCap]    = useState(null);
  const [hoverSeg,    setHoverSeg]    = useState(null);
  const [metricTab,   setMetricTab]   = useState('msme');
  const [metricCount, setMetricCount] = useState(0);

  /* ── hero in-view trigger for count-ups ── */
  const [heroRef, heroInView] = useInView(0.25);
  const yearsCount = useCountUp(15,  1800, heroInView);
  const contCount  = useCountUp(3,   1000, heroInView);
  const orgsCount  = useCountUp(200, 2200, heroInView);

  /* ── nav opacity on scroll ── */
  useEffect(() => {
    const fn = () => setNavScrolled(window.scrollY > 24);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  /* ── metric tab count-up (resets every tab switch) ── */
  useEffect(() => {
    const { numericValue } = METRIC_TABS[metricTab];
    setMetricCount(0);
    let cancelled = false;
    const t0 = performance.now();
    const tick = (now) => {
      if (cancelled) return;
      const p = Math.min((now - t0) / 1200, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setMetricCount(Math.floor(e * numericValue));
      if (p < 1) requestAnimationFrame(tick);
      else setMetricCount(numericValue);
    };
    requestAnimationFrame(tick);
    return () => { cancelled = true; };
  }, [metricTab]);

  const tab = METRIC_TABS[metricTab];

  /* ── close mobile menu on route hash ── */
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <Head>
        <title>Sunward Growth Advisory | Your North Star for Business Transformation</title>
        <meta
          name="description"
          content="Hands-on growth consulting for MSMEs, Startups, and Universities. Strategy · Scale · Growth."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Sunward Growth Advisory | Your North Star for Business Transformation" />
        <meta property="og:description" content="Strategy · Scale · Growth — 15+ years, 200+ organisations, 3 continents." />
        <meta property="og:type" content="website" />
      </Head>

      {/* ══════════════════════════════════════════
          §1  GLOBAL NAVIGATION HEADER
      ══════════════════════════════════════════ */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          navScrolled
            ? 'bg-[#0A1128]/93 backdrop-blur-xl border-b border-white/[0.06]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-14 h-[68px] flex items-center justify-between">

          {/* Logo */}
          <a href="#" className="group select-none flex-shrink-0">
            <div className="font-serif text-[15px] font-semibold text-white tracking-[0.13em] leading-none group-hover:text-[#F4B41A] transition-colors duration-300">
              SUNWARD GROWTH
            </div>
            <div className="text-[#F4B41A] font-sans text-[8.5px] tracking-[0.3em] uppercase mt-[3px]">
              Advisory
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-9" aria-label="Primary">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-[12.5px] text-white/45 hover:text-white/90 transition-colors duration-200 font-sans tracking-wide"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA + hamburger */}
          <div className="flex items-center gap-4">
            <a
              href="mailto:info@sunwardgrowth.com"
              className="hidden md:inline-flex items-center gap-1.5 border border-[#F4B41A]/55 text-[#F4B41A] text-[12px] font-sans font-medium px-5 py-[9px] rounded-sm tracking-wide hover:bg-[#F4B41A] hover:text-[#0A1128] hover:border-[#F4B41A] transition-all duration-250"
            >
              Book a Discovery Call
              <ArrowUpRight size={12} strokeWidth={2.5} />
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
          className={`md:hidden overflow-hidden transition-all duration-350 bg-[#060B1A] border-t border-white/[0.05] ${
            menuOpen ? 'max-h-[24rem]' : 'max-h-0'
          }`}
        >
          <div className="px-6 py-7 flex flex-col gap-5">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={closeMenu}
                className="text-white/55 hover:text-white text-[15px] font-sans transition-colors"
              >
                {label}
              </a>
            ))}
            <a
              href="mailto:info@sunwardgrowth.com"
              onClick={closeMenu}
              className="mt-1 inline-flex justify-center items-center gap-2 border border-[#F4B41A]/55 text-[#F4B41A] text-[13px] font-sans px-5 py-3 rounded-sm tracking-wide hover:bg-[#F4B41A] hover:text-[#0A1128] transition-all"
            >
              Book a Discovery Call <ArrowUpRight size={13} />
            </a>
          </div>
        </div>
      </header>

      <main>

        {/* ══════════════════════════════════════════
            §2  HERO
        ══════════════════════════════════════════ */}
        <section
          ref={heroRef}
          className="relative min-h-screen flex flex-col justify-center bg-[#0A1128] px-6 md:px-14 xl:px-24 overflow-hidden"
        >
          {/* Grid mesh */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)',
              backgroundSize: '72px 72px',
              maskImage: 'radial-gradient(ellipse 90% 70% at 50% 0%, black 45%, transparent 100%)',
            }}
          />
          {/* Ambient gold glow */}
          <div
            aria-hidden
            className="absolute -top-10 right-[8%] w-[700px] h-[550px] pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at 60% 30%, rgba(244,180,26,0.055) 0%, transparent 65%)',
            }}
          />

          <div className="relative z-10 max-w-[1400px] mx-auto w-full pt-32 pb-20">
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-10">
              <span className="w-8 h-px bg-[#F4B41A]" />
              <span className="text-[#F4B41A] font-sans text-[10.5px] uppercase tracking-[0.3em]">
                Sunward Growth Advisory
              </span>
            </div>

            {/* Main headline */}
            <h1
              className="font-serif font-semibold text-white leading-[1.07] tracking-[-0.025em] mb-8"
              style={{ fontSize: 'clamp(2.8rem, 7.5vw, 6.5rem)' }}
            >
              Your North Star for{' '}
              <span className="italic font-light text-[#F4B41A]">
                Business&nbsp;Transformation.
              </span>
            </h1>

            {/* Tagline */}
            <p
              className="font-sans font-light text-[#8A99AD] leading-relaxed mb-14 max-w-2xl tracking-wide"
              style={{ fontSize: 'clamp(1rem, 1.4vw, 1.2rem)' }}
            >
              Strategy{' '}
              <span className="text-[#F4B41A] mx-1">·</span>
              {' '}Scale{' '}
              <span className="text-[#F4B41A] mx-1">·</span>
              {' '}Growth — for MSMEs, Startups, and Universities.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-28">
              <a
                href="mailto:info@sunwardgrowth.com"
                className="inline-flex items-center justify-center gap-2 bg-[#F4B41A] text-[#0A1128] font-sans text-[13px] font-semibold tracking-wide px-8 py-4 rounded-sm hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(244,180,26,0.28)] transition-all duration-300"
              >
                Book a Free Discovery Call
                <ArrowUpRight size={14} strokeWidth={2.5} />
              </a>
              <a
                href="#services"
                className="inline-flex items-center justify-center gap-2 border border-white/18 text-white font-sans text-[13px] font-medium tracking-wide px-8 py-4 rounded-sm hover:border-white/40 hover:bg-white/[0.03] transition-all duration-300"
              >
                View Our Services
              </a>
            </div>

            {/* Metrics banner */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-8 pt-10 border-t border-white/[0.07]">
              {[
                { n: yearsCount, s: '+', label: 'Years Experience'        },
                { n: contCount,  s: '+', label: 'Continents'              },
                { n: orgsCount,  s: '+', label: 'Organisations Supported' },
              ].map(({ n, s, label }) => (
                <div key={label}>
                  <div
                    className="font-serif font-bold text-[#F4B41A] tabular-nums"
                    style={{ fontSize: 'clamp(2.2rem, 4vw, 3.6rem)' }}
                  >
                    {n}{s}
                  </div>
                  <div className="mt-1.5 font-sans text-[10.5px] uppercase tracking-[0.2em] text-[#8A99AD]">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            §3  MANIFESTO
        ══════════════════════════════════════════ */}
        <section
          id="manifesto"
          className="scroll-mt-[68px] bg-[#060B1A] px-6 md:px-14 xl:px-24 py-28 border-t border-white/[0.05]"
        >
          <div className="max-w-[1400px] mx-auto grid md:grid-cols-[2fr_3fr] gap-16 md:gap-28 items-center">
            {/* Left – pull quote */}
            <blockquote
              className="font-serif italic font-light text-[#F4B41A] leading-[1.38] pl-8 border-l-[2px] border-[#F4B41A]/35"
              style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2.55rem)' }}
            >
              "Great products deserve great business systems."
            </blockquote>

            {/* Right – body copy */}
            <div className="space-y-6 font-sans font-light text-[#8A99AD] text-[15px] leading-[1.9]">
              <p className="text-white font-normal text-[17px]">
                We don't just advise. We build alongside you.
              </p>
              <p>
                Sunward Growth Advisory is a hands-on growth consulting firm partnering with consumer
                brands, startups, and institutions at every stage — from finding product-market fit to
                scaling nationally.
              </p>
              <p>
                We work shoulder-to-shoulder with founders and leaders to build the infrastructure that
                turns ambition into measurable, compounding growth.
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            §4  INTERACTIVE CAPABILITIES ACCORDION
        ══════════════════════════════════════════ */}
        <section
          id="services"
          className="scroll-mt-[68px] bg-[#0A1128] px-6 md:px-14 xl:px-24 py-24 border-t border-white/[0.05]"
        >
          <div className="max-w-[1400px] mx-auto">
            <div className="mb-14">
              <span className="block font-sans text-[#F4B41A] text-[10.5px] uppercase tracking-[0.3em] mb-3">
                Capabilities
              </span>
              <h2
                className="font-serif text-white font-semibold"
                style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)' }}
              >
                Our Growth Pillars
              </h2>
            </div>

            <div className="border-t border-white/[0.07]">
              {CAPABILITIES.map((cap, i) => (
                <div
                  key={i}
                  className={`border-b border-white/[0.07] transition-all duration-500 cursor-default ${
                    hoverCap === i ? 'py-10 px-5 bg-white/[0.016]' : 'py-7 px-0'
                  }`}
                  onMouseEnter={() => setHoverCap(i)}
                  onMouseLeave={() => setHoverCap(null)}
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-start gap-7 flex-1 min-w-0">
                      {/* Number */}
                      <span
                        className={`font-mono text-xs pt-[0.6rem] flex-shrink-0 transition-colors duration-300 ${
                          hoverCap === i ? 'text-[#F4B41A]' : 'text-white/20'
                        }`}
                      >
                        {cap.num}
                      </span>

                      {/* Title + collapsible description */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-serif font-semibold transition-colors duration-300 ${
                            hoverCap === i ? 'text-[#F4B41A]' : 'text-white'
                          }`}
                          style={{ fontSize: 'clamp(1.15rem, 2.4vw, 2rem)' }}
                        >
                          {cap.title}
                        </h3>

                        {/* Reveal pane */}
                        <div
                          className={`overflow-hidden transition-all duration-500 ${
                            hoverCap === i
                              ? 'max-h-32 opacity-100 mt-3.5'
                              : 'max-h-0 opacity-0 mt-0'
                          }`}
                        >
                          <p className="font-sans font-light text-[14px] text-[#8A99AD] leading-relaxed pr-8">
                            {cap.desc}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Arrow indicator */}
                    <div
                      className={`flex-shrink-0 pt-[0.4rem] transition-all duration-300 ${
                        hoverCap === i
                          ? 'opacity-100 translate-x-0'
                          : 'opacity-0 -translate-x-3'
                      }`}
                    >
                      <ArrowUpRight size={18} className="text-[#F4B41A]" strokeWidth={2} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            §5  PORTFOLIO SECTOR CARDS
        ══════════════════════════════════════════ */}
        <section
          id="sectors"
          className="scroll-mt-[68px] bg-[#060B1A] px-6 md:px-14 xl:px-24 py-24 border-t border-white/[0.05]"
        >
          <div className="max-w-[1400px] mx-auto">
            <div className="mb-14">
              <span className="block font-sans text-[#F4B41A] text-[10.5px] uppercase tracking-[0.3em] mb-3">
                Target Segments
              </span>
              <h2
                className="font-serif text-white font-semibold"
                style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)' }}
              >
                Three Distinct Segments.{' '}
                <span className="italic font-light text-white/38">One Growth Philosophy.</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-[1px] bg-white/[0.06] overflow-hidden rounded-sm">
              {SEGMENTS.map((seg, i) => (
                <div
                  key={i}
                  className="relative bg-[#0A1128] min-h-[360px] overflow-hidden cursor-default"
                  onMouseEnter={() => setHoverSeg(i)}
                  onMouseLeave={() => setHoverSeg(null)}
                >
                  {/* Default face */}
                  <div
                    className={`absolute inset-0 px-9 py-10 flex flex-col justify-between transition-all duration-500 ${
                      hoverSeg === i ? 'opacity-0 -translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'
                    }`}
                  >
                    <span className="font-mono text-[10px] text-[#F4B41A] tracking-[0.22em]">
                      0{i + 1}
                    </span>
                    <div>
                      <h3 className="font-serif text-white text-xl font-semibold mb-3 leading-snug">
                        {seg.title}
                      </h3>
                      <p className="font-sans text-[#F4B41A] text-[10.5px] uppercase tracking-[0.18em]">
                        {seg.target}
                      </p>
                    </div>
                  </div>

                  {/* Hover face — slides up */}
                  <div
                    className={`absolute inset-0 bg-[#060B1A] px-9 py-10 flex flex-col transition-all duration-500 ${
                      hoverSeg === i
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-10 pointer-events-none'
                    }`}
                  >
                    <h3 className="font-serif text-[#F4B41A] text-base font-semibold mb-7 leading-snug">
                      {seg.title}
                    </h3>
                    <ul className="space-y-3.5 flex-1">
                      {seg.features.map((f, fi) => (
                        <li
                          key={fi}
                          className="flex items-start gap-3 font-sans text-[13px] text-[#8A99AD] font-light leading-snug"
                        >
                          <span className="w-[3px] h-[3px] rounded-full bg-[#F4B41A] mt-[7px] flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <p className="font-sans text-white/25 text-[10px] uppercase tracking-[0.2em] mt-6">
                      {seg.target}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            §6  METRIC TIMELINE
        ══════════════════════════════════════════ */}
        <section className="bg-[#0A1128] px-6 md:px-14 xl:px-24 py-24 border-t border-white/[0.05] overflow-hidden">
          <div className="max-w-[1400px] mx-auto">
            <div className="mb-16">
              <span className="block font-sans text-[#F4B41A] text-[10.5px] uppercase tracking-[0.3em] mb-3">
                Built For Global Maxima
              </span>
              <h2
                className="font-serif text-white font-semibold"
                style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)' }}
              >
                Impact, by the numbers.
              </h2>
            </div>

            <div className="border border-white/[0.07] rounded-sm overflow-hidden">
              {/* Mobile: tab row across top */}
              <div className="flex md:hidden border-b border-white/[0.07]">
                {Object.entries(METRIC_TABS).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => setMetricTab(key)}
                    className={`flex-1 py-3.5 font-sans text-[12px] tracking-wide transition-all duration-300 ${
                      metricTab === key
                        ? 'bg-[#060B1A] text-white border-b-2 border-[#F4B41A]'
                        : 'text-white/35 hover:text-white/60 bg-[#0A1128]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col md:flex-row">
                {/* Desktop: tab column on left */}
                <div className="hidden md:flex flex-col border-r border-white/[0.07] min-w-[170px]">
                  {Object.entries(METRIC_TABS).map(([key, t]) => (
                    <button
                      key={key}
                      onClick={() => setMetricTab(key)}
                      className={`relative px-7 py-8 text-left font-sans text-[13px] tracking-wide transition-all duration-300 border-b border-white/[0.07] last:border-b-0 ${
                        metricTab === key
                          ? 'bg-[#060B1A] text-white'
                          : 'text-white/35 hover:text-white/65 hover:bg-white/[0.015] bg-[#0A1128]'
                      }`}
                    >
                      {/* Active indicator line */}
                      {metricTab === key && (
                        <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#F4B41A]" />
                      )}
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Counter display */}
                <div className="flex-1 bg-[#060B1A] px-8 md:px-16 py-14 md:py-16 flex flex-col-reverse md:flex-row items-start md:items-center justify-between gap-10">
                  {/* Context text */}
                  <div className="max-w-xs md:max-w-sm">
                    <div className="font-sans text-[10.5px] text-[#F4B41A] uppercase tracking-[0.22em] mb-4">
                      {tab.counterLabel}
                    </div>
                    <p className="font-sans font-light text-[15px] text-white/50 leading-relaxed">
                      {tab.context}
                    </p>
                  </div>

                  {/* Giant counter */}
                  <div className="text-right flex-shrink-0">
                    <div
                      className="font-serif font-bold text-[#F4B41A] leading-none tabular-nums"
                      style={{ fontSize: 'clamp(4.5rem, 13vw, 9.5rem)' }}
                    >
                      {tab.display(metricCount)}
                    </div>
                    <div className="font-sans text-white/22 text-[10.5px] uppercase tracking-[0.2em] mt-3">
                      {tab.counterLabel}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            §7  CASE STUDIES
        ══════════════════════════════════════════ */}
        <section
          id="results"
          className="scroll-mt-[68px] bg-[#060B1A] px-6 md:px-14 xl:px-24 py-24 border-t border-white/[0.05]"
        >
          <div className="max-w-[1400px] mx-auto">
            <div className="mb-16">
              <span className="block font-sans text-[#F4B41A] text-[10.5px] uppercase tracking-[0.3em] mb-3">
                Case Studies
              </span>
              <h2
                className="font-serif text-white font-semibold"
                style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)' }}
              >
                Real Brands. Real Results.
              </h2>
            </div>

            <div className="space-y-5">
              {CASE_STUDIES.map((cs, i) => (
                <article
                  key={i}
                  className="border border-white/[0.07] rounded-sm bg-[#0A1128]/50 px-8 md:px-12 py-10 hover:border-white/[0.15] hover:bg-[#0A1128] transition-all duration-400"
                >
                  {/* Card header */}
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 pb-8 mb-8 border-b border-white/[0.06]">
                    <div>
                      <span className="font-sans text-[10px] text-[#F4B41A] uppercase tracking-[0.22em] border border-[#F4B41A]/28 px-3 py-1 rounded-sm bg-[#F4B41A]/[0.04]">
                        {cs.tag}
                      </span>
                      <h3
                        className="font-serif text-white font-semibold mt-3"
                        style={{ fontSize: 'clamp(1.3rem, 2.2vw, 1.85rem)' }}
                      >
                        {cs.brand}
                      </h3>
                    </div>
                    <span
                      className="font-serif font-bold text-white/[0.04] leading-none hidden md:block flex-shrink-0"
                      style={{ fontSize: 'clamp(3rem, 6vw, 5rem)' }}
                    >
                      {cs.num}
                    </span>
                  </div>

                  {/* 3-col data grid */}
                  <div className="grid sm:grid-cols-3 gap-8 font-sans text-[13px] leading-relaxed">
                    <div>
                      <div className="text-[9.5px] uppercase tracking-[0.22em] text-white/28 font-sans mb-4">
                        The Situation
                      </div>
                      <p className="font-light text-[#8A99AD] leading-[1.82]">{cs.situation}</p>
                    </div>

                    <div>
                      <div className="text-[9.5px] uppercase tracking-[0.22em] text-white/28 font-sans mb-4">
                        What We Did
                      </div>
                      <ul className="space-y-2.5">
                        {cs.approach.map((a, ai) => (
                          <li key={ai} className="flex items-start gap-2.5 text-white/75 font-light">
                            <span className="text-[#F4B41A] text-xs mt-0.5 flex-shrink-0">✓</span>
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="text-[9.5px] uppercase tracking-[0.22em] text-white/28 font-sans mb-4">
                        The Results
                      </div>
                      <ul className="space-y-2.5">
                        {cs.results.map((r, ri) => (
                          <li key={ri} className="flex items-start gap-2 text-[#F4B41A] font-medium">
                            <span className="flex-shrink-0">🔸</span>
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            §8  LEADERSHIP TEAM
        ══════════════════════════════════════════ */}
        <section
          id="team"
          className="scroll-mt-[68px] bg-[#0A1128] px-6 md:px-14 xl:px-24 py-24 border-t border-white/[0.05]"
        >
          <div className="max-w-[1400px] mx-auto">
            <div className="mb-16">
              <span className="block font-sans text-[#F4B41A] text-[10.5px] uppercase tracking-[0.3em] mb-3">
                Leadership
              </span>
              <h2
                className="font-serif text-white font-semibold"
                style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)' }}
              >
                World-Class Thinking for{' '}
                <span className="italic font-light text-white/38">Ground-Level Problems.</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-7">
              {TEAM.map((member, i) => (
                <div
                  key={i}
                  className="group border border-white/[0.07] rounded-sm bg-[#060B1A] p-9 md:p-11 hover:border-[#F4B41A]/25 hover:shadow-[0_0_80px_rgba(244,180,26,0.04)] transition-all duration-500 cursor-default"
                >
                  {/* Card header: avatar + identity */}
                  <div className="flex items-start gap-6 mb-8">
                    {/* Magnetic avatar */}
                    <div className="w-14 h-14 rounded-full bg-[#F4B41A] flex items-center justify-center font-serif text-xl font-bold text-[#0A1128] flex-shrink-0 group-hover:scale-110 group-hover:shadow-[0_8px_28px_rgba(244,180,26,0.38)] transition-all duration-400">
                      {member.initials}
                    </div>

                    <div>
                      <h3 className="font-serif text-white text-[1.3rem] font-semibold leading-tight mb-1">
                        {member.name}
                      </h3>
                      <p className="font-sans text-[#F4B41A] text-[10.5px] uppercase tracking-[0.18em]">
                        {member.role}
                      </p>
                      <p className="font-mono text-white/30 text-[11px] mt-1.5">
                        {member.credentials}
                      </p>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="font-sans font-light text-[14px] text-[#8A99AD] leading-[1.9]">
                    {member.bio}
                  </p>

                  {/* Award badges */}
                  {member.awards && (
                    <div className="mt-7 flex flex-wrap gap-2">
                      {member.awards.map((award, ai) => (
                        <span
                          key={ai}
                          className="font-sans text-[10px] border border-[#F4B41A]/22 text-[#F4B41A]/65 px-3 py-1.5 rounded-sm tracking-wide hover:border-[#F4B41A]/50 hover:text-[#F4B41A] transition-all duration-200 cursor-default"
                        >
                          ★ {award}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            §9  SIGN-OFF DIVIDER + FOOTER
        ══════════════════════════════════════════ */}
        <section className="bg-[#060B1A] border-t border-white/[0.05]">

          {/* Sign-off statement */}
          <div className="px-6 md:px-14 xl:px-24 py-20 md:py-28 border-b border-white/[0.05] overflow-hidden">
            <div className="max-w-[1400px] mx-auto">
              <p
                className="font-serif italic font-light text-white/[0.07] select-none leading-none"
                style={{ fontSize: 'clamp(2.6rem, 7.5vw, 7rem)' }}
              >
                "Never build without direction."
              </p>
            </div>
          </div>

          {/* Footer */}
          <footer
            id="contact"
            className="px-6 md:px-14 xl:px-24 pt-16 pb-12"
          >
            <div className="max-w-[1400px] mx-auto">
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-12 mb-16">

                {/* Brand */}
                <div className="md:col-span-2">
                  <div className="font-serif text-[15px] font-semibold text-white tracking-[0.13em] mb-[3px]">
                    SUNWARD GROWTH
                  </div>
                  <div className="font-sans text-[#F4B41A] text-[8.5px] uppercase tracking-[0.3em] mb-6">
                    Advisory
                  </div>
                  <p className="font-sans font-light text-[13px] text-white/30 leading-relaxed max-w-[280px]">
                    Hands-on growth consulting for founders who are serious about scale.
                    Strategy · Scale · Growth.
                  </p>
                </div>

                {/* General Inquiries */}
                <div>
                  <div className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#F4B41A] mb-5">
                    General Inquiries
                  </div>
                  <div className="space-y-1 font-sans font-light text-[13px] text-white/45">
                    <div>
                      <a
                        href="mailto:info@sunwardgrowth.com"
                        className="hover:text-white transition-colors duration-200 break-all"
                      >
                        info@sunwardgrowth.com
                      </a>
                    </div>
                    <div className="text-[10.5px] text-white/25 uppercase tracking-[0.12em] pt-3">
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
                  </div>
                </div>

                {/* Offices */}
                <div>
                  <div className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#F4B41A] mb-5">
                    Offices
                  </div>
                  <div className="font-sans font-light text-[13px] text-white/45 space-y-1">
                    <div className="text-white/70">India</div>
                    <div className="text-[12px] text-white/30 leading-relaxed">
                      Bandra, Mumbai<br />400050
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="pt-8 border-t border-white/[0.05] flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <span className="font-sans text-white/18 text-[12px]">
                  © {new Date().getFullYear()} Sunward Growth Advisory. All Rights Reserved.
                </span>
                <span className="font-sans text-white/18 text-[11px] uppercase tracking-[0.18em]">
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
