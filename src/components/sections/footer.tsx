"use client";

import Image from "next/image";
import Link from "next/link";
import { Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background pt-32 pb-10 text-foreground">
      <div className="container">
        {/* Top Section: Newsletter and Nav Links */}
        <div className="flex flex-col items-start justify-between pb-20 lg:flex-row">
          {/* Newsletter Form */}
          <div className="w-full lg:mb-0 lg:w-1/2">
            <p className="large-paragraph">Sign up for our newsletter</p>
            <div className="mt-6">
              <form
                name="email-form"
                method="get"
                className="relative flex w-full max-w-[430px] items-center justify-between rounded-full border border-black/10 bg-card p-1"
              >
                <input
                  type="email"
                  className="h-12 w-full flex-1 appearance-none border-0 bg-transparent px-5 text-base leading-[26px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0"
                  maxLength={256}
                  name="email"
                  id="email"
                  placeholder="name@email.com"
                  required
                />
                <input
                  type="submit"
                  value="Subscribe"
                  className="button-text cursor-pointer rounded-full bg-primary px-6 py-3 text-primary-foreground transition-colors hover:bg-neutral-800"
                />
              </form>
            </div>
          </div>
          {/* Navigation Links */}
          <div className="mt-16 w-full lg:mt-0 lg:w-auto lg:text-left">
            <p className="paragraph mb-6 text-muted-foreground">Pages</p>
            <nav>
              <Link href="#" className="paragraph mb-3 block text-foreground transition-colors hover:text-gray-600">Home</Link>
              <Link href="#" className="paragraph mb-3 block text-foreground transition-colors hover:text-gray-600">About</Link>
              <Link href="#" className="paragraph mb-3 block text-foreground transition-colors hover:text-gray-600">Pricing</Link>
              <Link href="#" className="paragraph mb-3 block text-foreground transition-colors hover:text-gray-600">Case Study</Link>
              <Link href="#" className="paragraph mb-3 block text-foreground transition-colors hover:text-gray-600">Licenses</Link>
            </nav>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-border"></div>
        
        {/* Bottom Section: Socials, Email, and Credits */}
        <div className="flex flex-col-reverse items-start justify-between gap-y-10 pt-10 md:flex-row md:items-end">
          {/* Left Side: Socials and Email */}
          <div>
            <div className="flex items-center gap-6">
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-foreground transition-opacity hover:opacity-70">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-foreground transition-opacity hover:opacity-70">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-foreground transition-opacity hover:opacity-70">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
            <a href="mailto:hello@grovia.io" className="display-h2 mt-10 block text-foreground transition-colors hover:text-gray-600">
              hello@grovia.io
            </a>
          </div>

          {/* Right Side: Credits and Webflow Badge */}
          <div className="flex flex-col items-start gap-4 text-right md:items-end">
            <p className="paragraph text-muted-foreground">
              Designed by Lunis | Powered by Webflow
            </p>
            <a
              href="https://webflow.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center gap-1.5 opacity-80 transition-opacity hover:opacity-100"
            >
              <p className="text-sm text-muted-foreground">Made in</p>
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/svgs/webflow-badge-icon-d2_89e12c322e-10.svg"
                alt="Webflow icon"
                width={20}
                height={20}
              />
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/svgs/webflow-badge-text-d2_c82cec3b78-11.svg"
                alt="Webflow text"
                width={88}
                height={14}
                className="relative top-px"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;