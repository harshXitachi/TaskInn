"use client";

import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus } from "lucide-react";

const faqData = [
  {
    question: "What types of tasks are available?",
    answer:
      "TaskInn offers a wide variety of micro-tasks, from data entry and content moderation to user testing and survey participation. Our platform serves diverse industries, providing tasks suitable for different skill sets.",
  },
  {
    question: "How quickly can I start earning?",
    answer:
      "You can start earning almost immediately after completing our simple onboarding process. Most new workers find and complete their first task within the first day of signing up.",
  },
  {
    question: "Can TaskInn integrate with my payment preferences?",
    answer:
      "Absolutely. TaskInn supports various payment methods including PayPal, bank transfers, and other popular digital wallets. You can set your preferences in your account settings for seamless payouts.",
  },
  {
    question: "Do you offer training or support?",
    answer:
      "Yes, we offer both. Our platform includes a comprehensive help center with tutorials for getting started. For more specific issues, our dedicated support team is available via email to assist you.",
  },
  {
    question: "What does the onboarding process look like?",
    answer:
      "Our onboarding process is quick and straightforward. It involves a simple sign-up, a brief skills assessment to match you with relevant tasks, and a quick tutorial on using the platform effectively.",
  },
];

export default function FaqSection() {
  return (
    <section id="faq" className="bg-background py-24 lg:py-32">
      <div className="container">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center mb-16">
          <h2 className="display-h2 max-w-2xl">Your questions, answered</h2>
          <a
            href="#contact"
            className="inline-block shrink-0 bg-transparent text-primary border-[1.5px] border-primary py-3.5 px-7 rounded-full text-base font-medium transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Contact us
          </a>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion
            type="single"
            collapsible
            defaultValue="item-0"
            className="w-full"
          >
            {faqData.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-2xl mb-3"
              >
                <AccordionTrigger className="flex w-full items-center justify-between p-6 text-left text-xl font-medium hover:no-underline [&[data-state=open]>svg]:rotate-45">
                  <span className="flex-1 pr-4">{item.question}</span>
                  <Plus className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200" />
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <p className="text-base text-muted-foreground leading-[26px]">
                    {item.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}