import React, { useState, useEffect } from 'react';

export default function Hero() {
  const [metrics, setMetrics] = useState({ experience: 0, continents: 0, orgs: 0 });

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const stepTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setMetrics({
        experience: Math.min(Math.floor((15 / steps) * step), 15),
        continents: Math.min(Math.floor((3 / steps) * step), 3),
        orgs: Math.min(Math.floor((200 / steps) * step), 200)
      });

      if (step >= steps) clearInterval(timer);
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center bg-[#0A1128] px-6 md:px-24 text-[#F9F9FB] overflow-hidden border-b border-white/10"
    >
      {/* Background Topographic/Grid Effect Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="relative z-10 max-w-5xl mx-auto w-full mt-20">
        <h1 className="font-serif text-5xl md:text-7xl font-normal tracking-tight leading-[1.1] mb-6 animate-fade-in">
          Your North Star for <br />
          <span className="italic font-light text-transparent bg-clip-text bg-gradient-to-r from-[#F4B41A] via-white to-[#F4B41A]">
            Business Transformation.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-[#8A99AD] font-light max-w-2xl mb-12 tracking-wide">
          Strategy <span className="text-[#F4B41A] mx-1">•</span> Scale <span className="text-[#F4B41A] mx-1">•</span> Growth
          <span className="block mt-2 text-white/80 font-normal">for MSMEs, Startups, and Universities.</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-24">
          <a
            href="#contact"
            className="inline-flex justify-center items-center bg-[#F4B41A] text-[#0A1128] px-8 py-4 rounded font-semibold text-sm tracking-wide transition-all duration-300 hover:bg-[#f5be38] hover:-translate-y-0.5 shadow-lg shadow-[#F4B41A]/10"
          >
            Book a Free Discovery Call
          </a>
          <a
            href="#services"
            className="inline-flex justify-center items-center border border-white/20 text-[#F9F9FB] px-8 py-4 rounded font-medium text-sm tracking-wide transition-all duration-300 hover:border-white hover:bg-white/5"
          >
            View Our Services
          </a>
        </div>
      </div>

      {/* Live Counting Metrics Banner */}
      <div className="relative z-10 max-w-5xl mx-auto w-full grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16 border-t border-white/10 pt-8 pb-12">
        <div>
          <div className="font-serif text-4xl md:text-5xl font-bold text-[#F4B41A]">{metrics.experience}+</div>
          <div className="text-[10px] uppercase tracking-[2px] text-[#8A99AD] mt-2">Years Experience</div>
        </div>
        <div>
          <div className="font-serif text-4xl md:text-5xl font-bold text-[#F4B41A]">{metrics.continents}+</div>
          <div className="text-[10px] uppercase tracking-[2px] text-[#8A99AD] mt-2">Continents</div>
        </div>
        <div className="col-span-2 md:col-span-1">
          <div className="font-serif text-4xl md:text-5xl font-bold text-[#F4B41A]">{metrics.orgs}+</div>
          <div className="text-[10px] uppercase tracking-[2px] text-[#8A99AD] mt-2">Organisations Supported</div>
        </div>
      </div>
    </section>
  );
}
