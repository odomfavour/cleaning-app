import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ClipboardList, CreditCard, FileText, Search, Sparkles } from "lucide-react";

const steps = [
  { icon: ClipboardList, title: "Request a Cleaning", description: "Tell us about your space, the services you need and when you'd like us. It takes about five minutes and costs nothing." },
  { icon: Search, title: "We Review Your Request", description: "Our team goes through your details and photos. For larger spaces we may visit to inspect before quoting." },
  { icon: FileText, title: "Receive Your Quote", description: "You get an itemised quotation that shows exactly what is included and what it costs." },
  { icon: CreditCard, title: "Approve & Pay", description: "Happy with the quote? Accept it and pay securely online to confirm your booking. Not for you? Decline at no cost." },
  { icon: Sparkles, title: "We Clean Your Space", description: "A trained team arrives on the agreed day with the right equipment. Track progress and leave a review afterwards." },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-24 px-6 bg-gray-50 overflow-hidden scroll-mt-16">
      <div className="absolute left-0 top-0 opacity-5 text-[300px] font-bold text-gray-400 leading-none pointer-events-none" aria-hidden>
        <span className="block -mt-20">A+</span>
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-20">
          <p className="text-blue-600 font-semibold mb-3 flex items-center justify-center gap-2 text-sm uppercase tracking-wide">How it works</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-primary leading-tight">From Request To A Clean Space</h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">No payment when you request. You only pay after you have seen and accepted your quotation.</p>
        </div>

        <ol className="grid sm:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-14 relative">
          {steps.map((step, index) => (
            <li key={step.title} className="relative text-center">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-14 left-[calc(50%+68px)] w-[calc(100%+32px-136px)] border-t-2 border-dotted border-gray-300 z-0" aria-hidden />
              )}
              <div className="relative z-10">
                <div className="relative inline-block mb-7">
                  <div className="w-28 h-28 rounded-full border-2 border-dashed border-blue-300 bg-white flex items-center justify-center relative shadow-lg">
                    <step.icon className="w-11 h-11 text-blue-600" strokeWidth={1.75} />
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-blue-700 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="absolute -top-3 -left-3 w-6 h-6 bg-blue-100 rounded-full border-2 border-blue-300" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm max-w-xs mx-auto">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="text-center mt-16">
          <Button asChild className="h-auto px-8 py-4 shadow-lg hover:bg-blue-800"><Link href="/request-cleaning">Request a Cleaning</Link></Button>
        </div>
      </div>
    </section>
  );
}
