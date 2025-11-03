"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const logos = [
{ src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/images/68a46d745969fc10692d9fae_Fakebrand_205-4.png", alt: "Partner logo" },
{ src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/images/68a46d74e1b7d5538d9a030a_Fakebrand_206-5.png", alt: "Partner logo" },
{ src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/images/68a46d74beeb7f92e488d779_Fakebrand_202-6.png", alt: "Partner logo" },
{ src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/images/68a46d744ccac3dc2d99b007_Fakebrand_204-7.png", alt: "Partner logo" }];


const HeroSection = () => {
  return (
    <section className="relative bg-background overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(136deg,rgba(125,211,192,0)_24%,rgba(217,119,87,0.05)_48%,rgba(217,119,87,0)_65%)]"></div>

        <div className="absolute top-0 left-0 h-full w-[30%]">
          <div className="flex h-full w-full justify-between">
            {Array(6).fill(0).map((_, i) =>
            <div key={i} className="w-px h-full bg-border"></div>
            )}
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--background)),transparent_75%)]"></div>
        </div>
        
        <div className="absolute top-0 right-0 h-full w-[30%]">
          <div className="flex h-full w-full justify-between">
            {Array(6).fill(0).map((_, i) =>
            <div key={i} className="w-px h-full bg-border"></div>
            )}
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(to_left,hsl(var(--background)),transparent_75%)]"></div>
        </div>
      </div>
      
      <div className="container relative z-10 pt-32 pb-16 lg:pt-40 lg:pb-24">
        <div className="hero-wrap">
          <div className="grid lg:grid-cols-2 gap-x-12 gap-y-16 items-center">
            <div className="hero-text flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-100">
              <div className="hero-heading flex flex-col gap-6">
                <h1 className="display-h1 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                  Because your 9-to-5 wasn't soul-crushing enough
                </h1>
                <p className="large-paragraph text-muted-foreground max-w-lg animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                  Join thousands of workers earning pennies—err, we mean "competitive rates"—through simple online tasks. Work whenever you feel like it (we won't judge), get paid eventually, and unlock that sweet, sweet side-hustle lifestyle with TaskInn.
                </p>
              </div>
              <div className="hero-buttons flex items-center gap-4 flex-wrap animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400">
                <Link
                  href="/signup"
                  className="group primary-button inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground font-medium px-7 py-3.5 button-text transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:scale-105">

                  Get started
                  <span className="relative w-7 h-7 flex items-center justify-center rounded-full bg-white overflow-hidden">
                    <ArrowRight className="h-4 w-4 text-black absolute transition-transform duration-300 ease-in-out transform translate-x-0 group-hover:translate-x-full" />
                    <ArrowRight className="h-4 w-4 text-black absolute transition-transform duration-300 ease-in-out transform -translate-x-full group-hover:translate-x-0" />
                  </span>
                </Link>
                <Link
                  href="#pricing"
                  className="outline-button inline-flex items-center justify-center rounded-full border-2 border-primary bg-transparent text-primary font-medium px-7 py-3 button-text transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:scale-105 !whitespace-pre-line">
                  View 

                </Link>
              </div>
            </div>
            
            <div className="hero-ui relative min-h-[300px] md:min-h-[500px]">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/5289a710-af5c-41be-91c0-17bd70aee84a/generated_images/modern-task-management-dashboard-ui-mock-a16ef11d-20251030164542.jpg"
                alt="TaskInn earnings dashboard showing $2,450 weekly earnings"
                width={408}
                height={262}
                className="absolute top-0 right-0 w-[65%] max-w-[408px] rounded-3xl shadow-[0_12px_48px_rgba(0,0,0,0.15)] animate-in fade-in slide-in-from-right-16 duration-700 delay-300 hover:scale-105 hover:-translate-y-2 transition-all" />

              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/5289a710-af5c-41be-91c0-17bd70aee84a/generated_images/weekly-performance-analytics-dashboard-s-8f66548f-20251030164544.jpg"
                alt="Weekly analytics showing earnings growth"
                width={368}
                height={258}
                className="absolute bottom-0 left-0 w-[55%] max-w-[368px] rounded-3xl shadow-[0_12px_48px_rgba(0,0,0,0.15)] animate-in fade-in slide-in-from-left-16 duration-700 delay-500 hover:scale-105 hover:-translate-y-2 transition-all" />

              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/5289a710-af5c-41be-91c0-17bd70aee84a/generated_images/micro-work-platform-task-categories-card-9484f385-20251030164543.jpg"
                alt="Task categories showing available micro-tasks"
                width={280}
                height={200}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45%] max-w-[280px] rounded-3xl shadow-[0_12px_48px_rgba(0,0,0,0.2)] animate-in fade-in zoom-in-50 duration-700 delay-700 hover:scale-110 hover:rotate-2 transition-all" />

            </div>
          </div>
          
          <div className="relative mt-24 md:mt-32 overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-background to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-background to-transparent z-10"></div>
            
            <div className="flex animate-in fade-in duration-1000 delay-800">
              <div className="flex shrink-0 items-center animate-marquee space-x-16 pr-16 md:space-x-20 md:pr-20">
                {logos.map((logo, index) =>
                <Image key={`logo-a-${index}`} src={logo.src} alt={logo.alt} width={130} height={32} className="h-8 w-auto object-contain filter grayscale opacity-40 hover:opacity-70 hover:grayscale-0 transition-all" />
                )}
              </div>
              <div className="flex shrink-0 items-center animate-marquee space-x-16 pr-16 md:space-x-20 md:pr-20" aria-hidden="true">
                {logos.map((logo, index) =>
                <Image key={`logo-b-${index}`} src={logo.src} alt={logo.alt} width={130} height={32} className="h-8 w-auto object-contain filter grayscale opacity-40" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>);

};

export default HeroSection;