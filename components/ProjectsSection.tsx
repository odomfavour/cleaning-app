"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Image from "next/image";

export default function ProjectsSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const projects = [
    {
      images: [
        {
          src: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=600&fit=crop",
          title: "Deep Living Room Clean",
          desc: "A full deep clean for living spaces — dusting, vacuuming, and sanitizing surfaces.",
        },
        {
          src: "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=400&h=600&fit=crop",
          title: "Kitchen Refresh",
          desc: "Grease removal, appliance wipe-downs and countertop polishing to restore shine.",
        },
        {
          src: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=600&fit=crop",
          title: "Bathroom Sanitation",
          desc: "Deep sanitation of bathroom fixtures and grout cleaning for a hygienic finish.",
        },
        {
          src: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400&h=600&fit=crop",
          title: "Bedroom Detail",
          desc: "Dusting, bed changing, and floor care to make bedrooms restful again.",
        },
      ],
      title: "House Cleaning",
      location: "Old GRA, Port Harcourt",
    },
    {
      images: [
        {
          src: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=400&h=600&fit=crop",
          title: "Workspace Disinfect",
          desc: "High-touch surface disinfection and desk area organization for offices.",
        },
        {
          src: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=600&fit=crop",
          title: "Conference Room Prep",
          desc: "Clean and prep meeting spaces to leave a professional impression.",
        },
        {
          src: "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=400&h=600&fit=crop",
          title: "Lobby Maintenance",
          desc: "Floor care, dusting, and glass cleaning to welcome visitors.",
        },
        {
          src: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=600&fit=crop",
          title: "Breakroom Cleanup",
          desc: "Sanitizing surfaces and equipment in shared kitchen areas.",
        },
      ],
      title: "Office Cleaning",
      location: "Trans-Amadi, Port Harcourt",
    },
    {
      images: [
        {
          src: "https://images.unsplash.com/photo-1527515862127-a4fc05baf7a5?w=400&h=600&fit=crop",
          title: "Exterior Window Shine",
          desc: "Streak-free exterior window cleaning for improved views and sunlight.",
        },
        {
          src: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=400&h=600&fit=crop",
          title: "Screen and Frame Care",
          desc: "Cleaning frames and screens to remove dust and debris.",
        },
        {
          src: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=600&fit=crop",
          title: "Track & Sill Detail",
          desc: "Detail cleaning of window tracks and sills for smooth operation.",
        },
        {
          src: "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=400&h=600&fit=crop",
          title: "Glass Polishing",
          desc: "Final polish to leave glass crystal clear and spotless.",
        },
      ],
      title: "Window Cleaning",
      location: "GRA Phase 2, Port Harcourt",
    },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 w-full">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 sm:gap-0 mb-8 sm:mb-12">
            <div className="max-w-2xl">
              <p className="text-primary font-semibold mb-3 flex items-center gap-2 text-xs sm:text-sm uppercase tracking-wide">
                <span>📊</span> OUR SUCCESSFUL PROJECT
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-primary leading-tight sm:leading-tight lg:leading-tight">
                Keep your vision to our latest{" "}
                <span className="block sm:inline">projects.</span>
              </h2>
            </div>
            <Button className="hidden h-auto px-6 py-3 text-sm hover:bg-blue-800 sm:flex lg:px-8 lg:py-4 lg:text-base">
              VIEW ALL PROJECTS
              <svg
                className="size-4 lg:size-5"
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

        {/* Image Gallery - Responsive Grid */}
        <div className="px-4 sm:px-6 lg:px-8 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {projects[currentSlide].images.map((image, index) => (
              <div
                key={index}
                className={`relative overflow-hidden rounded-lg group ${
                  index === 3 ? "sm:col-span-2 lg:col-span-1" : ""
                }`}
                style={{
                  height: "300px",
                  minHeight: "300px",
                }}
              >
                <Image
                  src={image.src}
                  alt={image.title || `Project ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  priority={index === 0}
                />

                {/* Mobile Overlay (always visible on mobile) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent sm:bg-none flex items-end sm:items-center sm:justify-center">
                  <div className="text-white sm:text-transparent p-4 sm:p-0 w-full sm:w-auto">
                    <h3 className="text-lg font-bold mb-1 sm:mb-0 sm:group-hover:text-white sm:group-hover:mb-2 transition-all duration-300">
                      {image.title}
                    </h3>
                    <p className="text-sm text-gray-200 sm:text-transparent sm:group-hover:text-white/90 sm:group-hover:mb-2 transition-all duration-300">
                      {image.desc}
                    </p>
                  </div>
                </div>

                {/* Desktop Overlay Card (shows on hover) */}
                <div className="hidden sm:block absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-2xl p-4 lg:p-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto transition-all duration-300">
                  <div className="flex items-center justify-between mb-3 lg:mb-4">
                    <div className="w-8 h-8 lg:w-12 lg:h-12 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-lg lg:text-2xl font-bold">
                        +
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg lg:text-xl xl:text-2xl font-bold text-primary mb-1 lg:mb-2">
                    {image.title}
                  </h3>
                  <p className="text-sm lg:text-base text-gray-600 mb-2 lg:mb-2 line-clamp-2">
                    {image.desc}
                  </p>
                  <p className="text-xs lg:text-sm text-gray-600 flex items-center gap-2">
                    <svg
                      className="w-3 h-3 lg:w-4 lg:h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {projects[currentSlide].location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-2 sm:gap-3 px-4 sm:px-6 lg:px-8">
          {projects.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`rounded-full transition-all duration-300 ${
                currentSlide === index
                  ? "bg-blue-700"
                  : "bg-gray-300 hover:bg-gray-400"
              } ${
                currentSlide === index
                  ? "w-8 sm:w-12 lg:w-14 h-2"
                  : "w-6 sm:w-8 lg:w-10 h-2"
              }`}
              aria-label={`Show ${projects[index].title} projects`}
            />
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
          <Button className="h-auto w-full px-6 py-4 text-sm hover:bg-blue-800 sm:hidden">
            VIEW ALL PROJECTS
            <svg
              className="size-4"
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
    </section>
  );
}
