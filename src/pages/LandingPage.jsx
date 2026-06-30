// src/pages/LandingPage.jsx
import LandingNav from "../components/landing/LandingNav";
import Hero from "../components/landing/Hero";
import TrustStrip from "../components/landing/TrustStrip";
import ProblemSection from "../components/landing/ProblemSection";
import HowItWorks from "../components/landing/HowItWorks";
import WidgetShowcase from "../components/landing/WidgetShowcase";
import BuiltForYourBrain from "../components/landing/BuiltForYourBrain";
import Manifesto from "../components/landing/Manifesto";
import Personalization from "../components/landing/Personalization";
import Pricing from "../components/landing/Pricing";
import Faq from "../components/landing/Faq";
import FinalCta from "../components/landing/FinalCta";
import LandingFooter from "../components/landing/LandingFooter";

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
      <Pricing />
      <Faq />
      <FinalCta />
      <LandingFooter />
    </div>
  );
}
