import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "How do I request a cleaning?", a: "Create a free account, choose your type of space and the services you need, add details and photos, then pick a preferred date. It takes about five minutes." },
  { q: "Do I need to know the exact price before requesting?", a: "No. Requesting is free and you don't pay anything up front. We review your request and send an itemised quotation for you to approve." },
  { q: "How is the quotation determined?", a: "We look at the size and condition of the space, the services you selected, the time and team needed, and travel. For larger spaces we may inspect in person first." },
  { q: "Can I upload photos of the space?", a: "Yes, and we encourage it. Photos help us quote accurately and prepare the right equipment." },
  { q: "Can I request a specific date?", a: "Yes. Choose a preferred date and time, plus an alternative if you like. We confirm the final schedule once your quote is accepted." },
  { q: "How do I pay?", a: "After you accept a quotation you can pay securely online by card or bank transfer. You'll receive confirmation straight away." },
  { q: "What happens after I accept a quotation?", a: "Once payment is received your booking is confirmed. We assign a team, tell you who is coming, and you can follow the job from your dashboard." },
];

export default function FaqSection() {
  return (
    <section id="faq" className="bg-white py-24 px-6 scroll-mt-16">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-blue-600 font-semibold mb-3 text-sm uppercase tracking-wide">FAQ</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-primary leading-tight">Common Questions</h2>
        </div>
        <Accordion type="single" collapsible defaultValue="faq-0" className="border-y">
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`faq-${i}`}>
              <AccordionTrigger className="py-5 text-lg font-semibold text-primary hover:text-blue-700 hover:no-underline">{f.q}</AccordionTrigger>
              <AccordionContent className="pb-5 pr-9 text-base leading-relaxed text-gray-600">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
