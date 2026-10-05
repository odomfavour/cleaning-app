import type {
  Booking, CleaningRequest, Customer, Inspection, Notification, Payment, Quote, Review, Service, Staff,
} from "@/lib/types";

export const TODAY = "2026-09-30";
export const CURRENT_CUSTOMER_ID = "c-1";
export const CURRENT_STAFF_ID = "s-1";

const IMG = ["/images/indoor-cleaning.jpg", "/images/outdoor-cleaning.jpg", "/images/slider-v1-img1.jpg", "/images/slider-v1-img2.jpg"];

export const TERMS = `Prices are based on the information and photos supplied and apply to the scope listed above.
Any additional work requested on the day will be quoted separately before it starts.
Payment in full is required to confirm your booking.
Rescheduling is free up to 48 hours before the job. Cancellations within 48 hours may attract a 20% fee.
Please make sure cleaners can access the property, water and electricity at the agreed time.`;

export const customers: Customer[] = [
  { id: "c-1", name: "Chiamaka Obi", email: "chiamaka.obi@gmail.com", phone: "+234 803 412 7780", role: "customer", hasAccount: true, status: "active", joinedAt: "2026-03-14",
    addresses: [
      { id: "a-1", label: "Home", address: "12 Peter Odili Road, Trans-Amadi", city: "Port Harcourt", area: "Trans-Amadi" },
      { id: "a-2", label: "Shop", address: "Suite 4, Garrison Plaza, Old GRA", city: "Port Harcourt", area: "Old GRA" },
    ] },
  { id: "c-2", name: "Tunde Adeyemi", email: "tunde@adeyemi-legal.com", phone: "+234 806 219 4431", role: "customer", hasAccount: true, status: "active", joinedAt: "2026-01-22", addresses: [] },
  { id: "c-3", name: "Ngozi Eze", email: "ngozi.eze@yahoo.com", phone: "+234 805 120 9962", role: "customer", hasAccount: true, status: "active", joinedAt: "2026-05-02", addresses: [] },
  { id: "c-4", name: "Emeka Okafor", email: "emeka@lagoonkitchen.ng", phone: "+234 809 771 3308", role: "customer", hasAccount: true, status: "active", joinedAt: "2026-06-19", addresses: [] },
  { id: "c-5", name: "Ifeoma Nwosu", email: "ifeoma@brightpath.org", phone: "+234 802 668 0145", role: "customer", hasAccount: true, status: "active", joinedAt: "2026-02-08", addresses: [] },
  { id: "c-7", name: "Amaka Okeke", email: "amaka.okeke@gmail.com", phone: "+234 807 555 1188", role: "customer", hasAccount: false, status: "active", joinedAt: "2026-09-29", addresses: [] },
  { id: "c-6", name: "Blessing Amadi", email: "blessing.amadi@outlook.com", phone: "+234 814 302 5567", role: "customer", hasAccount: true, status: "inactive", joinedAt: "2025-11-30", addresses: [] },
];

export const staff: Staff[] = [
  { id: "s-1", name: "Blessing Wali", phone: "+234 803 900 1122", email: "blessing.w@cleanin.ng", role: "Team Lead", availability: "on_job", status: "active", activeJobs: 2, completedJobs: 146, rating: 4.9 },
  { id: "s-2", name: "Samuel Ikpe", phone: "+234 806 455 2190", email: "samuel.i@cleanin.ng", role: "Cleaner", availability: "on_job", status: "active", activeJobs: 1, completedJobs: 98, rating: 4.8 },
  { id: "s-3", name: "Favour Nnadi", phone: "+234 809 318 7745", email: "favour.n@cleanin.ng", role: "Cleaner", availability: "available", status: "active", activeJobs: 1, completedJobs: 87, rating: 4.7 },
  { id: "s-4", name: "Joy Akpan", phone: "+234 802 844 0913", email: "joy.a@cleanin.ng", role: "Cleaner", availability: "on_job", status: "active", activeJobs: 1, completedJobs: 112, rating: 4.9 },
  { id: "s-5", name: "Daniel Okoro", phone: "+234 805 736 6021", email: "daniel.o@cleanin.ng", role: "Cleaner", availability: "available", status: "active", activeJobs: 0, completedJobs: 64, rating: 4.6 },
  { id: "s-6", name: "Peter Amadi", phone: "+234 807 212 8854", email: "peter.a@cleanin.ng", role: "Inspector", availability: "available", status: "active", activeJobs: 0, completedJobs: 203, rating: 4.8 },
  { id: "s-7", name: "Kelechi Dike", phone: "+234 813 490 3376", email: "kelechi.d@cleanin.ng", role: "Driver", availability: "off_duty", status: "inactive", activeJobs: 0, completedJobs: 41, rating: 4.4 },
];

