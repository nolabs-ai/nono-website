import Image from "next/image";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { type Testimonial } from "@/types/testimonial";

type TestimonialsProps = {
  testimonials: Testimonial[];
};

export default function Testimonials({ testimonials }: TestimonialsProps) {
  if (testimonials.length === 0) return null;

  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeader badge="Community" title="From the community" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-border border border-border">
          {testimonials.map((testimonial, index) => (
            <figure
              key={`${testimonial.name}-${index}`}
              className="flex flex-col justify-between gap-8 bg-background p-6 md:p-8"
            >
              <blockquote className="text-sm font-light leading-relaxed text-foreground">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <Image
                  src={testimonial.avatar}
                  alt={`${testimonial.name} avatar`}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full border border-border object-cover shrink-0"
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-xs font-mono text-muted">
                    {testimonial.role}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
