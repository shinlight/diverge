// src/pages/LandingPage.jsx
import SectionWrap from "../components/landing/SectionWrap";
import LandingNav from "../components/landing/LandingNav";
import Hero from "../components/landing/Hero";
import TrustStrip from "../components/landing/TrustStrip";

// Temporary stubs — each becomes its own component in later tasks.
function Stub({ id, label, bg }) {
  return (
    <SectionWrap id={id} bg={bg}>
      <p className="lp-mono text-xs uppercase tracking-[0.2em]" style={{ opacity: 0.6 }}>
        [{label}]
      </p>
    </SectionWrap>
  );
}

export default function LandingPage() {
  return (
    <div className="landing">
      <LandingNav />
      <Hero />
      <TrustStrip />
      <Stub label="problem" bg="cream" />
      <Stub id="how" label="how it works" />
      <Stub id="product" label="widget showcase" />
      <Stub label="built for your brain" />
      <Stub id="manifesto" label="manifesto" bg="cream" />
      <Stub label="personalization" />
      <Stub id="pricing" label="pricing" />
      <Stub label="faq" />
      <Stub id="cta" label="final cta" bg="accent" />
      <Stub label="footer" />
    </div>
  );
}