export const services: Service[] = [
  { id: "regular", name: "Regular Cleaning", description: "Recurring upkeep for homes and apartments: floors, surfaces, kitchens and bathrooms.", guidance: "Usually quoted by number of rooms", duration: "2–4 hrs", active: true },
  { id: "deep", name: "Deep Cleaning", description: "Top-to-bottom clean including inside appliances, grout, skirting boards and hard-to-reach areas.", guidance: "Quoted after reviewing size and condition", duration: "5–8 hrs", active: true },
  { id: "move-in", name: "Move-in Cleaning", description: "Get a new place ready before you unpack: cupboards, fixtures and floors.", guidance: "Quoted by property size", duration: "4–7 hrs", active: true },
  { id: "move-out", name: "Move-out Cleaning", description: "End-of-tenancy clean to hand a property back in excellent condition.", guidance: "Quoted by property size", duration: "4–7 hrs", active: true },
  { id: "office", name: "Office Cleaning", description: "Workspaces, meeting rooms, kitchenettes and restrooms, scheduled around your hours.", guidance: "Quoted by floor area and frequency", duration: "3–6 hrs", active: true },
  { id: "post-construction", name: "Post-Construction Cleaning", description: "Dust, debris, paint and cement residue removed so the space is ready to use.", guidance: "Site inspection usually required", duration: "1–3 days", active: true },
  { id: "commercial", name: "Commercial Cleaning", description: "Restaurants, retail, event venues and other high-traffic commercial spaces.", guidance: "Site inspection recommended", duration: "4–10 hrs", active: true },
  { id: "sofa", name: "Sofa Cleaning", description: "Deep extraction cleaning for fabric and leather upholstery.", guidance: "Quoted per seat or set", duration: "1–2 hrs", active: true },
  { id: "carpet", name: "Carpet Cleaning", description: "Hot-water extraction to lift dirt, stains and odours from carpets and rugs.", guidance: "Quoted by area", duration: "2–4 hrs", active: true },
  { id: "window", name: "Window Cleaning", description: "Interior and exterior glass, frames and sills, including hard-to-reach panes.", guidance: "Quoted by number of windows", duration: "1–3 hrs", active: true },
  { id: "other", name: "Other", description: "Something not listed? Describe it and we will tell you if we can help.", guidance: "Always quoted individually", duration: "Varies", active: true },
];

const loc = (address: string, area: string, landmark = "", directions = "") => ({ address, city: "Port Harcourt", area, landmark, directions });

