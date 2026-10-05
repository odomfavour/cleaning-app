import Image from "next/image";
import Link from "next/link";
import { Briefcase, Building2, HardHat, Home, PartyPopper, UtensilsCrossed } from "lucide-react";

const envs = [
  { icon: Home, title: "Home", text: "Houses and apartments", img: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&h=450&fit=crop" },
  { icon: Briefcase, title: "Office", text: "Workspaces and meeting rooms", img: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=600&h=450&fit=crop" },
  { icon: UtensilsCrossed, title: "Restaurant", text: "Kitchens and dining areas", img: "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=600&h=450&fit=crop" },
  { icon: PartyPopper, title: "Event venue", text: "Halls, lounges and courtyards", img: "/images/indoor-cleaning.jpg" },
  { icon: Building2, title: "Commercial space", text: "Shops, clinics and retail", img: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=450&fit=crop" },
  { icon: HardHat, title: "Construction site", text: "Post-build and renovation", img: "/images/outdoor-cleaning.jpg" },
];

export default function EnvironmentsSection() {
  return (
    <section className="bg-gray-50 py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-blue-600 font-semibold mb-3 text-sm uppercase tracking-wide">Where we clean</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-primary leading-tight">One Team, Every Environment</h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">Different spaces need different methods. Tell us where, and we send the right people and equipment.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {envs.map((e) => (
            <Link key={e.title} href="/request-cleaning" className="group relative block aspect-[4/3] overflow-hidden rounded-2xl shadow-lg">
              <Image src={e.img} alt="" fill sizes="(max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 text-white">
                <e.icon className="mb-2 h-6 w-6 text-blue-200" />
                <h3 className="text-lg md:text-2xl font-bold">{e.title}</h3>
                <p className="text-sm text-blue-100/90">{e.text}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
