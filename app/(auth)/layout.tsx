import Link from "next/link";
import { CalendarCheck, FileText, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/kit/Misc";

const points = [
  { icon: FileText, title: "Clear quotations", text: "Tell us what needs cleaning and get an itemised quote before you pay anything." },
  { icon: CalendarCheck, title: "Flexible scheduling", text: "Choose the date that suits you. We confirm it once your quote is approved." },
  { icon: ShieldCheck, title: "Vetted professionals", text: "Trained, insured teams who bring their own equipment." },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="relative hidden overflow-hidden bg-primary p-12 text-white lg:flex lg:flex-col">
        <Link href="/" aria-label="Back to home"><Logo light /></Link>
        <div className="my-auto max-w-md">
          <h2 className="text-4xl font-extrabold leading-tight">Professional cleaning, made simple.</h2>
          <ul className="mt-10 space-y-6">
            {points.map((p) => (
              <li key={p.title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10"><p.icon className="h-5 w-5 text-blue-200" /></span>
                <span><span className="block font-semibold">{p.title}</span><span className="text-sm text-blue-100/80">{p.text}</span></span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-blue-200/70">© {new Date().getFullYear()} Cleanin Cleaning Services</p>
        <span aria-hidden className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full border border-white/10" />
        <span aria-hidden className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full border border-white/10" />
      </aside>
      <main className="flex flex-col bg-white px-5 py-8 sm:px-10">
        <Link href="/" className="mb-8 lg:hidden" aria-label="Back to home"><Logo /></Link>
        <div className="m-auto w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
