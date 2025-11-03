import Navigation from "@/components/sections/navigation";
import HeroSection from "@/components/sections/hero";
import ProcessSection from "@/components/sections/process";
import FeaturesSection from "@/components/sections/features";
import Integrations from "@/components/sections/integrations";
import PricingSection from "@/components/sections/pricing";
import SuccessStories from "@/components/sections/success-stories";
import Testimonials from "@/components/sections/testimonials";
import FaqSection from "@/components/sections/faq";
import CtaSection from "@/components/sections/cta";
import Footer from "@/components/sections/footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <HeroSection />
        <ProcessSection />
        <FeaturesSection />
        <Integrations />
        <PricingSection />
        <SuccessStories />
        <Testimonials />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}