const requestsBase: Omit<CleaningRequest, "contact">[] = [
  { id: "REQ-1029", customerId: "c-7", environment: "apartment", services: ["Deep Cleaning", "Carpet Cleaning"], property: { bedrooms: 2, bathrooms: 2, livingRooms: 1, floors: 1, kitchen: 1, size: "50–100 sqm" },
    description: "Two-bedroom flat before we move in. Carpets in both bedrooms need treatment.", specialRequirements: "", attentionAreas: "Bedroom carpets", photos: [IMG[0]],
    location: loc("Flat 6, Peace Court, Woji Road", "Woji", "Near Woji Police Station"), preferred: { date: "2026-10-16", time: "09:00" }, status: "quote_sent", submittedAt: "2026-09-29", quoteId: "QT-1025" },
  { id: "REQ-1030", customerId: "c-7", environment: "office", services: ["Office Cleaning"], property: { rooms: 3, floors: 1, size: "60 sqm", bathrooms: 1 },
    description: "Small consulting office, weekly clean starting next month.", specialRequirements: "", attentionAreas: "", photos: [],
    location: loc("Suite 2, Aba Road Plaza", "Aba Road"), preferred: { date: "2026-10-22", time: "17:00", flexible: true }, status: "under_review", submittedAt: "2026-09-30" },
  { id: "REQ-1027", customerId: "c-1", environment: "commercial", services: ["Office Cleaning"], property: { rooms: 3, floors: 1, size: "45 sqm", bathrooms: 1 },
    description: "Small boutique that needs a full clean before our weekend restock.", specialRequirements: "Glass display cabinets", attentionAreas: "Fitting rooms", photos: [IMG[0]],
    location: loc("Suite 4, Garrison Plaza, Old GRA", "Old GRA", "Opposite Mr Biggs"), preferred: { date: "2026-10-09", time: "08:00" }, status: "new", submittedAt: "2026-09-30" },
  { id: "REQ-1024", customerId: "c-1", environment: "apartment", services: ["Deep Cleaning", "Sofa Cleaning", "Window Cleaning"], property: { bedrooms: 3, bathrooms: 3, livingRooms: 1, floors: 1, kitchen: true, size: "140 sqm" },
    description: "Three-bedroom flat that has not been deep cleaned in over a year. Kitchen grease is the main concern.", specialRequirements: "Fragrance-free products (child with allergies)", attentionAreas: "Kitchen hob and extractor, master bathroom grout", photos: [IMG[0], IMG[2]],
    location: loc("12 Peter Odili Road, Trans-Amadi", "Trans-Amadi", "Beside Total filling station", "Gate is blue; call on arrival."), preferred: { date: "2026-10-12", time: "09:00", altDate: "2026-10-13", altTime: "09:00" },
    status: "quote_sent", submittedAt: "2026-09-26", quoteId: "QT-1024", inspectionId: "INS-198" },
  { id: "REQ-1020", customerId: "c-1", environment: "house", services: ["Carpet Cleaning"], property: { bedrooms: 4, bathrooms: 4, livingRooms: 2, floors: 2, kitchen: true, size: "260 sqm" },
    description: "Two large living room rugs and stair carpet.", specialRequirements: "", attentionAreas: "Wine stain on cream rug", photos: [IMG[1]],
    location: loc("12 Peter Odili Road, Trans-Amadi", "Trans-Amadi"), preferred: { date: "2026-10-15", time: "10:00" }, status: "under_review", submittedAt: "2026-09-28" },
  { id: "REQ-1019", customerId: "c-1", environment: "house", services: ["Regular Cleaning"], property: { bedrooms: 4, bathrooms: 4, livingRooms: 2, floors: 2, kitchen: true, size: "260 sqm" },
    description: "Fortnightly upkeep clean before visitors arrive.", specialRequirements: "", attentionAreas: "Stairs and balcony", photos: [IMG[2]],
    location: loc("12 Peter Odili Road, Trans-Amadi", "Trans-Amadi", "Beside Total filling station"), preferred: { date: "2026-10-03", time: "09:00" },
    status: "accepted", submittedAt: "2026-09-21", quoteId: "QT-1019", bookingId: "BK-3001" },
  { id: "REQ-1011", customerId: "c-1", environment: "apartment", services: ["Move-out Cleaning"], property: { bedrooms: 2, bathrooms: 2, livingRooms: 1, floors: 1, kitchen: true, size: "95 sqm" },
    description: "End of tenancy clean, landlord inspection on Friday.", specialRequirements: "Must be done before 4 pm", attentionAreas: "Oven and fridge", photos: [IMG[0]],
    location: loc("7 Tombia Extension, GRA Phase 2", "GRA Phase 2"), preferred: { date: "2026-09-18", time: "08:00" },
    status: "completed", submittedAt: "2026-09-10", quoteId: "QT-1011", bookingId: "BK-2988" },
  { id: "REQ-1005", customerId: "c-1", environment: "house", services: ["Deep Cleaning", "Window Cleaning"], property: { bedrooms: 4, bathrooms: 4, livingRooms: 2, floors: 2, kitchen: true, size: "260 sqm" },
    description: "Annual deep clean.", specialRequirements: "", attentionAreas: "", photos: [],
    location: loc("12 Peter Odili Road, Trans-Amadi", "Trans-Amadi"), preferred: { date: "2026-09-02", time: "09:00" },
    status: "completed", submittedAt: "2026-08-24", quoteId: "QT-1005", bookingId: "BK-2971" },
  { id: "REQ-0998", customerId: "c-1", environment: "house", services: ["Carpet Cleaning"], property: { bedrooms: 4, bathrooms: 4, livingRooms: 2, floors: 2, kitchen: true, size: "260 sqm" },
    description: "Lounge carpet refresh.", specialRequirements: "", attentionAreas: "", photos: [],
    location: loc("12 Peter Odili Road, Trans-Amadi", "Trans-Amadi"), preferred: { date: "2026-08-14", time: "10:00" }, status: "cancelled", submittedAt: "2026-08-06" },

  { id: "REQ-1026", customerId: "c-4", environment: "restaurant", services: ["Commercial Cleaning", "Deep Cleaning"], property: { rooms: 4, floors: 1, size: "180 sqm", bathrooms: 3, additional: "Commercial kitchen, cold room, outdoor seating" },
    description: "Full clean of kitchen and dining area after weekend service. Needs to be done overnight.", specialRequirements: "Food-safe products only", attentionAreas: "Extraction hoods, floor drains", photos: [IMG[1], IMG[3]],
    location: loc("Plot 21, Peter Odili Road", "Trans-Amadi", "Lagoon Kitchen"), preferred: { date: "2026-10-06", time: "22:00" }, status: "new", submittedAt: "2026-09-30" },
  { id: "REQ-1025", customerId: "c-5", environment: "construction", services: ["Post-Construction Cleaning"], property: { rooms: 12, floors: 3, size: "620 sqm", bathrooms: 6, additional: "Staircase, rooftop terrace" },
    description: "New office block, final handover in two weeks. Paint and cement residue throughout.", specialRequirements: "Site induction required", attentionAreas: "Glass partitions, tiled floors", photos: [IMG[3]],
    location: loc("Plot 7, Rumuola Road", "Rumuola", "BrightPath Academy annex"), preferred: { date: "2026-10-14", time: "08:00" }, status: "inspection_required", submittedAt: "2026-09-27", inspectionId: "INS-201" },
  { id: "REQ-1023", customerId: "c-3", environment: "event_venue", services: ["Commercial Cleaning"], property: { rooms: 2, floors: 1, size: "400 sqm", bathrooms: 4, additional: "Stage area, outdoor courtyard" },
    description: "Hall needs cleaning the morning after a wedding reception.", specialRequirements: "", attentionAreas: "Dance floor, courtyard", photos: [IMG[0]],
    location: loc("Golden Tulip Annex, Aba Road", "Aba Road"), preferred: { date: "2026-10-11", time: "07:00" }, status: "under_review", submittedAt: "2026-09-27" },
  { id: "REQ-1021", customerId: "c-5", environment: "office", services: ["Office Cleaning"], property: { rooms: 8, floors: 2, size: "310 sqm", bathrooms: 4 },
    description: "Weekly cleaning contract trial.", specialRequirements: "Out-of-hours only", attentionAreas: "Reception and boardroom", photos: [IMG[2]],
    location: loc("Plot 7, Rumuola Road", "Rumuola"), preferred: { date: "2026-10-05", time: "18:00" }, status: "inspection_required", submittedAt: "2026-09-25", inspectionId: "INS-200" },
  { id: "REQ-1018", customerId: "c-2", environment: "office", services: ["Office Cleaning"], property: { rooms: 6, floors: 1, size: "150 sqm", bathrooms: 2 },
    description: "Law office, deep clean ahead of client event.", specialRequirements: "Do not move case files", attentionAreas: "Library", photos: [],
    location: loc("3rd Floor, Hospital Road Plaza", "Old GRA"), preferred: { date: "2026-09-30", time: "14:00" }, status: "accepted", submittedAt: "2026-09-22", quoteId: "QT-1018", bookingId: "BK-3002" },
  { id: "REQ-1016", customerId: "c-4", environment: "restaurant", services: ["Deep Cleaning"], property: { rooms: 4, floors: 1, size: "180 sqm", bathrooms: 3 },
    description: "Monthly deep clean.", specialRequirements: "", attentionAreas: "", photos: [],
    location: loc("Plot 21, Peter Odili Road", "Trans-Amadi"), preferred: { date: "2026-09-30", time: "09:00" }, status: "accepted", submittedAt: "2026-09-20", quoteId: "QT-1016", bookingId: "BK-3006" },
  { id: "REQ-1015", customerId: "c-6", environment: "other", services: ["Other"], property: {}, description: "Boat hull cleaning.", specialRequirements: "", attentionAreas: "", photos: [],
    location: loc("Bonny Island Jetty", "Bonny"), preferred: { date: "2026-09-29", time: "09:00" }, status: "rejected", submittedAt: "2026-09-19", adminNote: "Outside our service scope and area." },
  { id: "REQ-1013", customerId: "c-3", environment: "apartment", services: ["Deep Cleaning"], property: { bedrooms: 2, bathrooms: 2, livingRooms: 1, floors: 1, kitchen: true, size: "88 sqm" },
    description: "Pre-holiday clean.", specialRequirements: "", attentionAreas: "", photos: [],
    location: loc("Flat 3B, Rumuibekwe Estate", "Rumuibekwe"), preferred: { date: "2026-10-18", time: "09:00" }, status: "accepted", submittedAt: "2026-09-18", quoteId: "QT-1013", bookingId: "BK-3003" },
  { id: "REQ-1012", customerId: "c-4", environment: "restaurant", services: ["Commercial Cleaning"], property: {}, description: "Weekly clean.", specialRequirements: "", attentionAreas: "", photos: [],
    location: loc("Plot 21, Peter Odili Road", "Trans-Amadi"), preferred: { date: "2026-10-06", time: "22:00" }, status: "accepted", submittedAt: "2026-09-15", quoteId: "QT-1012", bookingId: "BK-3004" },
];

