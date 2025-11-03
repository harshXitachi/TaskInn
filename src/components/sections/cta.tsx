import React from 'react';
import Image from 'next/image';

const avatars = [
  'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/images/68a71d7fa80bb87671d03416_Dreamy_20Portrait_20of_20-11.avif',
  'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/images/68a71d7fa79008ec6716ac73_Modern_20man_20portrait_2-10.avif',
  'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/images/68a71d7fa80bb87671d03408_Contemplative_20Woman_20i-12.avif',
];

const CtaSection = () => {
  return (
    <section id="contact" className="bg-background py-16 sm:py-24">
      <div className="container">
        <div 
          className="relative overflow-hidden rounded-3xl bg-cover bg-center px-6 py-20 text-center text-white sm:px-12 sm:py-24"
          style={{
            backgroundColor: '#3d464e',
            backgroundImage: "url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/images/68a4926970c908e1d7ffaec8_Dreamlike_20Abstract_20Ar-26.avif')",
          }}
        >
          <div className="absolute inset-0 bg-black/60 bg-gradient-to-br from-[#5a3a52]/40 to-[#8b4049]/40 backdrop-blur-sm"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <h2 className="display-h2 font-medium text-white">Start your journey</h2>
            <p className="mt-4 max-w-xl large-paragraph text-white/80">
              Let's start building something great together.
            </p>
            
            <div className="mt-10 flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
              <a href="tel:206-473-1725" className="large-paragraph font-normal text-white transition-opacity hover:opacity-80">
                206-473-1725
              </a>
              <a href="mailto:hello@grovia.io" className="large-paragraph font-normal text-white transition-opacity hover:opacity-80">
                hello@grovia.io
              </a>
            </div>

            <div className="mt-12 flex items-center">
              <div className="flex -space-x-3">
                {avatars.map((avatar, index) => (
                  <Image
                    key={index}
                    src={avatar}
                    alt={`Customer ${index + 1}`}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full border-2 border-white/40 object-cover"
                  />
                ))}
              </div>
              <div className="ml-4 text-left">
                <p className="font-semibold text-white">4.95 Rated</p>
                <p className="text-sm text-white/70">Over 9.2k Customers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;