"use client";

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { BarChart3, SlidersHorizontal, Users, Zap } from 'lucide-react';

const tabsData = [
  {
    id: 'task-marketplace',
    label: 'Task marketplace',
    Icon: Users,
    content: {
      tag: 'Task Marketplace',
      title: 'Thousands of micro-tasks at your fingertips',
      description: 'Browse through hundreds of available tasks across categories like data entry, surveys, content moderation, and more. Find tasks that match your skills and interests.',
      image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/5289a710-af5c-41be-91c0-17bd70aee84a/generated_images/task-marketplace-interface-showing-avail-a8cd6480-20251030164543.jpg",
      imageAlt: "Task marketplace showing available micro-tasks",
      imageObjectFit: 'cover' as const,
      containerBg: 'bg-[#13121d]',
      containerPadding: '',
    },
  },
  {
    id: 'earnings-tracking',
    label: 'Earnings tracking',
    Icon: BarChart3,
    content: {
      tag: 'Earnings Tracking',
      title: 'Monitor your income in real-time',
      description: "Track every dollar you earn with detailed analytics. See your daily, weekly, and monthly earnings at a glance. Export reports and plan your financial goals.",
      image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/5289a710-af5c-41be-91c0-17bd70aee84a/generated_images/earnings-tracking-dashboard-with-detaile-42937139-20251030164542.jpg",
      imageAlt: "Earnings tracking dashboard with income breakdown",
      imageObjectFit: 'cover' as const,
      containerBg: 'bg-[#13121d]',
      containerPadding: '',
    }
  },
  {
    id: 'auto-payouts',
    label: 'Auto payouts',
    Icon: Zap,
    content: {
      tag: 'Auto Payouts',
      title: 'Get paid instantly, automatically',
      description: 'Set up automatic withdrawals to your bank account, PayPal, or crypto wallet. No manual requests needed — your earnings are deposited as soon as you reach your threshold.',
      image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/5289a710-af5c-41be-91c0-17bd70aee84a/generated_images/modern-task-management-dashboard-ui-mock-a16ef11d-20251030164542.jpg",
      imageAlt: "Auto payout settings and payment history",
      imageObjectFit: 'cover' as const,
      containerBg: 'bg-[#1e1c36]',
      containerPadding: '',
    }
  },
  {
    id: 'worker-control',
    label: 'Worker control',
    Icon: SlidersHorizontal,
    content: {
      tag: 'Worker Control',
      title: 'Work on your schedule, your way',
      description: 'Set your availability, choose preferred task types, and control your workload. Filter tasks by difficulty, pay rate, or time requirement. You\'re in complete control.',
      image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/5289a710-af5c-41be-91c0-17bd70aee84a/generated_images/micro-work-platform-task-categories-card-9484f385-20251030164543.jpg",
      imageAlt: "Worker preferences and schedule control",
      imageObjectFit: 'cover' as const,
      containerBg: 'bg-[#1e1c36]',
      containerPadding: '',
    }
  }
];

const FeaturesSection = () => {
    const [activeTab, setActiveTab] = useState(tabsData[0].id);
    const activeTabData = tabsData.find(tab => tab.id === activeTab);

    return (
        <section id="feature" className="bg-background py-24">
            <div className="container mx-auto px-6 md:px-8 lg:px-12 text-center">
                <div className="max-w-3xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <h2 className="display-h2 mb-6">Built for reliable earnings</h2>
                    <p className="large-paragraph text-muted-foreground">
                        TaskInn gives you everything you need to maximize your income — powerful tools, instant payments, and complete flexibility to work on your terms.
                    </p>
                </div>
                
                <div role="tablist" className="flex justify-center mb-12 animate-in fade-in duration-700 delay-200">
                    <div className="flex flex-wrap items-center justify-center space-x-2 rounded-2xl border border-[rgba(0,0,0,0.08)] bg-background p-2">
                        {tabsData.map(tab => (
                            <button
                                key={tab.id}
                                role="tab"
                                aria-selected={activeTab === tab.id}
                                aria-controls={`tab-content-${tab.id}`}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-2 rounded-xl py-4 px-5 text-base font-medium transition-all duration-300 ease-in-out",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                    activeTab === tab.id
                                        ? "bg-card shadow-[0_4px_12px_0px_rgba(0,0,0,0.05)] border border-[rgba(0,0,0,0.06)] scale-105"
                                        : "text-foreground hover:bg-black/5 hover:scale-105"
                                )}
                            >
                                <tab.Icon className="h-5 w-5" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {activeTabData && (
                    <div
                        id={`tab-content-${activeTabData.id}`}
                        role="tabpanel"
                        className="animate-in fade-in zoom-in-95 duration-500"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center text-left">
                            <div className="relative overflow-hidden rounded-3xl h-[493px] bg-[#13121d] group">
                                <div className={cn("absolute inset-0", activeTabData.content.containerBg, activeTabData.content.containerPadding)}>
                                     <Image
                                        src={activeTabData.content.image}
                                        alt={activeTabData.content.imageAlt}
                                        fill
                                        style={{ objectFit: activeTabData.content.imageObjectFit }}
                                        sizes="(max-width: 1023px) 100vw, 50vw"
                                        className="group-hover:scale-105 transition-transform duration-700"
                                     />
                                </div>
                                <div 
                                    className="absolute inset-0 z-10"
                                    style={{backgroundImage: 'linear-gradient(to top, rgb(13, 12, 29) 0%, rgba(13, 12, 29, 0) 35%)'}}
                                />
                            </div>
                            <div className="flex flex-col items-start animate-in fade-in slide-in-from-right-8 duration-700">
                                <span className={cn("tag mb-6 bg-accent text-accent-foreground py-1.5 px-3.5 rounded-lg")}>
                                    {activeTabData.content.tag}
                                </span>
                                <h3 className="display-h3 mb-6">{activeTabData.content.title}</h3>
                                <p className="paragraph text-muted-foreground">
                                    {activeTabData.content.description}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default FeaturesSection;