export const requests: CleaningRequest[] = requestsBase.map((r) => {
  const c = customers.find((x) => x.id === r.customerId)!;
  return { ...r, contact: { name: c.name, email: c.email, phone: c.phone } };
});

const it = (id: string, description: string, amount: number) => ({ id, description, amount });
const q = (id: string, requestId: string, customerId: string, items: Quote["items"], status: Quote["status"], createdAt: string, validUntil: string, discount = 0): Quote =>
  ({ id, requestId, customerId, items, discount, taxRate: 0, status, createdAt, validUntil, terms: TERMS });

export const quotes: Quote[] = [
  q("QT-1025", "REQ-1029", "c-7", [it("i1", "Deep Cleaning: 2-bed apartment", 30000), it("i2", "Carpet Cleaning (2 bedrooms)", 12000), it("i3", "Transportation", 3000)], "sent", "2026-09-30", "2026-10-07"),
  q("QT-1024", "REQ-1024", "c-1", [it("i1", "Deep Cleaning: 3-bed apartment", 40000), it("i2", "Sofa Cleaning (3-seater + 2 armchairs)", 8000), it("i3", "Window Cleaning (interior and exterior)", 5000), it("i4", "Transportation", 3000)], "sent", "2026-09-29", "2026-10-06"),
  q("QT-1019", "REQ-1019", "c-1", [it("i1", "Regular Cleaning: 4-bed duplex", 28000), it("i2", "Transportation", 3000)], "accepted", "2026-09-22", "2026-09-29"),
  q("QT-1011", "REQ-1011", "c-1", [it("i1", "Move-out Cleaning: 2-bed apartment", 32000), it("i2", "Oven and fridge interior", 4000), it("i3", "Transportation", 3000)], "accepted", "2026-09-12", "2026-09-19"),
  q("QT-1005", "REQ-1005", "c-1", [it("i1", "Deep Cleaning: 4-bed duplex", 55000), it("i2", "Window Cleaning", 9000), it("i3", "Transportation", 3000)], "accepted", "2026-08-26", "2026-09-02", 3000),
  q("QT-1018", "REQ-1018", "c-2", [it("i1", "Office Cleaning: 150 sqm", 38000), it("i2", "Library shelves detail clean", 6000), it("i3", "Transportation", 3000)], "accepted", "2026-09-23", "2026-09-30"),
  q("QT-1016", "REQ-1016", "c-4", [it("i1", "Restaurant deep clean: kitchen and dining", 85000), it("i2", "Extraction hood degreasing", 15000)], "accepted", "2026-09-21", "2026-09-28"),
  q("QT-1013", "REQ-1013", "c-3", [it("i1", "Deep Cleaning: 2-bed apartment", 30000), it("i2", "Transportation", 3000)], "accepted", "2026-09-19", "2026-09-26"),
  q("QT-1012", "REQ-1012", "c-4", [it("i1", "Commercial cleaning (weekly)", 60000)], "accepted", "2026-09-16", "2026-09-23"),
];

