"use client";

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const successStoriesData = [
  {
    title: 'Freelancer to Full-Time',
    name: 'Sarah M.',
    description: 'From struggling freelancer to earning $3,500/month consistently through TaskInn. Sarah shares how micro-tasks transformed her financial situation.',
    bgImage: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/5289a710-af5c-41be-91c0-17bd70aee84a/generated_images/abstract-gradient-background-with-soft-f-77b0881d-20251030164606.jpg',
    logo: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/images/68a742ab7bef148ae7f7d458_Fakebrand_201-18.png',
    year: '2025'
  },
  {
    title: 'Student Side Hustle',
    name: 'Mike T.',
    description: 'College student Mike turned TaskInn into his primary income source, earning $2,200/month while maintaining full-time studies and flexible hours.',
    bgImage: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/5289a710-af5c-41be-91c0-17bd70aee84a/generated_images/soft-gradient-abstract-background-flowin-8d7bb378-20251030164605.jpg',
    logo: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/images/68a7459a4ac7c1810db6bdf0_Fakebrand_205-16.png',
    year: '2025'
  },
  {
    title: 'Remote Work Pioneer',
    name: 'Lisa K.',
    description: 'Digital nomad Lisa built a sustainable income stream completing tasks from 15 different countries. Now earning $4,100/month remotely.',
    bgImage: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/5289a710-af5c-41be-91c0-17bd70aee84a/generated_images/elegant-abstract-gradient-flowing-from-p-eac795cc-20251030164606.jpg',
    logo: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/images/68a7433c1a7c6b809ff8f256_Fakebrand_202-20.png',
    year: '2025'
  },
  {
    title: 'Part-Time to Prosperity',
    name: 'James R.',
    description: 'Stay-at-home parent James found financial freedom with TaskInn, earning $2,800/month working just 4 hours a day around family commitments.',
    bgImage: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/5289a710-af5c-41be-91c0-17bd70aee84a/generated_images/modern-abstract-gradient-background-with-6641605b-20251030164606.jpg',
    logo: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/images/68a7460135293b95f9dc7850_Fakebrand_206-14.png',
    year: '2024'
  }
];

type StoryCardProps = {
  story: typeof successStoriesData[0];
  index: number;
};

const StoryCard = ({ story, index }: StoryCardProps) => {
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
      style={{ transitionDelay: `${index * 0.1}s` }}
      className={`transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8'
      }`}
    >
      <Link href="#" className="group block relative aspect-[584/520] overflow-hidden rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
        <Image
          src={story.bgImage}
          alt={`${story.title} success story background`}
          width={584}
          height={520}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-500 group-hover:from-black/70"></div>
        <div className="absolute inset-0 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity duration-500">
          <Image 
            src={story.logo} 
            alt={`${story.title} logo`} 
            width={150} 
            height={40} 
            className="w-auto max-h-12 filter brightness-0 invert transform transition-transform duration-500 group-hover:scale-110" 
          />
        </div>
        <div className="absolute bottom-4 right-4">
          <div className="bg-black/30 text-white/95 text-[12px] font-semibold px-3 py-1.5 rounded-lg backdrop-blur-sm group-hover:bg-black/40 transition-colors duration-300">
            {story.year}
          </div>
        </div>
      </Link>
      <div className="mt-6">
        <h3 className="display-h5 text-primary group-hover:text-primary/80 transition-colors">{story.title}</h3>
        <p className="text-sm text-teal-600 font-medium mt-1">{story.name}</p>
        <p className="paragraph text-muted-foreground mt-2">{story.description}</p>
      </div>
    </div>
  );
};

const SuccessStories = () => {
  return (
    <section className="bg-background py-24">
      <div className="container mx-auto px-6 md:px-8 flex flex-col items-center">
        <div className="text-center max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h2 className="display-h2 text-primary">Worker success stories</h2>
          <p className="large-paragraph text-muted-foreground mt-4">
            Real TaskInn workers building sustainable income through micro-tasks. Discover how they transformed their financial futures.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12 w-full max-w-6xl">
          {successStoriesData.map((story, index) => (
            <StoryCard key={story.title} story={story} index={index} />
          ))}
        </div>

        <div className="mt-16 text-center animate-in fade-in duration-700 delay-500">
          <Link
            href="#"
            className="inline-flex items-center px-7 py-3.5 border-2 border-primary rounded-full text-primary font-medium text-base button-text transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:-translate-y-0.5 hover:shadow-lg hover:scale-105"
          >
            Read more stories
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;