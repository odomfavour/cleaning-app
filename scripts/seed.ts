import { loadEnvConfig } from "@next/env";
import mongoose from "mongoose";

loadEnvConfig(process.cwd());

async function seed() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not defined");
  }

  await mongoose.connect(uri);

  console.log("Connected to MongoDB.");

  const services = [
    {
      code: "REGULAR",
      name: "Regular Cleaning",
      slug: "regular-cleaning",
      description:
        "Recurring upkeep for homes and apartments: floors, surfaces, kitchens and bathrooms.",
      guidance: "Quoted based on property size and cleaning requirements.",
      duration: "2–4 hours",
      active: true,
      sortOrder: 1,
    },
    {
      code: "DEEP",
      name: "Deep Cleaning",
      slug: "deep-cleaning",
      description:
        "Top-to-bottom clean including inside appliances, grout, skirting boards and hard-to-reach areas.",
      guidance: "Quoted based on property size and level of cleaning required.",
      duration: "4–8 hours",
      active: true,
      sortOrder: 2,
    },
    {
      code: "MOVE_IN",
      name: "Move-in Cleaning",
      slug: "move-in-cleaning",
      description:
        "Get a new place ready before you unpack: cupboards, fixtures and floors.",
      guidance: "Quoted based on property size and condition.",
      duration: "4–8 hours",
      active: true,
      sortOrder: 3,
    },
    {
      code: "MOVE_OUT",
      name: "Move-out Cleaning",
      slug: "move-out-cleaning",
      description:
        "End-of-tenancy clean to hand a property back in excellent condition.",
      guidance: "Quoted based on property size and condition.",
      duration: "4–8 hours",
      active: true,
      sortOrder: 4,
    },
    {
      code: "OFFICE",
      name: "Office Cleaning",
      slug: "office-cleaning",
      description:
        "Workspaces, meeting rooms, kitchenettes and restrooms, scheduled around your hours.",
      guidance:
        "Quoted based on workspace size, frequency and cleaning requirements.",
      duration: "2–6 hours",
      active: true,
      sortOrder: 5,
    },
    {
      code: "POST_CONSTRUCTION",
      name: "Post-Construction Cleaning",
      slug: "post-construction-cleaning",
      description:
        "Dust, debris, paint and cement residue removed so the space is ready to use.",
      guidance:
        "Quoted after assessing property size and construction residue.",
      duration: "4–10 hours",
      active: true,
      sortOrder: 6,
    },
    {
      code: "COMMERCIAL",
      name: "Commercial Cleaning",
      slug: "commercial-cleaning",
      description:
        "Restaurants, retail, event venues and other high-traffic commercial spaces.",
      guidance:
        "Quoted based on property type, size, frequency and requirements.",
      duration: "Varies",
      active: true,
      sortOrder: 7,
    },
    {
      code: "SOFA",
      name: "Sofa Cleaning",
      slug: "sofa-cleaning",
      description:
        "Deep extraction cleaning for fabric and leather upholstery.",
      guidance: "Quoted based on sofa size, material and number of seats.",
      duration: "1–3 hours",
      active: true,
      sortOrder: 8,
    },
    {
      code: "CARPET",
      name: "Carpet Cleaning",
      slug: "carpet-cleaning",
      description:
        "Hot-water extraction to lift dirt, stains and odours from carpets and rugs.",
      guidance: "Quoted based on carpet area, material and condition.",
      duration: "1–4 hours",
      active: true,
      sortOrder: 9,
    },
    {
      code: "WINDOW",
      name: "Window Cleaning",
      slug: "window-cleaning",
      description:
        "Interior and exterior glass, frames and sills, including hard-to-reach panes.",
      guidance: "Quoted based on number, size and accessibility of windows.",
      duration: "1–4 hours",
      active: true,
      sortOrder: 10,
    },
    {
      code: "OTHER",
      name: "Other",
      slug: "other",
      description: "Something not listed? Describe it and we will tell you.",
      guidance: "Requires a custom quote based on the requested service.",
      duration: "Varies",
      active: true,
      sortOrder: 11,
    },
  ];

  const collection = mongoose.connection.collection("cleaningservices");

  for (const service of services) {
    await collection.updateOne(
      { code: service.code },
      {
        $set: service,
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );
  }

  await mongoose.connection
    .collection("counters")
    .updateOne(
      { key: "request" },
      { $setOnInsert: { sequence: 1000, createdAt: new Date() } },
      { upsert: true },
    );

  await mongoose.connection
    .collection("counters")
    .updateOne(
      { key: "quote" },
      { $setOnInsert: { sequence: 1000, createdAt: new Date() } },
      { upsert: true },
    );

  await mongoose.connection
    .collection("counters")
    .updateOne(
      { key: "booking" },
      { $setOnInsert: { sequence: 1000, createdAt: new Date() } },
      { upsert: true },
    );

  console.log("Seed completed successfully.");
  console.log(`Seeded ${services.length} cleaning services.`);
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
