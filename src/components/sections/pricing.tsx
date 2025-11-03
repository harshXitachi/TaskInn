import type { FC } from "react";
import Image from "next/image";
import { Check } from "lucide-react";

const pricingPlans = [
  {
    name: "Starter",
    price: "$24",
    description:
      "Designed for growing teams needing advanced features and scalability.",
    isPopular: false,
    features: [
      "Access to core features",
      "Basic performance reporting",
      "Email support",
      "Strategy onboarding guide",
      "Monthly check-in summary",
    ],
  },
  {
    name: "Growth",
    price: "$69",
    description:
      "Designed for growing teams that need powerful tools and expert guidance.",
    isPopular: true,
    features: [
      "Access to core features",
      "Advanced analytics dashboard",
      "Priority email support",
      "Quarterly strategy sessions",
      "Team access (up to 5 users)",
    ],
  },
  {
    name: "Scale",
    price: "$129",
    description:
      "Built for fast-scaling startups that require deep insights and partnership.",
    isPopular: false,
    features: [
      "Access to all features",
      "Dedicated success manager",
      "Custom KPI tracking",
      "Monthly performance reviews",
      "Team access (unlimited users)",
    ],
  },
];

interface PricingCardProps {
  name: string;
  price: string;
  description: string;
  isPopular: boolean;
  features: string[];
}

const PricingCard: FC<PricingCardProps> = ({
  name,
  price,
  description,
  isPopular,
  features,
}) => {
  const cardClasses = [
    "bg-[#2e363d]",
    "p-10",
    "rounded-[24px]",
    "flex",
    "flex-col",
    "transition-transform",
    "duration-300",
    "hover:-translate-y-1",
    isPopular ? "border-2 border-white" : "border border-[rgba(255,255,255,0.08)]",
  ].join(" ");

  return (
    <div className={cardClasses}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-white text-[28px] font-medium leading-[36px] font-display">
          {name}
        </h3>
        {isPopular && (
          <div className="bg-[#fef3c7] text-black text-sm font-semibold tracking-wide py-1 px-3 rounded-full">
            Most popular
          </div>
        )}
      </div>
      <h4 className="text-white text-[56px] font-medium leading-[1.1] mb-4 font-display">
        {price}
      </h4>
      <p className="text-[#adb2bb] text-base leading-[1.6] mb-8 min-h-[52px]">
        {description}
      </p>
      <a
        href="#"
        className="block text-center w-full py-3 px-7 rounded-full border border-white text-white font-medium text-base hover:bg-white hover:text-black transition-colors duration-200 mb-8"
      >
        Schedule a demo
      </a>
      <div className="h-px bg-[rgba(255,255,255,0.08)] mb-8"></div>
      <ul className="space-y-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[rgba(125,211,192,0.1)] flex items-center justify-center">
              <Check className="w-4 h-4 text-[#7dd3c0]" />
            </div>
            <span className="ml-4 text-base text-[#cfd4dc]">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const PricingSection: FC = () => {
  return (
    <section id="pricing" className="relative bg-[#3d464e] text-white pt-24 pb-28 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/images/68a6af7af1e741986b5d0da6_Dreamy_20Abstract_20Color-22.avif"
          alt="Abstract background"
          fill
          objectFit="cover"
          quality={100}
          className="opacity-30"
          unoptimized
        />
        <div className="absolute inset-0 backdrop-blur-[100px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#3d464e]/30 via-[#3d464e]/70 to-[#3d464e]"></div>
      </div>

      <div className="container relative z-10 mx-auto px-6 md:px-8 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-[56px] font-medium leading-[64px] -tracking-[0.01em] mb-4">
            Flexible pricing
          </h2>
          <p className="text-xl text-[#adb2bb] leading-8 font-normal">
            Find the right plan to help your business with our flexible options.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <PricingCard key={index} {...plan} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;