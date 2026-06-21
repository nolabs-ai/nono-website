import Header from "@/components/Header";
import Hero from "@/components/Hero";
import GetStarted from "@/components/GetStarted";
import SupportedAgents from "@/components/SupportedAgents";
import ScaleBand from "@/components/ScaleBand";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import testimonials from "@/data/testimonials.json";
import { type Testimonial } from "@/types/testimonial";

export default function Home() {
  const testimonialItems = testimonials as Testimonial[];

  return (
    <>
      <Header />
      <main>
        <Hero />
        <GetStarted />
        <div className="h-px bg-border" />
        <SupportedAgents />
        <div className="h-px bg-border" />
        <ScaleBand />
        <Testimonials testimonials={testimonialItems} />
      </main>
      <Footer />
    </>
  );
}
