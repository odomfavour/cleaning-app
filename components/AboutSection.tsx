import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";
import { Sparkles, Briefcase, Home } from "lucide-react";

const AboutSection = () => {
  return (
    <div id="about" className="scroll-mt-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="py-8 px-2 flex flex-col justify-center">
            <div className="grid grid-cols-2 gap-4 mb-4 h-[600px]">
              <section className="flex flex-col gap-4">
                <div className="flex-1 relative min-h-0">
                  <Image
                    src="/images/slider-v1-img2.jpg"
                    alt="About Us 1"
                    fill
                    className="rounded-lg shadow-lg object-cover object-center"
                  />
                </div>
                <div className="flex-1 relative min-h-0">
                  <Image
                    src="/images/indoor-cleaning.jpg"
                    alt="About Us 2"
                    fill
                    className="rounded-lg shadow-lg object-cover"
                  />
                </div>
              </section>
              <section className="relative">
                <Image
                  src="/images/outdoor-cleaning.jpg"
                  alt="About Us 3"
                  fill
                  className="rounded-lg shadow-lg object-cover object-center"
                />
              </section>
            </div>
          </div>
          <div className="p-8 flex flex-col justify-center">
            <h4 className="font-bold mb-4 uppercase text-primary ">
              <span className="mr-2">
                <Sparkles className="inline w-5 h-5 text-primary " />
              </span>
              About Cleanin
            </h4>
            <h2 className="text-4xl capitalize font-bold mb-4">
              Professional Cleaning, Handled From Start To Finish
            </h2>
            <p className="mb-4">
              Cleanin is a professional cleaning company serving homes, offices and commercial spaces. Our trained teams bring their own equipment and take care of every detail.
            </p>
            <p>
              Every job begins with a clear quotation tailored to your space, so you know exactly what to expect before you commit.
            </p>

            <div className="space-y-4 mt-8">
              <div className="flex gap-4 items-start">
                <div className="shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Commercial Cleaning
                  </h3>
                  <p className="mt-2 text-gray-600">
                    We offer comprehensive commercial cleaning services to keep
                    your workspace pristine and professional.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary">
                    <Home className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Residential Cleaning
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Professional home cleaning services that make your living
                    space comfortable and spotless every time.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Post-Construction Cleaning
                  </h3>
                  <p className="mt-2 text-gray-600">
                    We clear dust, debris and residue after building or renovation work so your space is ready to use.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <Button asChild className="mt-8 h-auto w-max px-8 py-3 shadow-lg hover:scale-105 hover:shadow-xl"><a href="#how-it-works">
                See How It Works
              </a></Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