export const inspections: Inspection[] = [
  { id: "INS-201", requestId: "REQ-1025", inspectorId: "s-6", date: "2026-10-01", time: "10:00", status: "scheduled" },
  { id: "INS-200", requestId: "REQ-1021", inspectorId: "s-6", date: "2026-09-29", time: "16:00", status: "completed",
    report: { condition: "Moderate: regular foot traffic, carpeted boardroom with some staining", size: "310 sqm across two floors", duration: "5 hours, team of 3", additionalServices: "Carpet spot treatment in boardroom", specialRequirements: "Access via security desk after 6 pm", notes: "Restrooms on the second floor are in good condition. Reception glass needs weekly attention.", photos: [IMG[2]] } },
  { id: "INS-198", requestId: "REQ-1024", inspectorId: "s-6", date: "2026-09-28", time: "11:00", status: "completed",
    report: { condition: "Heavy grease build-up in kitchen, light scale in bathrooms", size: "140 sqm, 3 bedrooms", duration: "6 hours, team of 3", additionalServices: "Sofa cleaning, window cleaning", specialRequirements: "Fragrance-free products", notes: "Customer has a child with allergies. Use unscented degreaser.", photos: [IMG[0]] } },
  { id: "INS-190", requestId: "REQ-1005", inspectorId: "s-6", date: "2026-08-25", time: "10:00", status: "cancelled" },
];

