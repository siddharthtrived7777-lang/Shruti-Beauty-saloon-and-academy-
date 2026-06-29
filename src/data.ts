import { Service } from "./types";

export const CATEGORIES = [
  "All",
  "Threading",
  "Waxing",
  "Facial",
  "Hair",
  "Nails",
  "Makeup",
  "Academy"
];

export const SERVICES: Service[] = [
  // Threading
  { id: "threading-eyebrow", name: "Eyebrow", price: 30, category: "Threading" },
  { id: "threading-upperlip", name: "Upper Lip", price: 20, category: "Threading" },
  { id: "threading-fullface", name: "Full Face", price: 100, category: "Threading" },

  // Waxing
  { id: "waxing-underarms", name: "Underarms", price: 150, category: "Waxing" },
  { id: "waxing-halfarms", name: "Half Arms", price: 150, category: "Waxing" },
  { id: "waxing-fullarms", name: "Full Arms", price: 250, category: "Waxing" },
  { id: "waxing-halflegs", name: "Half Legs", price: 200, category: "Waxing" },
  { id: "waxing-fulllegs", name: "Full Legs", price: 350, category: "Waxing" },
  { id: "waxing-fullbody", name: "Full Body", price: 1200, category: "Waxing" },

  // Facial
  { id: "facial-cleanup", name: "Cleanup", price: 300, category: "Facial" },
  { id: "facial-bleach", name: "Bleach", price: 250, category: "Facial" },
  { id: "facial-dtan", name: "D-Tan", price: 400, category: "Facial" },
  { id: "facial-fruit", name: "Fruit Facial", price: 800, category: "Facial" },
  { id: "facial-gold", name: "Gold Facial", price: 1200, category: "Facial" },
  { id: "facial-carbon", name: "Carbon Facial", price: 1800, category: "Facial" },
  { id: "facial-hydra", name: "HydraFacial", price: 2500, category: "Facial" },

  // Hair
  { id: "hair-haircut", name: "Haircut", price: 200, category: "Hair" },
  { id: "hair-spa", name: "Hair Spa", price: 500, category: "Hair" },
  { id: "hair-color", name: "Hair Color", price: 800, category: "Hair" },
  { id: "hair-highlights", name: "Highlights", price: 1500, category: "Hair" },
  { id: "hair-keratin", name: "Keratin", price: 3000, category: "Hair" },
  { id: "hair-smoothening", name: "Smoothening", price: 4000, category: "Hair" },

  // Nails
  { id: "nails-manicure", name: "Manicure", price: 300, category: "Nails" },
  { id: "nails-pedicure", name: "Pedicure", price: 400, category: "Nails" },
  { id: "nails-gel", name: "Gel Nails", price: 800, category: "Nails" },

  // Makeup
  { id: "makeup-party", name: "Party Makeup", price: 2000, category: "Makeup" },
  { id: "makeup-engagement", name: "Engagement", price: 5000, category: "Makeup" },
  { id: "makeup-bridal", name: "Bridal Makeup", price: 8000, category: "Makeup" },

  // Academy
  { id: "academy-basic-makeup", name: "Basic Makeup Course", price: 5000, category: "Academy" },
  { id: "academy-advance-makeup", name: "Advance Makeup Course", price: 12000, category: "Academy" },
  { id: "academy-hair", name: "Hair Course", price: 8000, category: "Academy" },
  { id: "academy-nail-art", name: "Nail Art Course", price: 4000, category: "Academy" },
  { id: "academy-skin-care", name: "Skin Care Course", price: 6000, category: "Academy" }
];
