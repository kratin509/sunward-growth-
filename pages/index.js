import Head from 'next/head';
import Header from '../components/Header';
import Hero from '../components/Hero';
import ServicesAndSegments from '../components/ServicesAndSegments';
import CaseStudiesAndTeam from '../components/CaseStudiesAndTeam';

export default function Home() {
  return (
    <>
      <Head>
        <title>Sunward Growth Advisory | Your North Star for Business Transformation</title>
        <meta
          name="description"
          content="Hands-on growth consulting for MSMEs, Startups, and Universities. Strategy, Scale, and Growth — founded by Baljeet Gujral."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Sunward Growth Advisory | Your North Star for Business Transformation" />
        <meta
          property="og:description"
          content="Hands-on growth consulting for MSMEs, Startups, and Universities. 15+ years, 200+ organisations, 3 continents."
        />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Sticky global header — rendered above all sections */}
      <Header />

      <main>
        {/* ── 1. Hero ── */}
        <Hero />

        {/* ── 2. Services (manifesto + pillars) + Segments (who we serve) ── */}
        <ServicesAndSegments />

        {/* ── 3. Case Studies + Team + Footer ── */}
        <CaseStudiesAndTeam />
      </main>
    </>
  );
}