const bk = (b: Partial<Booking> & Pick<Booking, "id" | "requestId" | "quoteId" | "customerId" | "title" | "location" | "date" | "time" | "status" | "amount">): Booking =>
  ({ durationHrs: 4, staffIds: [], ...b });

export const bookings: Booking[] = [
  bk({ id: "BK-3001", requestId: "REQ-1019", quoteId: "QT-1019", customerId: "c-1", title: "Regular Cleaning", location: "12 Peter Odili Road, Trans-Amadi", date: "2026-10-03", time: "09:00", status: "staff_assigned", amount: 31000, staffIds: ["s-1", "s-2"], paymentId: "p-1", instructions: "Gate is blue; call on arrival. Pets are friendly." }),
  bk({ id: "BK-3002", requestId: "REQ-1018", quoteId: "QT-1018", customerId: "c-2", title: "Office Cleaning", location: "3rd Floor, Hospital Road Plaza, Old GRA", date: "2026-09-30", time: "14:00", durationHrs: 5, status: "staff_assigned", amount: 47000, staffIds: ["s-1", "s-3"], paymentId: "p-2", instructions: "Do not move case files. Reception will let you in." }),
  bk({ id: "BK-3006", requestId: "REQ-1016", quoteId: "QT-1016", customerId: "c-4", title: "Deep Cleaning", location: "Plot 21, Peter Odili Road, Trans-Amadi", date: "2026-09-30", time: "09:00", durationHrs: 6, status: "in_progress", amount: 100000, staffIds: ["s-2", "s-4", "s-5"], paymentId: "p-3", instructions: "Food-safe products only." }),
  bk({ id: "BK-3003", requestId: "REQ-1013", quoteId: "QT-1013", customerId: "c-3", title: "Deep Cleaning", location: "Flat 3B, Rumuibekwe Estate", date: "2026-10-18", time: "09:00", status: "confirmed", amount: 33000, paymentId: "p-4" }),
  bk({ id: "BK-3004", requestId: "REQ-1012", quoteId: "QT-1012", customerId: "c-4", title: "Commercial Cleaning", location: "Plot 21, Peter Odili Road, Trans-Amadi", date: "2026-10-06", time: "22:00", durationHrs: 5, status: "staff_assigned", amount: 60000, staffIds: ["s-1", "s-4"], paymentId: "p-5" }),
  bk({ id: "BK-2988", requestId: "REQ-1011", quoteId: "QT-1011", customerId: "c-1", title: "Move-out Cleaning", location: "7 Tombia Extension, GRA Phase 2", date: "2026-09-18", time: "08:00", status: "completed", amount: 39000, staffIds: ["s-1", "s-2"], paymentId: "p-6", beforePhotos: [IMG[0]], afterPhotos: [IMG[2]] }),
  bk({ id: "BK-2971", requestId: "REQ-1005", quoteId: "QT-1005", customerId: "c-1", title: "Deep Cleaning", location: "12 Peter Odili Road, Trans-Amadi", date: "2026-09-02", time: "09:00", durationHrs: 7, status: "completed", amount: 64000, staffIds: ["s-1", "s-3", "s-4"], paymentId: "p-7", reviewId: "rv-1", beforePhotos: [IMG[0]], afterPhotos: [IMG[2]] }),
  bk({ id: "BK-2960", requestId: "REQ-1002", quoteId: "QT-1002", customerId: "c-3", title: "Office Cleaning", location: "Aba Road, Port Harcourt", date: "2026-08-28", time: "10:00", status: "completed", amount: 42000, staffIds: ["s-3", "s-5"], paymentId: "p-8", reviewId: "rv-2" }),
  bk({ id: "BK-2944", requestId: "REQ-0990", quoteId: "QT-0990", customerId: "c-5", title: "Post-Construction Cleaning", location: "Plot 7, Rumuola Road", date: "2026-08-19", time: "08:00", durationHrs: 10, status: "completed", amount: 210000, staffIds: ["s-1", "s-2", "s-4", "s-5"], paymentId: "p-9", reviewId: "rv-3" }),
  bk({ id: "BK-2930", requestId: "REQ-0981", quoteId: "QT-0981", customerId: "c-2", title: "Sofa Cleaning", location: "Hospital Road Plaza", date: "2026-08-07", time: "11:00", status: "cancelled", amount: 15000, staffIds: [], paymentId: "p-10" }),
];

