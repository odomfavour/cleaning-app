import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import CTAFooterSection from "@/components/CtaFooterSection";
import Header from "@/components/Header";
import HeroSlider from "@/components/HeroSlider";
import HowItWorksSection from "@/components/HowItWorksSection";
import ProjectsSection from "@/components/ProjectsSection";
import ServiceSection from "@/components/ServiceSection";
import TeamSection from "@/components/TeamSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import EnvironmentsSection from "@/components/landing/EnvironmentsSection";
import FaqSection from "@/components/landing/FaqSection";
import TrustSection from "@/components/landing/TrustSection";
import WhyChooseUsSection from "@/components/landing/WhyChooseUsSection";

// VideoStatsSection is intentionally not rendered: its placeholder statistics
// (e.g. "999k+ Happy Clients") aren't credible. Re-add once you have real numbers.
export default function Home() {
  return (
    <div>
      <Header />
      <HeroSlider />
      <TrustSection />
      <AboutSection />
      <ServiceSection />
      <HowItWorksSection />
      <WhyChooseUsSection />
      <EnvironmentsSection />
      <ProjectsSection />
      <TeamSection />
      <TestimonialsSection />
      <FaqSection />
      <ContactSection />
      <CTAFooterSection />
    </div>
  );
}
