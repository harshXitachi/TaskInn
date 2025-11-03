'use client';

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const logosUp = [
  { src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/svgs/68a70127b855449b70c5ff14_Fake_20Logo_208-1.svg", alt: "Sample logo 8" },
  { src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/svgs/68a7012708a760adb36255e0_Fake_20Logo_202-2.svg", alt: "Sample logo 2" },
  { src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/svgs/68a701274df0addd226bdf2e_Fake_20Logo_205-3.svg", alt: "Sample logo 5" },
  { src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/svgs/68a70127c70239b918860830_Fake_20Logo_206-4.svg", alt: "Sample logo 6" },
];

const logosDown = [
  { src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/svgs/68a701274180c858df689f8b_Fake_20Logo_203-5.svg", alt: "Sample logo 3" },
  { src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/svgs/68a701274b9f599b7bca7507_Fake_20Logo_207-6.svg", alt: "Sample logo 7" },
  { src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/svgs/68a70127ff28015ac9fee3f8_Fake_20Logo_201-7.svg", alt: "Sample logo 1" },
  { src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/svgs/68a70127369f354d650b5176_Fake_20Logo_204-8.svg", alt: "Sample logo 4" },
];

const integrationSteps = [
  { number: "01", text: "Explore 50+ supported integrations" },
  { number: "02", text: "Securely link your account" },
  { number: "03", text: "Sync and streamline your workflow" },
];

const LogoCard = ({ src, alt }: { src: string; alt: string }) => (
  <div className="flex items-center justify-center h-28 p-6 bg-card rounded-3xl shadow-[0_4px_20px_0_rgba(0,0,0,0.08)]">
    <Image src={src} alt={alt} width={80} height={32} className="h-8 w-auto" />
  </div>
);

const MarqueeColumn = ({ logos, direction = 'up' }: { logos: { src: string; alt: string }[]; direction?: 'up' | 'down' }) => {
  const allLogos = [...logos, ...logos];
  return (
    <div className={cn(
      "flex flex-col gap-4",
      direction === 'up' ? 'animate-marquee-up' : 'animate-marquee-down'
    )}>
      {allLogos.map((logo, index) => (
        <LogoCard key={index} src={logo.src} alt={logo.alt} />
      ))}
    </div>
  );
};

export default function Integrations() {
  return (
    <section id="integration" className="py-24 bg-background">
      <div className="container max-w-6xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-16 lg:gap-24">
          <div className="lg:flex-1 flex flex-col gap-12">
            <div className="flex flex-col items-start gap-6">
              <h2 className="display-h2 lg:text-[56px] text-4xl">Multiple payment integrations</h2>
              <p className="large-paragraph text-muted-foreground">
              Seamlessly integrate with your favorite tools to streamline workflows and keep everything in sync.
              </p>
              <div>
                <Link href="#" className="group inline-flex items-center gap-3 pl-6 pr-2 py-2 bg-primary text-primary-foreground rounded-full button-text transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg">
                  Get started
                  <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white">
                    <ArrowRight className="h-5 w-5 text-primary transition-transform duration-300 ease-in-out group-hover:translate-x-8" />
                    <ArrowRight className="absolute h-5 w-5 text-primary transition-transform duration-300 ease-in-out -translate-x-8 group-hover:translate-x-0" />
                  </span>
                </Link>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-border">
              {[...Array(4)].map((_, i) => (
                <Plus key={i} size={20} strokeWidth={1.5} />
              ))}
            </div>

            <div className="flex flex-col gap-6">
              {integrationSteps.map((step) => (
                <div key={step.number} className="flex items-center gap-4">
                  <span className="flex items-center justify-center py-1 px-3 border border-border rounded-full text-sm font-medium text-primary">
                    {step.number}
                  </span>
                  <p className="large-paragraph text-primary">{step.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:flex-1 h-[560px] flex gap-4">
            <div className="relative flex-1 overflow-hidden">
              <div aria-hidden="true" className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-background to-transparent z-10" />
              <MarqueeColumn logos={logosUp} direction="up" />
              <div aria-hidden="true" className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent z-10" />
            </div>
            <div className="relative flex-1 overflow-hidden">
              <div aria-hidden="true" className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-background to-transparent z-10" />
              <MarqueeColumn logos={logosDown} direction="down" />
              <div aria-hidden="true" className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}