const pay = (n: number, customerId: string, quoteId: string, bookingId: string | undefined, amount: number, method: Payment["method"], date: string, status: Payment["status"]): Payment =>
  ({ id: `p-${n}`, reference: `PAY-${48200 + n * 7}`, customerId, quoteId, bookingId, amount, method, date, status });

export const payments: Payment[] = [
  pay(1, "c-1", "QT-1019", "BK-3001", 31000, "card", "2026-09-23", "paid"),
  pay(2, "c-2", "QT-1018", "BK-3002", 47000, "bank_transfer", "2026-09-24", "paid"),
  pay(3, "c-4", "QT-1016", "BK-3006", 100000, "bank_transfer", "2026-09-22", "paid"),
  pay(4, "c-3", "QT-1013", "BK-3003", 33000, "card", "2026-09-20", "paid"),
  pay(5, "c-4", "QT-1012", "BK-3004", 60000, "card", "2026-09-17", "paid"),
  pay(6, "c-1", "QT-1011", "BK-2988", 39000, "card", "2026-09-13", "paid"),
  pay(7, "c-1", "QT-1005", "BK-2971", 64000, "bank_transfer", "2026-08-27", "paid"),
  pay(8, "c-3", "QT-1002", "BK-2960", 42000, "card", "2026-08-22", "paid"),
  pay(9, "c-5", "QT-0990", "BK-2944", 210000, "bank_transfer", "2026-08-12", "paid"),
  pay(10, "c-2", "QT-0981", "BK-2930", 15000, "card", "2026-08-03", "refunded"),
  pay(11, "c-3", "QT-1009", undefined, 27000, "card", "2026-09-14", "failed"),
  pay(12, "c-4", "QT-1017", undefined, 45000, "ussd", "2026-09-29", "pending"),
];

