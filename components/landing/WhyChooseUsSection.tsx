import { Card } from "@/components/kit/Card";
import { Brush, Clock, Eye, HeartHandshake, Settings2, UserCheck } from "lucide-react";

const points = [
  { icon: UserCheck, title: "Experienced cleaning professionals", text: "Our teams are trained for each type of space and supervised by a team lead." },
  { icon: Settings2, title: "Tailored cleaning solutions", text: "No fixed packages. We scope each job to your space and quote it accordingly." },
  { icon: Clock, title: "Reliable scheduling", text: "We confirm your date, tell you who is coming, and let you know when the team is on the way." },
  { icon: Eye, title: "Careful attention to detail", text: "Grout, skirting boards, window tracks. We clean the places that usually get skipped." },
  { icon: Brush, title: "Professional equipment", text: "Commercial-grade machines and the right products for each surface and material." },
  { icon: HeartHandshake, title: "Customer-focused service", text: "Questions or concerns? A real person responds, before, during and after the job." },
];

export default function WhyChooseUsSection() {
  return (
    <section className="bg-white py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-blue-600 font-semibold mb-3 text-sm uppercase tracking-wide">Why choose us</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-primary leading-tight">Cleaning You Can Count On</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {points.map((p) => (
            <Card key={p.title} className="rounded-2xl bg-gray-50 p-8 transition-colors hover:border-blue-300 hover:bg-white">
              <p.icon className="h-9 w-9 text-blue-600" strokeWidth={1.75} />
              <h3 className="mt-5 text-xl font-bold text-primary">{p.title}</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">{p.text}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
