"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface TeamMember {
  image: string;
  name: string;
  role: string;
}

export default function TeamSection() {
  const teamMembers: TeamMember[] = [
    {
      image:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=500&fit=crop",
      name: "Blessing Wali",
      role: "House Cleaner",
    },
    {
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
      name: "Samuel Ikpe",
      role: "Office Cleaner",
    },
    {
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop",
      name: "Joy Akpan",
      role: "Window Cleaner",
    },
    {
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop",
      name: "Daniel Okoro",
      role: "Window Cleaner",
    },
  ];

  return (
    <section className="py-20 px-6 bg-gray-50 relative">
      {/* Back to Top Button */}
      <Button className="fixed right-8 bottom-8 z-50 h-auto flex-col gap-1 bg-blue-700 p-4 shadow-lg hover:bg-blue-800">
        <svg
          className="size-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
        <span
          className="text-xs font-bold writing-mode-vertical"
          style={{ writingMode: "vertical-rl" }}
        >
          GO BACK TOP
        </span>
      </Button>

      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-blue-600 font-semibold mb-3 flex items-center justify-center gap-2 text-sm uppercase tracking-wide">
            <span>👥</span> We&apos;ve Awesome Team Members
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-primary leading-tight">
            Meet Our Experienced &amp; <br /> Professional Team
          </h2>
        </div>

        {/* Team Grid - 4 members static */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {teamMembers.map((member, index) => (
            <div key={index} className="group relative">
              <div className="relative overflow-hidden rounded-2xl shadow-lg h-[450px]">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />

                {/* Hover Overlay with Social Icons */}
                <div className="absolute inset-0 bg-blue-900/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex gap-3">
                    {[
                      <path
                        key="fb"
                        d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"
                      />,
                      <path
                        key="tw"
                        d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"
                      />,
                      <path
                        key="ig"
                        d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01"
                      />,
                      <path
                        key="pi"
                        d="M12 0a12 12 0 0012 12c0-5.28-3.6-9.72-8.4-11.04C13.2 1.68 12 3.6 12 6v6c0 3.36-2.64 6-6 6-3.12 0-5.76-2.4-5.76-5.52C.24 9.12 2.4 6.72 5.52 6.72c.96 0 1.92.24 2.64.72"
                      />,
                    ].map((path, i) => (
                      <a
                        key={i}
                        href="#"
                        className="w-12 h-12 bg-white text-blue-900 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"
                      >
                        <svg
                          className="size-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          viewBox="0 0 24 24"
                        >
                          {path}
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Name and Role */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-900 to-transparent p-6 text-white">
                  <h3 className="text-xl font-bold">{member.name}</h3>
                  <p className="text-blue-200">{member.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
