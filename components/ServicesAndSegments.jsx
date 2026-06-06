import React, { useState } from 'react';

export default function ServicesAndSegments() {
  const [activePillar, setActivePillar] = useState(0);

  const pillars = [
    {
      num: '01',
      title: 'Diagnose Growth Blockers',
      desc: 'Surface the real constraints killing your growth — before throwing more resources at the wrong problem.'
    },
    {
      num: '02',
      title: 'Build Simple Growth Plans',
      desc: 'Clear, actionable roadmaps your team can execute on Monday. No 80-page decks, just what matters.'
    },
    {
      num: '03',
      title: 'Improve Retail & Distribution',
      desc: 'Optimize how your product reaches shelves and customers at every touchpoint.'
    },
    {
      num: '04',
      title: 'GTM Execution & Scale',
      desc: 'Channel strategy, sales motion design, revenue strategy, and launch playbooks that drive real revenue.'
    }
  ];

  const segments = [
    {
      title: 'Consumer Brands & MSMEs',
      target: 'Ambitious brands ready to scale.',
      features: ['Sales system design', 'Retail & distribution optimization', 'Brand story refinement', 'Founder coaching', 'Revenue strategy']
    },
    {
      title: 'Early-Stage Startups',
      target: 'Pre-seed to Series A founders.',
      features: ['Fundraising support & pitch coaching', 'Go-to-market execution', 'Investor readiness', 'Strategic partnership structuring', 'Scaling systems & ops design']
    },
    {
      title: 'University Innovation Hubs',
      target: "Building India's innovation ecosystem.",
      features: ['Incubator setup & policy framework', 'Government grant strategy (DST, BIRAC, AIM)', 'Demo Day design & execution', 'Startup funding pipeline', 'Mentor & investor network setup']
    }
  ];

  return (
    <div id="services" className="bg-[#060B1A] text-[#F9F9FB] py-24 px-6 md:px-24">
      <div className="max-w-5xl mx-auto">

        {/* Core Manifesto Text Block */}
        <div className="grid md:grid-cols-5 gap-8 md:gap-16 items-start border-b border-white/10 pb-20 mb-24">
          <div className="md:col-span-2 sticky top-24">
            <h2 className="font-serif text-3xl md:text-4xl italic text-[#F4B41A] font-light leading-relaxed">
              "Great products deserve great business systems."
            </h2>
          </div>
          <div className="md:col-span-3 text-[#8A99AD] space-y-6 font-light leading-relaxed text-base">
            <p className="text-white font-normal text-lg">We don't just advise. We build alongside you.</p>
            <p>Sunward Growth Advisory is a hands-on growth consulting firm partnering with consumer brands, startups, and institutions at every stage — from finding product-market fit to scaling nationally.</p>
            <p>We work shoulder-to-shoulder with founders and leaders to build the infrastructure that turns ambition into measurable, compounding growth.</p>
          </div>
        </div>

        {/* 4 Service Pillars */}
        <div className="mb-32">
          <div className="mb-12">
            <span className="text-[#F4B41A] text-xs uppercase tracking-[3px] block mb-2">Capabilities</span>
            <h3 className="font-serif text-3xl md:text-4xl">Our Growth Pillars</h3>
          </div>

          <div className="border-t border-white/10">
            {pillars.map((pillar, index) => (
              <div
                key={index}
                className="group border-b border-white/10 py-8 flex flex-col md:flex-row items-start justify-between cursor-pointer transition-all duration-300 hover:bg-white/[0.01] hover:px-4"
                onMouseEnter={() => setActivePillar(index)}
              >
                <div className="flex items-start md:w-1/2 gap-6">
                  <span className="font-mono text-sm text-[#F4B41A] pt-1.5">{pillar.num}</span>
                  <h4 className="font-serif text-xl md:text-2xl group-hover:text-[#F4B41A] transition-colors duration-300">{pillar.title}</h4>
                </div>
                <p className="text-[#8A99AD] font-light md:w-1/2 mt-3 md:mt-0 leading-relaxed group-hover:text-white transition-colors duration-300">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Who We Serve Segment Cards */}
        <div id="sectors">
          <div className="mb-12">
            <span className="text-[#F4B41A] text-xs uppercase tracking-[3px] block mb-2">Target Segments</span>
            <h3 className="font-serif text-3xl md:text-4xl">Three Distinct Segments. One Growth Philosophy.</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {segments.map((seg, idx) => (
              <div key={idx} className="bg-white/[0.02] border border-white/10 p-8 rounded transition-all duration-300 hover:border-[#F4B41A]/40 hover:bg-white/[0.03] flex flex-col justify-between group">
                <div>
                  <h4 className="font-serif text-2xl mb-2 text-white group-hover:text-[#F4B41A] transition-colors duration-300">{seg.title}</h4>
                  <p className="text-xs font-medium text-[#F4B41A] tracking-wider uppercase mb-6">{seg.target}</p>
                  <ul className="space-y-3 border-t border-white/5 pt-6">
                    {seg.features.map((feat, fIdx) => (
                      <li key={fIdx} className="text-sm font-light text-[#8A99AD] flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-[#F4B41A] flex-shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
