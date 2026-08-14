import Hero from "@/components/marketing/Hero";
import EntityGrid from "@/components/marketing/EntityGrid";
import HowItWorks from "@/components/marketing/HowItWorks";
import Features from "@/components/marketing/Features";
import PricingTabs from "@/components/marketing/PricingTabs";
import FaqAccordion from "@/components/marketing/FaqAccordion";
import FeaturedGuides from "@/components/marketing/FeaturedGuides";
import CtaBand from "@/components/marketing/CtaBand";

export default function HomePage() {
  return (
    <>
      <Hero />
      <EntityGrid />
      <HowItWorks />
      <Features />
      <PricingTabs />
      <FaqAccordion />
      <FeaturedGuides />
      <CtaBand />
    </>
  );
}
