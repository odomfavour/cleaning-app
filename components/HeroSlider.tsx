"use client";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const slides = [
  {
    img: "/images/slider-v1-img1.jpg",
    title: "Professional Cleaning.",
    subtitle: "Made Simple.",
    desc: "Request professional cleaning for your home, office or commercial space. Tell us what you need, get a clear quotation, and we take care of the rest.",
  },
  {
    img: "/images/slider-v1-img2.jpg",
    title: "Your Space, Renewed.",
    subtitle: "Clean Meets Comfort.",
    desc: "From a single apartment to a multi-floor office, our trained teams bring the right equipment and attention to detail.",
  },
  {
    img: "/images/slider-v1-img3.jpg",
    title: "Clean Spaces, Zero Stress.",
    subtitle: "No Payment Until You Approve.",
    desc: "Every job starts with a free, itemised quotation. You only pay once you have reviewed and accepted it.",
  },
];

interface Bubble {
  id: number;
  size: number;
  left: number;
  delay: number;
  duration: number;
}

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [bubbles] = useState<Bubble[]>(() => {
    return [...Array(15)].map((_, i) => ({
      id: i,
      size: 8 + Math.random() * 30, // Smaller bubbles for mobile
      left: Math.random() * 100,
      delay: i * 0.5,
      duration: 10 + Math.random() * 8,
    }));
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-900">
      {/* Realistic Bubble Animation Layer */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-10">
        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className="absolute bottom-0 rounded-full animate-bubble"
            style={{
              left: `${bubble.left}%`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              animationDelay: `${bubble.delay}s`,
              animationDuration: `${bubble.duration}s`,
              background: `radial-gradient(circle at 30% 30%, 
                rgba(255, 255, 255, 0.8) 0%, 
                rgba(255, 255, 255, 0.4) 30%, 
                rgba(255, 255, 255, 0.1) 60%,
                transparent 100%)`,
              boxShadow: `
                inset -2px -2px 8px rgba(255, 255, 255, 0.5),
                inset 2px 2px 8px rgba(0, 0, 0, 0.1),
                0 0 20px rgba(255, 255, 255, 0.3)
              `,
              border: "1px solid rgba(255, 255, 255, 0.3)",
            }}
          >
            {/* Inner shine effect */}
            <div
              className="absolute rounded-full"
              style={{
                top: "15%",
                left: "20%",
                width: "30%",
                height: "30%",
                background:
                  "radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, transparent 70%)",
              }}
            />
          </div>
        ))}
      </div>

      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            current === index ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={slide.img}
            alt=""
            fill
            priority={current === index}
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
          />

          {/* Blue Filter */}
          <div className="absolute inset-0 bg-blue-900/50" />
        </div>
      ))}

      {/* Text Overlay - Responsive */}
      <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:pl-20 text-white z-20 max-w-7xl mx-auto">
        <div className="text-center md:text-left">
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight sm:leading-tight md:leading-tight transition-all duration-700"
            key={slides[current].title}
          >
            {slides[current].title}
            <br />
            <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
              {slides[current].subtitle}
            </span>
          </h1>

          <p
            className="mt-4 sm:mt-5 max-w-xs sm:max-w-sm md:max-w-xl text-sm sm:text-base md:text-lg text-white/95 transition-all duration-700 delay-200 mx-auto md:mx-0 text-center md:text-left"
            key={slides[current].desc}
          >
            {slides[current].desc}
          </p>

          {/* CTA BUTTON - Responsive */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start mt-6 sm:mt-8">
            <Button asChild variant="secondary" className="h-auto bg-white px-6 py-3 text-sm text-blue-900 shadow-lg hover:bg-blue-50 hover:shadow-xl sm:px-8 sm:py-4 sm:text-base"><Link href="/request-cleaning">
              Request a Cleaning
            </Link></Button>
            <Button asChild variant="outline" className="h-auto border-2 border-white/80 bg-transparent px-6 py-3 text-sm text-white hover:bg-white/10 hover:text-white sm:px-8 sm:py-4 sm:text-base"><a href="#services">
              Explore Services
            </a></Button>
          </div>
        </div>
      </div>

      {/* Dots Navigation - Responsive Positioning */}
      <div className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 sm:gap-4 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-3 w-3 sm:h-4 sm:w-4 rounded-full border-2 border-white transition-all duration-300 ${
              current === index
                ? "bg-white scale-125"
                : "bg-transparent hover:bg-white/50 hover:scale-110"
            }`}
          />
        ))}
      </div>

      {/* Mobile Bottom Dots Alternative */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 sm:hidden z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              current === index
                ? "bg-white scale-125"
                : "bg-white/50 hover:bg-white/70"
            }`}
          />
        ))}
      </div>

      {/* Bubble Animation Keyframes */}
      <style jsx>{`
        @keyframes bubble {
          0% {
            bottom: -10%;
            opacity: 0;
          }
          5% {
            opacity: 0.8;
          }
          50% {
            opacity: 0.6;
          }
          95% {
            opacity: 0.3;
          }
          100% {
            bottom: 110%;
            opacity: 0;
          }
        }

        .animate-bubble {
          animation-name: bubble;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          backdrop-filter: blur(1px);
        }

        /* Reduce bubbles on mobile for better performance */
        @media (max-width: 768px) {
          .pointer-events-none > div:nth-child(n + 10) {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
