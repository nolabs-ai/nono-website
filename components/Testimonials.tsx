"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { type Testimonial } from "@/types/testimonial";

const AUTOPLAY_MS = 5000;

type TestimonialsProps = {
  testimonials: Testimonial[];
};

export default function Testimonials({ testimonials }: TestimonialsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (testimonials.length === 0) return;

    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, AUTOPLAY_MS);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  if (testimonials.length === 0) return null;

  return (
    <section className="py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <SectionHeader
          badge="Community"
          title="From the community"
        />
        <div className="relative overflow-hidden border border-border">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {testimonials.map((testimonial, index) => (
              <article
                key={`${testimonial.name}-${index}`}
                className="min-w-full p-6 md:p-8"
              >
                <div className="flex items-start gap-4">
                  <Image
                    src={testimonial.avatar}
                    alt={`${testimonial.name} avatar`}
                    width={36}
                    height={36}
                    className="h-9 w-9 rounded-full border border-border object-cover shrink-0"
                  />

                  <div>
                    <p className="text-sm font-light leading-relaxed text-foreground">
                      &ldquo;{testimonial.quote}&rdquo;
                    </p>
                    <p className="mt-4 text-xs font-mono text-muted">
                      {testimonial.name} -- {testimonial.role}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-1 transition-all ${
                activeIndex === index
                  ? "w-8 bg-foreground"
                  : "w-2 bg-muted/30 hover:bg-muted/50"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
