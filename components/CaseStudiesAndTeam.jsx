import React from 'react';

export default function CaseStudiesAndTeam() {
  const caseStudies = [
    {
      num: '01',
      brand: 'Manam Chocolates',
      tag: 'PREMIUM F&B',
      situation: 'Great product and devoted customers, yet sales stayed inconsistent and revenue unpredictable. Running on craft, not a system.',
      approach: ['Clarified brand positioning', 'Built structured sales funnel', 'Improved retail storytelling'],
      results: ['Clear Growth Direction', 'Better Store Performance', 'Stronger Customer Connect']
    },
    {
      num: '02',
      brand: 'Mahati Wellness',
      tag: 'WELLNESS',
      situation: 'Chasing too many customer segments at once, without a clear go to market strategy. Hard to gain traction in any single channel.',
      approach: ['Defined target customers with precision', 'Built a complete GTM strategy', 'Refined sales messaging'],
      results: ['Clear Market Direction', 'Stronger Positioning', 'Smarter Acquisition']
    },
    {
      num: '03',
      brand: 'Varai Hospitality',
      tag: 'HOSPITALITY',
      situation: 'Premium properties and bold vision, but no strategic framework to consistently convert interest into high value bookings.',
      approach: ['Developed revenue strategy', 'Created experience led branding', 'Optimized sales channels'],
      results: ['Better Visibility', 'Higher Engagement', 'Stronger Revenue Flow']
    }
  ];

  return (
    <div id="results" className="bg-[#0A1128] text-[#F9F9FB] py-24 px-6 md:px-24 border-t border-white/5">
      <div className="max-w-5xl mx-auto">

        {/* Case Studies */}
        <div className="mb-32">
          <div className="mb-16">
            <span className="text-[#F4B41A] text-xs uppercase tracking-[3px] block mb-2">Case Studies</span>
            <h3 className="font-serif text-3xl md:text-4xl">Real Brands. Real Results.</h3>
          </div>

          <div className="space-y-12">
            {caseStudies.map((cs, idx) => (
              <div key={idx} className="bg-white/[0.01] border border-white/10 rounded-lg p-8 md:p-12 transition-all duration-300 hover:border-white/20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6 mb-8 gap-4">
                  <div>
                    <span className="text-xs text-[#F4B41A] font-semibold tracking-widest border border-[#F4B41A]/30 px-2.5 py-1 rounded bg-[#F4B41A]/5">{cs.tag}</span>
                    <h4 className="font-serif text-2xl md:text-3xl text-white mt-3">{cs.brand}</h4>
                  </div>
                  <span className="font-serif text-4xl text-white/10 font-bold hidden md:block">{cs.num}</span>
                </div>

                <div className="grid md:grid-cols-3 gap-8 text-sm leading-relaxed">
                  <div>
                    <h5 className="text-[10px] uppercase tracking-wider text-[#8A99AD] font-semibold mb-3">The Situation</h5>
                    <p className="text-[#8A99AD] font-light">{cs.situation}</p>
                  </div>
                  <div>
                    <h5 className="text-[10px] uppercase tracking-wider text-[#8A99AD] font-semibold mb-3">What We Did</h5>
                    <ul className="space-y-2 text-white/90 font-light">
                      {cs.approach.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">✓ <span className="pt-0.5">{item}</span></li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-[10px] uppercase tracking-wider text-[#8A99AD] font-semibold mb-3">The Results</h5>
                    <ul className="space-y-2 text-[#F4B41A] font-medium">
                      {cs.results.map((item, i) => (
                        <li key={i}>🔸 {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Profile Grids */}
        <div id="team" className="border-t border-white/10 pt-24">
          <div className="mb-16">
            <span className="text-[#F4B41A] text-xs uppercase tracking-[3px] block mb-2">Leadership</span>
            <h3 className="font-serif text-3xl md:text-4xl">World-Class Thinking for Ground-Level Problems</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Baljeet Profile */}
            <div className="border border-white/10 p-8 rounded bg-white/[0.01] hover:border-[#F4B41A]/30 transition-all duration-300">
              <div className="mb-6">
                <h4 className="font-serif text-2xl text-white mb-1">Baljeet Gujral</h4>
                <p className="text-xs text-[#F4B41A] uppercase tracking-wider font-medium">Founder &amp; Strategic Advisor</p>
                <p className="text-xs text-[#8A99AD] mt-2 font-mono">Harvard • Stanford • Oxford • IIM Calcutta</p>
              </div>
              <p className="text-sm font-light text-[#8A99AD] leading-relaxed">
                15+ years turning ambitious ideas into real businesses. Baljeet has built and scaled ventures across sales, strategy, and operations — partnering with brands at every stage, from early-stage startups searching for product-market fit to established companies scaling nationally. He is the founder of Enfield Riders and Bucket List Experiences, ventures that redefined travel and lifestyle experiences in India.
              </p>
            </div>

            {/* Dr. Suraj Profile */}
            <div className="border border-white/10 p-8 rounded bg-white/[0.01] hover:border-[#F4B41A]/30 transition-all duration-300">
              <div className="mb-6">
                <h4 className="font-serif text-2xl text-white mb-1">Dr. Suraj Kumar</h4>
                <p className="text-xs text-[#F4B41A] uppercase tracking-wider font-medium">Research-Led Strategist &amp; Mentor</p>
                <p className="text-xs text-[#8A99AD] mt-2 font-mono">PhD · Management | India's Top 100 Young Leaders</p>
              </div>
              <p className="text-sm font-light text-[#8A99AD] leading-relaxed">
                Combines academic rigour with entrepreneurial execution to build high-impact growth systems. Expertise spanning Entrepreneurship, Marketing, Org Behavior, and Innovation. Founder of The Dehradun Street with over 200+ organizations collaborated with, and recipient of the Engaging Young India Award.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer id="contact" className="mt-32 pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-[#8A99AD] gap-6">
          <div>© {new Date().getFullYear()} Sunward Growth Advisory. All Rights Reserved.</div>
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 font-mono text-white/80 text-center sm:text-left">
            <a href="mailto:info@sunwardgrowth.com" className="hover:text-[#F4B41A] transition-colors duration-200">
              info@sunwardgrowth.com
            </a>
            <a href="tel:+918822456789" className="hover:text-[#F4B41A] transition-colors duration-200">
              +91 88224 56789
            </a>
          </div>
        </footer>

      </div>
    </div>
  );
}
