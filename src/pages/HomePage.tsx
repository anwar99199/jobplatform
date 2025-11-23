import { Hero } from "../components/Hero";
import { JobsSection } from "../components/JobsSection";
import { PremiumFloatingPromo } from "../components/PremiumFloatingPromo";

export function HomePage() {
  return (
    <>
      <Hero />
      <JobsSection />
      <PremiumFloatingPromo />
    </>
  );
}