"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Image from "next/image";

export default function TestimonialsSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const testimonials = [
    [
      {
        image:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
        name: "Chiamaka Obi",
        text: "They sent a clear quote the next day, showed up on time and left the flat spotless. The kitchen hob had not looked that good since we moved in.",
        rating: 5,
      },
      {
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
        name: "Tunde Adeyemi",
        text: "We booked an office clean for after hours. Nothing was out of place on Monday morning and the restrooms were spotless. We now have them in monthly.",
        rating: 5,
      },
      {
        image:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
        name: "Ngozi Eze",
        text: "I liked that I could see the full price before paying anything. The team was polite, careful with the furniture and finished earlier than expected.",
        rating: 5,
      },
    ],
    [
      {
        image:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
        name: "Emeka Okafor",
        text: "Our restaurant needed an overnight deep clean before a health inspection. They handled the extraction hoods and floor drains without us asking twice.",
        rating: 5,
      },
      {
        image:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
        name: "Ifeoma Nwosu",
        text: "After renovating our building there was cement dust on every surface. Two days later it was ready for handover. Great communication throughout.",
        rating: 5,
      },
      {
        image:
          "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&h=200&fit=crop",
        name: "Blessing Amadi",
        text: "Booking was easy and I could follow each step from my phone. The after photos they sent made it simple to confirm everything was done.",
        rating: 5,
      },
    ],
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  return (
    <section className="py-20 px-6 bg-gray-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 right-20 text-9xl font-bold text-gray-400">
          ★
        </div>
        <div className="absolute bottom-20 left-10 text-9xl font-bold text-gray-400">
          ★
        </div>
        <div className="absolute top-1/2 left-1/4 text-7xl font-bold text-gray-400">
          ★
        </div>
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-16">
          <div>
            <p className="text-primary font-semibold mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
              <span>💬</span> TESTIMONIALS
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-primary leading-tight">
              Our Customer&apos;s Feedback
            </h2>
          </div>

          {/* Navigation Arrows */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              className="size-14 rounded-full border-2 border-primary text-primary hover:border-blue-700 hover:bg-blue-700 hover:text-white"
              aria-label="Previous testimonials"
            >
              <svg
                className="size-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              className="size-14 rounded-full border-2 border-primary text-primary hover:border-blue-700 hover:bg-blue-700 hover:text-white"
              aria-label="Next testimonials"
            >
              <svg
                className="size-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Button>
          </div>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {testimonials[currentSlide].map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-8 relative hover:shadow-xl transition-shadow"
            >
              {/* Quote Icon */}
              <div className="absolute bottom-8 right-8 text-gray-200">
                <svg
                  className="w-16 h-16"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
                </svg>
              </div>

              {/* Profile Image - Positioned at top center overlapping the card */}
              <div className="flex flex-col items-center -mt-20 mb-6">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-primary bg-white">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                    width={112}
                    height={112}
                  />
                </div>
              </div>

              {/* Name */}
              <h3 className="text-xl font-bold text-primary text-center mb-4">
                {testimonial.name}
              </h3>

              {/* Testimonial Text */}
              <p className="text-gray-600 text-center text-sm leading-relaxed mb-6">
                {testimonial.text}
              </p>

              {/* Star Rating */}
              <div className="flex justify-center gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-3">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === index ? "bg-primary w-8" : "bg-gray-300"
              }`}
              aria-label={`Go to testimonial slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
