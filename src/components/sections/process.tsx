"use client";

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

type AniCardProps = {
  children: React.ReactNode;
  className: string;
  delay: number;
};

const AniCard = ({ children, className, delay }: AniCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}s` }}
      className={`transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default function ProcessSection() {
  return (
    <section id="process" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="relative mx-auto max-w-[1040px]">
          <AniCard delay={0} className="relative z-[1] mx-auto w-[90%] max-w-[960px] group">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/5289a710-af5c-41be-91c0-17bd70aee84a/generated_images/comprehensive-micro-work-dashboard-inter-c8cadc9c-20251030164543.jpg"
              alt="TaskInn comprehensive dashboard with earnings and tasks"
              width={960}
              height={640}
              className="h-auto w-full rounded-[1.5rem] shadow-[0_8px_32px_rgba(0,0,0,0.08)] group-hover:shadow-[0_12px_48px_rgba(0,0,0,0.12)] transition-all duration-500 group-hover:scale-[1.02]"
            />
            <div
              className="absolute bottom-0 left-0 right-0 h-2/5 rounded-b-[1.5rem]"
              style={{ background: 'linear-gradient(to top, hsl(var(--background)) 15%, transparent)' }}
            />
          </AniCard>
          
          <div className="absolute inset-0 z-[2] hidden md:block">
            <AniCard delay={0.15} className="absolute top-0 left-0 w-[320px] group">
              <div className="overflow-hidden rounded-[1.5rem] bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-500 hover:-translate-y-2 hover:scale-105">
                <div className="relative isolate">
                  <div className="relative z-10">
                    <div className="large-paragraph text-muted-foreground font-semibold">01</div>
                    <div className="mt-2 space-y-1">
                      <h2 className="display-h5">Create Your Account</h2>
                      <p className="paragraph text-muted-foreground">Sign up in minutes. Verify your identity and set up your payment preferences to start earning.</p>
                    </div>
                  </div>
                  <div
                    className="absolute inset-0 z-0 bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity duration-500"
                    style={{ backgroundImage: `url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/images/68a4af78b97a579a98e7e732_Step_20Card-1-23.png')` }}
                  />
                </div>
              </div>
            </AniCard>

            <AniCard delay={0.3} className="absolute top-[15%] right-0 w-[320px] group">
              <div className="overflow-hidden rounded-[1.5rem] bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-500 hover:-translate-y-2 hover:scale-105">
                <div className="relative isolate">
                  <div className="relative z-10">
                    <div className="large-paragraph text-muted-foreground font-semibold">02</div>
                    <div className="mt-2 space-y-1">
                      <h2 className="display-h5">Browse & Complete Tasks</h2>
                      <p className="paragraph text-muted-foreground">Choose from hundreds of micro-tasks. Work at your own pace and earn money for each completed task.</p>
                    </div>
                  </div>
                  <div
                    className="absolute inset-0 z-0 bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity duration-500"
                    style={{ backgroundImage: `url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/images/68a4af7b655f604c2a0e92ee_Step_20Card-2-24.png')` }}
                  />
                </div>
              </div>
            </AniCard>

            <AniCard delay={0.45} className="absolute bottom-0 left-[20%] w-[320px] group">
              <div className="overflow-hidden rounded-[1.5rem] bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-500 hover:-translate-y-2 hover:scale-105">
                <div className="relative isolate">
                  <div className="relative z-10">
                    <div className="large-paragraph text-muted-foreground font-semibold">03</div>
                    <div className="mt-2 space-y-1">
                      <h2 className="display-h5">Get Paid Instantly</h2>
                      <p className="paragraph text-muted-foreground">Track your earnings in real-time. Withdraw your money instantly to your preferred payment method.</p>
                    </div>
                  </div>
                  <div
                    className="absolute inset-0 z-0 bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity duration-500"
                    style={{ backgroundImage: `url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/images/68a4af7baceacb3162500e92_Step_20Card-3-25.png')` }}
                  />
                </div>
              </div>
            </AniCard>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden mt-12 space-y-6">
            <AniCard delay={0.15} className="group">
              <div className="overflow-hidden rounded-[1.5rem] bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
                <div className="relative isolate">
                  <div className="relative z-10">
                    <div className="large-paragraph text-muted-foreground font-semibold">01</div>
                    <div className="mt-2 space-y-1">
                      <h2 className="display-h5">Create Your Account</h2>
                      <p className="paragraph text-muted-foreground">Sign up in minutes. Verify your identity and set up your payment preferences to start earning.</p>
                    </div>
                  </div>
                  <div
                    className="absolute inset-0 z-0 bg-cover bg-center opacity-40"
                    style={{ backgroundImage: `url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/images/68a4af78b97a579a98e7e732_Step_20Card-1-23.png')` }}
                  />
                </div>
              </div>
            </AniCard>
            
            <AniCard delay={0.3} className="group">
              <div className="overflow-hidden rounded-[1.5rem] bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
                <div className="relative isolate">
                  <div className="relative z-10">
                    <div className="large-paragraph text-muted-foreground font-semibold">02</div>
                    <div className="mt-2 space-y-1">
                      <h2 className="display-h5">Browse & Complete Tasks</h2>
                      <p className="paragraph text-muted-foreground">Choose from hundreds of micro-tasks. Work at your own pace and earn money for each completed task.</p>
                    </div>
                  </div>
                  <div
                    className="absolute inset-0 z-0 bg-cover bg-center opacity-40"
                    style={{ backgroundImage: `url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/images/68a4af7b655f604c2a0e92ee_Step_20Card-2-24.png')` }}
                  />
                </div>
              </div>
            </AniCard>
            
            <AniCard delay={0.45} className="group">
              <div className="overflow-hidden rounded-[1.5rem] bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
                <div className="relative isolate">
                  <div className="relative z-10">
                    <div className="large-paragraph text-muted-foreground font-semibold">03</div>
                    <div className="mt-2 space-y-1">
                      <h2 className="display-h5">Get Paid Instantly</h2>
                      <p className="paragraph text-muted-foreground">Track your earnings in real-time. Withdraw your money instantly to your preferred payment method.</p>
                    </div>
                  </div>
                  <div
                    className="absolute inset-0 z-0 bg-cover bg-center opacity-40"
                    style={{ backgroundImage: `url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/images/68a4af7baceacb3162500e92_Step_20Card-3-25.png')` }}
                  />
                </div>
              </div>
            </AniCard>
          </div>
        </div>
      </div>
    </section>
  );
}