import { CalendarClock, FileCheck2, ShieldCheck, ThumbsUp } from "lucide-react";

const items = [
  { icon: ShieldCheck, title: "Trusted professionals", text: "Trained, vetted teams who arrive in uniform with their own equipment." },
  { icon: CalendarClock, title: "Flexible scheduling", text: "Choose the date and time that suits you, including evenings and weekends." },
  { icon: FileCheck2, title: "Transparent quotations", text: "An itemised quote before you pay. No hidden charges." },
  { icon: ThumbsUp, title: "Quality service", text: "We check every job and make it right if something is missed." },
];

export default function TrustSection() {
  return (
    <section aria-label="Why customers trust us" className="bg-white border-b border-gray-200">
      <ul className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8 px-6 py-12">
        {items.map((i) => (
          <li key={i.title} className="flex gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary"><i.icon className="h-6 w-6 text-white" /></span>
            <span><span className="block text-lg font-semibold text-gray-900">{i.title}</span><span className="mt-1 block text-sm leading-relaxed text-gray-600">{i.text}</span></span>
          </li>
        ))}
      </ul>
    </section>
  );
}
