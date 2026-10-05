"use client";
import { useState } from "react";

export default function VideoStatsSection() {
  const [isPlaying, setIsPlaying] = useState(false);

  const stats = [
    {
      icon: (
        <svg
          className="w-12 h-12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
      ),
      number: "500k+",
      label: "Awards Win",
    },
    {
      icon: (
        <svg
          className="w-12 h-12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="15" x2="15" y2="15" />
          <polyline points="12 18 9 15 12 12" />
        </svg>
      ),
      number: "815k",
      label: "Completed Project",
    },
    {
      icon: (
        <svg
          className="w-12 h-12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          <path d="M9 12l1.5 1.5L13 11" />
        </svg>
      ),
      number: "999k+",
      label: "Happy Clients",
    },
    {
      icon: (
        <svg
          className="w-12 h-12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
          <path d="M12 8h6v6" />
        </svg>
      ),
      number: "550k+",
      label: "Finish The Job",
    },
  ];

  const handlePlayVideo = () => {
    setIsPlaying(true);
  };

  return (
    <section className="relative bg-primary py-20 overflow-hidden">
      {/* Decorative Wave Pattern - Left */}
      <div className="absolute left-0 top-0 bottom-0 w-48 opacity-10">
        <svg
          viewBox="0 0 200 800"
          className="h-full w-full"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          {[...Array(15)].map((_, i) => (
            <path
              key={i}
              d={`M 0 ${i * 50} Q 50 ${i * 50 + 25}, 100 ${i * 50} T 200 ${
                i * 50
              }`}
              strokeOpacity="0.3"
            />
          ))}
        </svg>
      </div>

      {/* Decorative Wave Pattern - Right */}
      <div className="absolute right-0 top-0 bottom-0 w-48 opacity-10">
        <svg
          viewBox="0 0 200 800"
          className="h-full w-full"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          {[...Array(15)].map((_, i) => (
            <path
              key={i}
              d={`M 0 ${i * 50} Q 50 ${i * 50 + 25}, 100 ${i * 50} T 200 ${
                i * 50
              }`}
              strokeOpacity="0.3"
            />
          ))}
        </svg>
      </div>

      <div className="container mx-auto max-w-7xl px-6 relative z-10">
        {/* Video Section */}
        <div className="mb-16 relative">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl max-w-5xl mx-auto">
            {!isPlaying ? (
              <>
                {/* Video Thumbnail */}
                <img
                  src="https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=1200&h=600&fit=crop"
                  alt="Cleaning service"
                  className="w-full h-[400px] md:h-[500px] object-cover"
                />

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/30" />

                {/* Play Button */}
                <button
                  onClick={handlePlayVideo}
                  className="absolute inset-0 flex items-center justify-center group"
                  aria-label="Play video"
                >
                  <div className="relative">
                    {/* Outer Circles */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-40 h-40 rounded-full border-2 border-white/30 animate-pulse" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="w-32 h-32 rounded-full border-2 border-white/40"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="w-24 h-24 rounded-full border-2 border-white/50"
                        style={{ animationDelay: "0.4s" }}
                      />
                    </div>

                    {/* Play Button Circle */}
                    <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-8 h-8 text-blue-700 ml-1"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </button>
              </>
            ) : (
              <div className="relative" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                  title="Cleaning Service Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center text-white">
              {/* Icon */}
              <div className="flex justify-center mb-4 opacity-80">
                {stat.icon}
              </div>

              {/* Number */}
              <h3 className="text-4xl md:text-5xl font-extrabold mb-2">
                {stat.number}
              </h3>

              {/* Label */}
              <p className="text-white/80 text-sm md:text-base font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
