export type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  qty: string;
  reason: string;
  category: string;
  alternative?: { name: string; brand: string; price: number; saves: number };
};

export type Cart = {
  id: string;
  title: string;
  occasion: string;
  attendees: number;
  budget: number;
  items: Product[];
};

export const samplePrompts = [
  "IPL finals at my place. 10 people. Budget ₹1500.",
  "Weekly groceries for a family of 4, vegetarian.",
  "Planning a camping trip and weekly groceries under ₹3000.",
  "Birthday party for my 8-year-old, 15 kids.",
];

export const occasions = [
  {
    id: "ipl",
    name: "IPL Watch Party",
    emoji: "🏏",
    desc: "Snacks, drinks & sides for match nights",
    items: 12,
  },
  {
    id: "birthday",
    name: "Birthday Party",
    emoji: "🎂",
    desc: "Cake, decor, party essentials",
    items: 18,
  },
  {
    id: "weekly",
    name: "Weekly Grocery",
    emoji: "🛒",
    desc: "Staples, fresh produce, household",
    items: 32,
  },
  {
    id: "hostel",
    name: "Hostel Restock",
    emoji: "🎓",
    desc: "Instant meals, toiletries, basics",
    items: 22,
  },
  {
    id: "travel",
    name: "Travel Essentials",
    emoji: "🧳",
    desc: "Toiletries, snacks, electronics",
    items: 14,
  },
  {
    id: "festival",
    name: "Festival Hosting",
    emoji: "🪔",
    desc: "Sweets, decor, gifts, puja items",
    items: 26,
  },
];

export const iplCart: Cart = {
  id: "ipl-finals-10",
  title: "IPL Finals Watch Party",
  occasion: "ipl_watch_party",
  attendees: 10,
  budget: 1500,
  items: [
    {
      id: "p1",
      name: "Lay's Classic Salted Chips",
      brand: "Lay's",
      price: 180,
      qty: "6 packs",
      reason: "10 attendees · ~½ pack each",
      category: "Snacks",
      alternative: { name: "Bingo Mad Angles", brand: "Bingo", price: 150, saves: 30 },
    },
    {
      id: "p2",
      name: "Coca-Cola 1.25L",
      brand: "Coca-Cola",
      price: 260,
      qty: "4 bottles",
      reason: "~500ml per person for 3 hour match",
      category: "Beverages",
      alternative: { name: "Thums Up 1.25L", brand: "Thums Up", price: 240, saves: 20 },
    },
    {
      id: "p3",
      name: "Amul Vanilla Ice Cream 1L",
      brand: "Amul",
      price: 200,
      qty: "2 tubs",
      reason: "Dessert for 10",
      category: "Frozen",
      alternative: { name: "Vadilal Vanilla 1L", brand: "Vadilal", price: 170, saves: 30 },
    },
    {
      id: "p4",
      name: "Haldiram's Aloo Bhujia",
      brand: "Haldiram's",
      price: 120,
      qty: "2 packs",
      reason: "Match-time munching",
      category: "Snacks",
    },
    {
      id: "p5",
      name: "Domino's Pizza Voucher",
      brand: "Domino's",
      price: 600,
      qty: "Medium x 2",
      reason: "Main course for 10",
      category: "Meals",
      alternative: { name: "Frozen Pizza 4-pack", brand: "McCain", price: 480, saves: 120 },
    },
    {
      id: "p6",
      name: "Paper Plates & Cups",
      brand: "Pigeon",
      price: 90,
      qty: "Pack of 50",
      reason: "Disposable serving for a party",
      category: "Essentials",
    },
  ],
};

export const featureBento = [
  {
    title: "Context-to-Cart",
    desc: "Text, recipes, images, WhatsApp, PDFs — turn any context into a cart.",
  },
  {
    title: "Intent Extraction",
    desc: "Structured understanding of occasion, people, budget, dietary.",
  },
  {
    title: "OccasionCart",
    desc: "Pre-built templates for IPL, birthdays, festivals, weekly groceries.",
  },
  { title: "RecipeCart", desc: "Paste a recipe URL — get ingredients with smart quantities." },
  { title: "Quantity Engine", desc: "Quantities tuned to attendees, family size, trip length." },
  {
    title: "Multi-Intent",
    desc: "Handle multiple goals in one prompt — separate carts auto-created.",
  },
  {
    title: "GoalCart",
    desc: "Budget optimization with savings suggestions you stay in control of.",
  },
  { title: "CompareCart", desc: "What if budget drops? What if attendees grow? Instant diff." },
  {
    title: "Smart Alternatives",
    desc: "Cheaper or better options surfaced per item — you choose.",
  },
  { title: "Explainable", desc: "Every item shows exactly why it was added." },
  { title: "Confidence Layer", desc: "Asks before assuming when the prompt is ambiguous." },
  { title: "ReviewCart", desc: "Review assumptions, quantities, alternatives before checkout." },
  {
    title: "Collaborative Cart",
    desc: "Share via link or QR. Friends add. Budget auto-rebalances.",
  },
  { title: "Preferences", desc: "Veg, vegan, Jain, value / balanced / premium — set once." },
];
