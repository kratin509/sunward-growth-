import { useState, useEffect } from 'react';

const NAV_LINKS = [
  { label: 'About',    href: '#services' },
  { label: 'Services', href: '#services' },
  { label: 'Sectors',  href: '#sectors'  },
  { label: 'Results',  href: '#results'  },
  { label: 'Team',     href: '#team'     },
  { label: 'Contact',  href: '#contact'  },
];

export default function Header() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route-fragment navigation
  const handleMobileLink = () => setMenuOpen(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0A1128]/95 backdrop-blur-md border-b border-white/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-5xl mx-auto px-6 md:px-24 py-5 flex items-center justify-between gap-6">

        {/* ── Logo ── */}
        <a href="#" className="flex flex-col leading-none flex-shrink-0 group">
          <span className="font-serif text-[1.15rem] font-semibold text-white tracking-tight group-hover:text-[#F4B41A] transition-colors duration-200">
            SUNWARD GROWTH
          </span>
          <span className="text-[9px] tracking-[0.22em] uppercase text-[#F4B41A] font-sans mt-0.5">
            Advisory
          </span>
        </a>

        {/* ── Desktop nav ── */}
        <nav className="hidden md:flex items-center gap-7 flex-1 justify-center" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[13px] text-[#8A99AD] hover:text-white transition-colors duration-200 tracking-wide"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* ── Desktop CTA ── */}
        <a
          href="mailto:info@sunwardgrowth.com"
          className="hidden md:inline-flex items-center gap-2 border border-[#F4B41A]/50 text-[#F4B41A] text-[13px] font-medium px-5 py-2.5 rounded tracking-wide hover:bg-[#F4B41A] hover:text-[#0A1128] transition-all duration-200 flex-shrink-0"
        >
          Book a Discovery Call
        </a>

        {/* ── Hamburger ── */}
        <button
          className="md:hidden p-2 flex flex-col gap-[5px] flex-shrink-0"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span
            className={`block w-6 h-[1.5px] bg-white origin-center transition-all duration-300 ${
              menuOpen ? 'rotate-45 translate-y-[6.5px]' : ''
            }`}
          />
          <span
            className={`block w-6 h-[1.5px] bg-white transition-all duration-300 ${
              menuOpen ? 'opacity-0 scale-x-0' : ''
            }`}
          />
          <span
            className={`block w-6 h-[1.5px] bg-white origin-center transition-all duration-300 ${
              menuOpen ? '-rotate-45 -translate-y-[6.5px]' : ''
            }`}
          />
        </button>
      </div>

      {/* ── Mobile menu (animated height) ── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 bg-[#0A1128] ${
          menuOpen ? 'max-h-[28rem] border-t border-white/10' : 'max-h-0'
        }`}
      >
        <div className="px-6 py-8 flex flex-col gap-5">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={handleMobileLink}
              className="text-base text-[#8A99AD] hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="mailto:info@sunwardgrowth.com"
            onClick={handleMobileLink}
            className="mt-3 inline-flex justify-center items-center border border-[#F4B41A]/60 text-[#F4B41A] text-sm font-medium px-5 py-3 rounded tracking-wide hover:bg-[#F4B41A] hover:text-[#0A1128] transition-all"
          >
            Book a Discovery Call
          </a>
        </div>
      </div>
    </header>
  );
}
