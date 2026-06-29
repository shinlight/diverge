// src/pages/LandingPage.jsx
import SectionWrap from "../components/landing/SectionWrap";
import LandingNav from "../components/landing/LandingNav";
import Hero from "../components/landing/Hero";
import TrustStrip from "../components/landing/TrustStrip";
import ProblemSection from "../components/landing/ProblemSection";
import HowItWorks from "../components/landing/HowItWorks";
import WidgetShowcase from "../components/landing/WidgetShowcase";
import BuiltForYourBrain from "../components/landing/BuiltForYourBrain";
import Manifesto from "../components/landing/Manifesto";
import Personalization from "../components/landing/Personalization";

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
      <ProblemSection />
      <HowItWorks />
      <WidgetShowcase />
      <BuiltForYourBrain />
      <Manifesto />
      <Personalization />
      <Stub id="pricing" label="pricing" />
      <Stub label="faq" />
      <Stub id="cta" label="final cta" bg="accent" />
      <Stub label="footer" />
    </div>
  );
}
