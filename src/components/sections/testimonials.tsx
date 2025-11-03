import Image from "next/image";

const testimonialsData = [
  {
    quote: "Grovia helped us streamline our operations and scale faster than we imagined. Their mix of strategy and execution is unmatched.",
    name: "Talia Smith",
    title: "Head of Product at Forma",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/images/68a71d7fa80bb87671d03408_Contemplative_20Woman_20i-12.avif",
    gradientClasses: "from-[#fce4ec] to-[#d97757]", // Accent Pink to Accent Coral
  },
  {
    quote: "Working with Grovia felt like having an extension of our team. They understood our challenges and delivered real, measurable results.",
    name: "Jordan Johnson",
    title: "COO at Metrico",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/images/68a71d7fa80bb87671d03416_Dreamy_20Portrait_20of_20-11.avif",
    gradientClasses: "from-[#fef3c7] to-[#7dd3c0]", // Accent Yellow to Accent Teal
  },
  {
    quote: "From the first meeting, Grovia brought clarity and momentum to our hiring strategy. We've seen a major improvement in team performance.",
    name: "Samuel Torres",
    title: "Founder at Bloomtech",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/images/68a71d7fa79008ec6716ac73_Modern_20man_20portrait_2-10.avif",
    gradientClasses: "from-[#d97757] to-[#60a5fa]", // Accent Coral to Accent Blue
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {testimonialsData.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="flex flex-col justify-between p-10 bg-white rounded-3xl shadow-[0_4px_24px_0_rgba(0,0,0,0.05)] animate-in fade-in slide-in-from-bottom-5 duration-700"
              style={{
                animationDelay: `${index * 50}ms`,
                animationFillMode: "backwards",
              }}
            >
              <div>
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5289a710-af5c-41be-91c0-17bd70aee84a-grovia-template-webflow-io/assets/svgs/68a7e01f4b9688a13f476aa4_Quotes-9.svg"
                  alt="Quote icon"
                  width={48}
                  height={48}
                  className="mb-6"
                />
                <p className="large-paragraph text-[#3d464e] mb-6">
                  {testimonial.quote}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-full p-1 bg-gradient-to-br ${testimonial.gradientClasses} shrink-0`}
                >
                  <Image
                    src={testimonial.image}
                    alt={`Portrait of ${testimonial.name}`}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full rounded-full"
                  />
                </div>
                <div>
                  <p className="text-lg font-medium text-text-primary">
                    {testimonial.name}
                  </p>
                  <p className="paragraph text-muted-foreground">
                    {testimonial.title}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;