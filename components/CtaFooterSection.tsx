"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

interface BubbleProps {
  size: string;
  left: string;
  top: string;
  delay: string;
  duration: string;
}

const Bubble = ({ size, left, top, delay, duration }: BubbleProps) => (
  <div
    className="absolute rounded-full opacity-20"
    style={{
      width: size,
      height: size,
      left,
      top,
      animationDelay: delay,
      animationDuration: duration,
      background: `radial-gradient(circle at 35% 35%, 
        rgba(255, 255, 255, 0.3) 0%, 
        rgba(200, 220, 240, 0.15) 30%, 
        rgba(150, 180, 210, 0.08) 60%,
        transparent 100%)`,
      boxShadow: `
        inset -2px -2px 6px rgba(255, 255, 255, 0.3),
        inset 2px 2px 6px rgba(0, 0, 0, 0.05)
      `,
      border: "1px solid rgba(255, 255, 255, 0.2)",
    }}
  >
    <div
      className="absolute rounded-full"
      style={{
        top: "20%",
        left: "25%",
        width: "30%",
        height: "30%",
        background:
          "radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%)",
      }}
    />
  </div>
);

export default function CTAFooterSection() {
  const [email, setEmail] = useState<string>("");

  const handleSubscribe = (): void => {
    if (email) {
      toast.success("Thanks for subscribing.");
      setEmail("");
    }
  };

  return (
    <>
      {/* CTA Section with Diagonal Split */}
      <section id="request" className="relative min-h-64 overflow-hidden bg-[#0d4663]">
        {/* Left Side - Cleaning Person Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/slider-v1-img3.jpg')",
            // clipPath: "polygon(0 0, 40% 0, 30% 100%, 0 100%)",
          }}
        />

        {/* Diagonal Blue Section */}
        <div
          className="absolute inset-0 bg-[#0d4663] md:[clip-path:polygon(30%_0,100%_0,100%_100%,40%_100%)]"
          style={{
          }}
        />

        <div className="container mx-auto px-6 h-full flex items-center justify-between max-w-7xl relative z-10">
          {/* Left Side - Empty (image shows through) */}
          <div className="hidden md:block w-1/3"></div>

          {/* Center/Right - Text and Button on Blue Background */}
          <div className="flex-1 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-6 py-12 md:py-0 md:pl-20">
            <div className="text-white">
              <h2 className="text-3xl md:text-5xl font-extrabold">
                Ready for a cleaner space?
              </h2>
              <p className="mt-3 max-w-xl text-white/90">
                Tell us what you need cleaned and we&apos;ll prepare a quotation for you.
              </p>
            </div>

            <Button asChild className="h-auto gap-3 bg-blue-600 px-8 py-4 font-bold whitespace-nowrap shadow-xl hover:bg-blue-700 md:ml-8 md:px-10"><Link href="/request-cleaning">
              Request a Cleaning
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link></Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-[#0d4663] text-white pt-20 pb-8 overflow-hidden">
        {/* Floating Bubbles */}
        <Bubble size="70px" left="5%" top="10%" delay="0s" duration="20s" />
        <Bubble size="55px" left="15%" top="60%" delay="3s" duration="22s" />
        <Bubble size="65px" left="85%" top="15%" delay="2s" duration="21s" />
        <Bubble size="80px" left="92%" top="70%" delay="1s" duration="23s" />
        <Bubble size="50px" left="50%" top="80%" delay="5s" duration="19s" />
        <Bubble size="60px" left="75%" top="40%" delay="4s" duration="24s" />

        {/* Decorative Sparkles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-20 text-6xl text-white/5">
            ✦
          </div>
          <div className="absolute top-32 right-40 text-4xl text-white/5">
            ✦
          </div>
          <div className="absolute bottom-32 right-10 text-5xl text-white/5">
            ✦
          </div>
          <div className="absolute top-20 right-60 text-3xl text-white/5">
            ✦
          </div>
          <div className="absolute bottom-20 left-10 text-4xl text-white/5">
            ✦
          </div>
          <div className="absolute top-40 left-20 text-5xl text-white/5">✦</div>
          <div className="absolute top-60 left-60 text-3xl text-white/5">✦</div>
          <div className="absolute bottom-40 right-80 text-4xl text-white/5">
            ✦
          </div>
        </div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            {/* Column 1 - Company Info */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-[#0d4663]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <circle cx="12" cy="12" r="2" fill="white" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Cleanin</h3>
                  <p className="text-xs text-white/60">Cleaning Services</p>
                </div>
              </div>
              <p className="text-white/70 text-sm leading-relaxed mb-6">
                Professional cleaning for homes, offices and commercial spaces in Port Harcourt. Clear quotations, reliable teams and careful work.
              </p>
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
                    key="in"
                    d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"
                  />,
                  <path
                    key="ig"
                    d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01"
                  />,
                ].map((path, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-11 h-11 bg-white/10 hover:bg-white hover:text-[#0d4663] rounded-full flex items-center justify-center transition-all"
                  >
                    <svg
                      className="w-5 h-5"
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

            {/* Column 2 - Services */}
            <div>
              <h4 className="text-xl font-bold mb-6">Services</h4>
              <ul className="space-y-3">
                {[
                  "Residential Cleaning",
                  "Deep Cleaning",
                  "Office Cleaning",
                  "Move-in / Move-out",
                  "Post-Construction",
                  "Commercial Cleaning",
                ].map((service) => (
                  <li key={service}>
                    <a
                      href="#"
                      className="text-white/70 hover:text-white transition-colors flex items-center gap-2 text-sm group"
                    >
                      <svg
                        className="w-4 h-4 opacity-50 group-hover:opacity-100"
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
                      {service}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 - Official Info */}
            <div>
              <h4 className="text-xl font-bold mb-6">Official Info:</h4>
              <ul className="space-y-5">
                <li className="flex gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div className="text-sm">
                    <p className="text-white font-semibold mb-1">
                      14 Trans-Amadi Road
                    </p>
                    <p className="text-white/60">Port Harcourt, Rivers State</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div className="text-sm">
                    <p className="text-white font-semibold mb-1">
                      +234 803 555 0142
                    </p>
                    <p className="text-white/60">+234 803 555 0142</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="text-sm">
                    <p className="text-white font-semibold mb-1">
                      hello@cleanin.ng
                    </p>
                    <p className="text-white/60">hello@cleanin.ng</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Column 4 - Newsletter */}
            <div>
              <h4 className="text-xl font-bold mb-6">Newsletter</h4>
              <p className="text-white/70 text-sm mb-6 leading-relaxed">
                Subscribe our newsletter to get our latest update & news
              </p>
              <div className="space-y-3">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your E-mail"
                  className="h-auto border-white/20 bg-white/10 px-4 py-3 text-base text-white placeholder:text-white/40 focus-visible:border-white/40 focus-visible:bg-white/15 focus-visible:ring-white/20"
                />
                <Button
                  onClick={handleSubscribe}
                  className="h-auto w-full bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
                >
                  SUBSCRIBE
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Footer Bar */}
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/60">
            <p>© 2026 Cleanin Cleaning Services. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white transition-colors">
                Setting & Privacy
              </a>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">
                FAQ
              </a>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
