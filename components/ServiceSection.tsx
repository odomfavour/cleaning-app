"use client";
import Link from "next/link";
import { Brush, Building2, HardHat, Home, PackageOpen, Sparkles, Store } from "lucide-react";

const services = [
  { icon: Home, title: "Residential Cleaning", desc: "Regular upkeep for houses and apartments: floors, kitchens, bathrooms and every surface in between." },
  { icon: Sparkles, title: "Deep Cleaning", desc: "A thorough top-to-bottom clean that tackles grease, grout, limescale and the corners that get missed." },
  { icon: Building2, title: "Office Cleaning", desc: "Spotless workspaces, meeting rooms and restrooms, scheduled around your working hours." },
  { icon: PackageOpen, title: "Move-in / Move-out", desc: "Hand a property back in perfect condition, or start fresh in a new one before you unpack." },
  { icon: HardHat, title: "Post-Construction", desc: "Dust, paint and cement residue removed so your new or renovated space is ready to use." },
  { icon: Store, title: "Commercial Cleaning", desc: "Restaurants, shops, clinics and event venues, cleaned to the standard your customers expect." },
];
void Brush;

interface BubbleProps {
  size: string;
  left: string;
  top: string;
  delay: string;
  duration: string;
}

const Bubble = ({ size, left, delay, duration, top }: BubbleProps) => (
  <div
    className="absolute rounded-full bubble-float"
    style={{
      width: size,
      height: size,
      left,
      top,
      animationDelay: delay,
      animationDuration: duration,
      background: `radial-gradient(circle at 35% 35%, 
        rgba(255, 255, 255, 0.25) 0%, 
        rgba(200, 220, 240, 0.15) 30%, 
        rgba(150, 180, 210, 0.08) 60%,
        transparent 100%)`,
      boxShadow: `
        inset -2px -2px 6px rgba(255, 255, 255, 0.3),
        inset 2px 2px 6px rgba(0, 0, 0, 0.05),
        0 0 15px rgba(255, 255, 255, 0.1)
      `,
      border: "1px solid rgba(255, 255, 255, 0.2)",
    }}
  >
    {/* Inner shine effect */}
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

export default function ServiceSection() {
  return (
    <>
      {/* Bubble Animation */}
      <style jsx>{`
        @keyframes bubbleFloat {
          0% {
            transform: translateY(0) translateX(0) scale(0.8);
            opacity: 0;
          }
          10% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.1;
          }
          100% {
            transform: translateY(-120vh) translateX(15px) scale(1);
            opacity: 0;
          }
        }

        .bubble-float {
          animation-name: bubbleFloat;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
      `}</style>

      <section id="services" className="relative bg-primary py-28 overflow-hidden scroll-mt-16">
        {/* Floating Bubbles - Subtle and smaller */}
        <Bubble size="60px" left="3%" top="8%" delay="0s" duration="20s" />
        <Bubble size="45px" left="24%" top="15%" delay="3s" duration="22s" />
        <Bubble size="50px" left="75%" top="12%" delay="2s" duration="21s" />
        <Bubble size="65px" left="92%" top="6%" delay="1s" duration="23s" />
        <Bubble size="40px" left="5%" top="75%" delay="5s" duration="19s" />
        <Bubble size="70px" left="88%" top="80%" delay="4s" duration="24s" />
        <Bubble size="48px" left="95%" top="88%" delay="6s" duration="20s" />

        {/* Section Heading */}
        <div className="text-center text-white mb-20">
          <p className="text-blue-200 tracking-widest mb-3 flex items-center justify-center gap-2 text-sm uppercase font-semibold">
            What we do
          </p>

          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Cleaning Services For <br /> Every Kind Of Space
          </h2>
        </div>

        {/* Services */}
        <div className="container mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-24 pt-12 px-6 max-w-7xl">
          {services.map((svc) => (
            <div key={svc.title} className="group bg-white rounded-2xl shadow-xl p-8 pt-0 text-center relative transition-transform duration-300 hover:-translate-y-1">
              <div className="w-28 h-28 mx-auto -mt-14 rounded-full border-[6px] border-primary flex items-center justify-center bg-white shadow-lg">
                <svc.icon className="w-12 h-12 text-blue-600" strokeWidth={1.75} />
              </div>
              <h3 className="text-2xl font-bold mt-6 mb-3 text-primary">{svc.title}</h3>
              <p className="text-gray-600 leading-relaxed mb-6">{svc.desc}</p>
              <Link href="/request-cleaning" className="text-primary font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all">
                Request this service <span className="text-lg">+</span>
              </Link>
            </div>
          ))}
        </div>

        </section>
    </>
  );
}