export const reviews: Review[] = [
  { id: "rv-1", bookingId: "BK-2971", customerId: "c-1", service: "Deep Cleaning", rating: 5, comment: "The team arrived on time and worked through the whole house without needing any direction. The kitchen looks new again and they were careful around the furniture.", date: "2026-09-04", photos: [] },
  { id: "rv-2", bookingId: "BK-2960", customerId: "c-3", service: "Office Cleaning", rating: 4, comment: "Good job overall. The restrooms and floors were spotless. One window was missed but they came back the next day to fix it.", date: "2026-08-30", photos: [] },
  { id: "rv-3", bookingId: "BK-2944", customerId: "c-5", service: "Post-Construction Cleaning", rating: 5, comment: "We handed the building over on schedule thanks to this team. Cement dust and paint splatter were gone from every floor and glass partition.", date: "2026-08-21", photos: [] },
];

export const notifications: Notification[] = [
  { id: "n-1", audience: "customer", title: "Your quote is ready", body: "QT-1024 for REQ-1024 is waiting for your response.", time: "2026-09-29T15:20:00", read: false, href: "/dashboard/quotes/QT-1024" },
  { id: "n-2", audience: "customer", title: "Staff assigned", body: "Blessing and Samuel will clean your home on 3 Oct.", time: "2026-09-28T10:05:00", read: false, href: "/dashboard/bookings/BK-3001" },
  { id: "n-3", audience: "customer", title: "How did we do?", body: "Tell us about your move-out clean (BK-2988).", time: "2026-09-19T09:00:00", read: true, href: "/dashboard/bookings/BK-2988/review" },
  { id: "n-9", audience: "admin", title: "New guest request", body: "REQ-1030 from Amaka Okeke (no account).", time: "2026-09-30T09:05:00", read: false, href: "/admin/requests/REQ-1030" },
  { id: "n-4", audience: "admin", title: "New request from Emeka Okafor", body: "REQ-1026: Restaurant, Commercial Cleaning", time: "2026-09-30T08:12:00", read: false, href: "/admin/requests/REQ-1026" },
  { id: "n-5", audience: "admin", title: "Inspection tomorrow", body: "INS-201 at 10:00 am, Rumuola Road.", time: "2026-09-30T07:00:00", read: false, href: "/admin/inspections/INS-201" },
  { id: "n-6", audience: "admin", title: "Payment received", body: "₦33,000 from Ngozi Eze (BK-3003).", time: "2026-09-20T14:40:00", read: true, href: "/admin/payments" },
  { id: "n-7", audience: "staff", title: "New job assigned", body: "Office Cleaning, Old GRA, today at 2:00 pm.", time: "2026-09-29T17:30:00", read: false, href: "/staff/jobs/BK-3002" },
  { id: "n-8", audience: "staff", title: "Schedule updated", body: "BK-3001 moved to 3 Oct, 9:00 am.", time: "2026-09-28T11:00:00", read: true, href: "/staff/jobs/BK-3001" },
];
