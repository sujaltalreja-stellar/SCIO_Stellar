import { createRng } from "../data/rng";
import type {
  Audit,
  BasketPair,
  CalendarEvent,
  StoreDay,
  Country,
  CountryCode,
  DistributionCenter,
  Equipment,
  EquipmentType,
  PoLine,
  PricingException,
  Promotion,
  PurchaseOrder,
  RetailBase,
  Sku,
  Store,
  StoreFormat,
  StoreTask,
  Supplier,
  Ticket,
  Uom,
} from "./model";

// ---------------------------------------------------------------------------
// SCIO Retail OS synthetic data generator. Deterministic for a given day.
// 50 stores · 6 GCC countries · 5,000 SKUs · 6 DCs · 40 suppliers.
// ---------------------------------------------------------------------------

export const NSKU = 5000;
export const SALES_DAYS = 90;
const DAY = 86_400_000;
const SEED = 7_310_2026;

/** Fast deterministic hash -> [0,1) */
export function h(a: number, b = 0, c = 0): number {
  let x = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x632be5ab, 0xc2b2ae35) ^ Math.imul(c + 0x27d4eb2f, 0x165667b1);
  x ^= x >>> 15;
  x = Math.imul(x, 0x2c1b3c6d);
  x ^= x >>> 12;
  x = Math.imul(x, 0x297a2d39);
  x ^= x >>> 15;
  return (x >>> 0) / 4294967296;
}

export const iso = (d: Date) => d.toISOString().slice(0, 10);
export const addDaysIso = (base: string, n: number) => iso(new Date(new Date(base + "T00:00:00Z").getTime() + n * DAY));

export const COUNTRIES: Country[] = [
  { code: "AE", name: "United Arab Emirates", currency: "AED", toAed: 1, vat: 0.05, regions: ["Dubai", "Abu Dhabi", "Sharjah & Northern Emirates"] },
  { code: "SA", name: "Saudi Arabia", currency: "SAR", toAed: 0.979, vat: 0.15, regions: ["Riyadh", "Makkah Region", "Eastern Province"] },
  { code: "QA", name: "Qatar", currency: "QAR", toAed: 1.009, vat: 0, regions: ["Doha"] },
  { code: "KW", name: "Kuwait", currency: "KWD", toAed: 11.95, vat: 0, regions: ["Kuwait City", "Hawalli"] },
  { code: "OM", name: "Oman", currency: "OMR", toAed: 9.54, vat: 0.05, regions: ["Muscat", "Sohar"] },
  { code: "BH", name: "Bahrain", currency: "BHD", toAed: 9.74, vat: 0.1, regions: ["Capital", "Muharraq"] },
];

// [name, country, region, city, format, dc]
const STORE_DEFS: Array<[string, CountryCode, string, string, StoreFormat, number]> = [
  ["Dubai Marina", "AE", "Dubai", "Dubai", "Supermarket", 0],
  ["Al Barsha", "AE", "Dubai", "Dubai", "Hypermarket", 0],
  ["Deira City Centre", "AE", "Dubai", "Dubai", "Hypermarket", 0],
  ["Mirdif", "AE", "Dubai", "Dubai", "Supermarket", 0],
  ["Jumeirah Lakes Towers", "AE", "Dubai", "Dubai", "Express", 0],
  ["Business Bay", "AE", "Dubai", "Dubai", "Express", 0],
  ["Silicon Oasis", "AE", "Dubai", "Dubai", "Supermarket", 0],
  ["Corniche", "AE", "Abu Dhabi", "Abu Dhabi", "Supermarket", 0],
  ["Khalifa City", "AE", "Abu Dhabi", "Abu Dhabi", "Hypermarket", 0],
  ["Al Reem Island", "AE", "Abu Dhabi", "Abu Dhabi", "Express", 0],
  ["Al Ain Central", "AE", "Abu Dhabi", "Al Ain", "Hypermarket", 0],
  ["Sharjah Al Nahda", "AE", "Sharjah & Northern Emirates", "Sharjah", "Hypermarket", 0],
  ["Sharjah Al Majaz", "AE", "Sharjah & Northern Emirates", "Sharjah", "Supermarket", 0],
  ["Ajman Corniche", "AE", "Sharjah & Northern Emirates", "Ajman", "Supermarket", 0],
  ["Ras Al Khaimah", "AE", "Sharjah & Northern Emirates", "Ras Al Khaimah", "Hypermarket", 0],
  ["Fujairah City", "AE", "Sharjah & Northern Emirates", "Fujairah", "Supermarket", 0],
  ["Riyadh Olaya", "SA", "Riyadh", "Riyadh", "Hypermarket", 1],
  ["Riyadh Al Malaz", "SA", "Riyadh", "Riyadh", "Hypermarket", 1],
  ["Riyadh Al Nakheel", "SA", "Riyadh", "Riyadh", "Supermarket", 1],
  ["Riyadh Al Yasmin", "SA", "Riyadh", "Riyadh", "Supermarket", 1],
  ["Riyadh King Fahd Rd", "SA", "Riyadh", "Riyadh", "Express", 1],
  ["Riyadh Al Suwaidi", "SA", "Riyadh", "Riyadh", "Hypermarket", 1],
  ["Jeddah Tahlia", "SA", "Makkah Region", "Jeddah", "Hypermarket", 2],
  ["Jeddah Al Rawdah", "SA", "Makkah Region", "Jeddah", "Supermarket", 2],
  ["Jeddah Corniche", "SA", "Makkah Region", "Jeddah", "Express", 2],
  ["Makkah Al Aziziyah", "SA", "Makkah Region", "Makkah", "Hypermarket", 2],
  ["Taif Central", "SA", "Makkah Region", "Taif", "Supermarket", 2],
  ["Madinah Quba", "SA", "Makkah Region", "Madinah", "Supermarket", 2],
  ["Dammam Al Faisaliyah", "SA", "Eastern Province", "Dammam", "Hypermarket", 3],
  ["Khobar Corniche", "SA", "Eastern Province", "Al Khobar", "Supermarket", 3],
  ["Dhahran Mall", "SA", "Eastern Province", "Dhahran", "Supermarket", 3],
  ["Jubail Industrial", "SA", "Eastern Province", "Jubail", "Supermarket", 3],
  ["Al Ahsa Hofuf", "SA", "Eastern Province", "Hofuf", "Hypermarket", 3],
  ["Qatif Central", "SA", "Eastern Province", "Qatif", "Express", 3],
  ["Doha West Bay", "QA", "Doha", "Doha", "Hypermarket", 4],
  ["Doha Al Sadd", "QA", "Doha", "Doha", "Supermarket", 4],
  ["The Pearl", "QA", "Doha", "Doha", "Express", 4],
  ["Al Wakrah", "QA", "Doha", "Al Wakrah", "Supermarket", 4],
  ["Lusail", "QA", "Doha", "Lusail", "Supermarket", 4],
  ["Kuwait City Sharq", "KW", "Kuwait City", "Kuwait City", "Hypermarket", 5],
  ["Salmiya", "KW", "Hawalli", "Salmiya", "Supermarket", 5],
  ["Hawalli Central", "KW", "Hawalli", "Hawalli", "Supermarket", 5],
  ["Fahaheel", "KW", "Kuwait City", "Fahaheel", "Express", 5],
  ["Muscat Qurum", "OM", "Muscat", "Muscat", "Hypermarket", 0],
  ["Muscat Al Khuwair", "OM", "Muscat", "Muscat", "Supermarket", 0],
  ["Seeb", "OM", "Muscat", "Seeb", "Supermarket", 0],
  ["Sohar Central", "OM", "Sohar", "Sohar", "Supermarket", 0],
  ["Manama Seef", "BH", "Capital", "Manama", "Hypermarket", 3],
  ["Juffair", "BH", "Capital", "Manama", "Express", 3],
  ["Muharraq", "BH", "Muharraq", "Muharraq", "Supermarket", 3],
];

const DCS: Array<[string, CountryCode]> = [
  ["Jebel Ali DC", "AE"],
  ["Riyadh DC", "SA"],
  ["Jeddah DC", "SA"],
  ["Dammam DC", "SA"],
  ["Doha DC", "QA"],
  ["Kuwait DC", "KW"],
];

// ---- Catalogue -----------------------------------------------------------------

interface SubDef {
  dept: string;
  cat: string;
  sub: string;
  icon: string;
  products: string[];
  sizes: Array<[string, Uom, number]>; // label, base uom, units per pack
  price: [number, number]; // AED per base unit
  rate: [number, number]; // base units / store-day
  shelf: number | null;
  variants?: string[];
  colours?: string[];
  serialized?: boolean;
}

const S = (dept: string, cat: string, sub: string, icon: string, products: string[], sizes: SubDef["sizes"], price: [number, number], rate: [number, number], shelf: number | null, extra: Partial<SubDef> = {}): SubDef => ({
  dept,
  cat,
  sub,
  icon,
  products,
  sizes,
  price,
  rate,
  shelf,
  ...extra,
});

const CATALOG: SubDef[] = [
  S("Fresh Food", "Fruits & Vegetables", "Fruits", "🍎", ["Apples", "Bananas", "Oranges", "Grapes", "Mangoes", "Dates"], [["per kg", "kg", 1]], [5, 28], [6, 22], 10, { variants: ["Red", "Green", "Premium", "Organic"] }),
  S("Fresh Food", "Fruits & Vegetables", "Vegetables", "🥬", ["Tomatoes", "Cucumbers", "Potatoes", "Onions", "Lettuce", "Carrots"], [["per kg", "kg", 1]], [3, 14], [8, 30], 8, { variants: ["Local", "Imported", "Organic"] }),
  S("Fresh Food", "Dairy & Eggs", "Milk", "🥛", ["Fresh Milk", "Laban", "Flavoured Milk"], [["1 L", "piece", 1], ["2 L", "piece", 1]], [4, 12], [6, 25], 7, { variants: ["Full Fat", "Low Fat", "Skimmed"] }),
  S("Fresh Food", "Dairy & Eggs", "Yoghurt & Cheese", "🧀", ["Greek Yoghurt", "Labneh", "Halloumi", "Cheddar Slices", "Feta"], [["170 g", "piece", 1], ["400 g", "piece", 1]], [5, 26], [2, 10], 21),
  S("Fresh Food", "Dairy & Eggs", "Eggs", "🥚", ["Eggs"], [["Tray 30", "piece", 1], ["Pack 15", "piece", 1]], [12, 28], [3, 10], 28, { variants: ["White", "Brown", "Organic"] }),
  S("Fresh Food", "Bakery", "Bread", "🍞", ["Arabic Bread", "White Toast", "Brown Toast", "Croissants", "Samoon"], [["Pack", "piece", 1]], [3, 14], [5, 20], 4),
  S("Fresh Food", "Meat & Poultry", "Poultry", "🍗", ["Fresh Chicken Whole", "Chicken Breast", "Chicken Thighs"], [["per kg", "kg", 1]], [16, 38], [3, 14], 5),
  S("Fresh Food", "Meat & Poultry", "Meat", "🥩", ["Lamb Chops", "Beef Mince", "Veal Cubes"], [["per kg", "kg", 1]], [35, 85], [1, 6], 5),
  S("Grocery", "Staples", "Rice & Grains", "🍚", ["Basmati Rice", "Sella Rice", "Calrose Rice", "Bulgur", "Lentils"], [["1 kg", "piece", 1], ["5 kg", "piece", 1], ["10 kg", "piece", 1]], [6, 75], [1, 8], 540),
  S("Grocery", "Staples", "Cooking Oil", "🫒", ["Sunflower Oil", "Olive Oil", "Corn Oil", "Ghee"], [["1 L", "litre", 1], ["1.8 L", "litre", 1], ["750 ml", "litre", 1]], [8, 45], [1, 6], 365),
  S("Grocery", "Staples", "Flour & Sugar", "🌾", ["Plain Flour", "Whole Wheat Atta", "White Sugar", "Brown Sugar"], [["1 kg", "piece", 1], ["2 kg", "piece", 1], ["5 kg", "piece", 1]], [4, 30], [1, 6], 365),
  S("Grocery", "Beverages", "Water", "💧", ["Mineral Water", "Sparkling Water"], [["500 ml x 12", "pack", 1], ["1.5 L x 6", "pack", 1]], [5, 16], [6, 24], 365),
  S("Grocery", "Beverages", "Juices & Soft Drinks", "🧃", ["Orange Juice", "Mango Nectar", "Cola", "Lemon Soda", "Iced Tea"], [["250 ml", "piece", 1], ["1 L", "piece", 1], ["330 ml x 6", "pack", 1]], [2, 18], [3, 16], 180),
  S("Grocery", "Beverages", "Tea & Coffee", "☕", ["Black Tea", "Green Tea", "Arabic Coffee", "Instant Coffee", "Coffee Beans"], [["100 g", "piece", 1], ["250 g", "piece", 1], ["500 g", "piece", 1]], [8, 65], [1, 5], 540),
  S("Grocery", "Snacks & Confectionery", "Snacks", "🥨", ["Potato Chips", "Mixed Nuts", "Popcorn", "Crackers", "Cookies"], [["45 g", "piece", 1], ["150 g", "piece", 1], ["300 g", "piece", 1]], [2, 24], [2, 12], 240),
  S("Grocery", "Snacks & Confectionery", "Chocolate & Sweets", "🍫", ["Milk Chocolate", "Dark Chocolate", "Maamoul", "Halwa", "Gummies"], [["50 g", "piece", 1], ["200 g", "piece", 1]], [3, 32], [1, 9], 300),
  S("Grocery", "Canned & Packaged", "Canned Food", "🥫", ["Tuna", "Chickpeas", "Foul Medames", "Tomato Paste", "Sweet Corn"], [["185 g", "piece", 1], ["400 g", "piece", 1]], [3, 14], [1, 7], 720),
  S("Grocery", "Canned & Packaged", "Pasta & Noodles", "🍝", ["Spaghetti", "Penne", "Instant Noodles", "Vermicelli"], [["400 g", "piece", 1], ["5 x 75 g", "pack", 1]], [3, 12], [1, 8], 540),
  S("Frozen", "Frozen Food", "Frozen Ready Meals", "🧊", ["Frozen Pizza", "Chicken Nuggets", "Frozen Samosa", "Spring Rolls", "Frozen Paratha"], [["400 g", "piece", 1], ["1 kg", "piece", 1]], [8, 38], [1, 6], 180),
  S("Frozen", "Frozen Food", "Ice Cream", "🍦", ["Vanilla Ice Cream", "Chocolate Ice Cream", "Mango Kulfi", "Ice Cream Cones"], [["1 L", "piece", 1], ["4 x 100 ml", "pack", 1]], [6, 28], [1, 7], 270),
  S("Household", "Cleaning", "Laundry", "🧺", ["Laundry Powder", "Liquid Detergent", "Fabric Softener"], [["1 kg", "piece", 1], ["3 L", "piece", 1], ["5 kg", "piece", 1]], [10, 70], [0.6, 4], null),
  S("Household", "Cleaning", "Surface Care", "🧽", ["Dishwashing Liquid", "Floor Cleaner", "Glass Cleaner", "Bleach"], [["500 ml", "piece", 1], ["1 L", "piece", 1]], [4, 22], [0.8, 5], null),
  S("Household", "Paper & Disposables", "Paper", "🧻", ["Toilet Tissue", "Kitchen Towels", "Facial Tissues"], [["Pack 6", "pack", 1], ["Pack 12", "pack", 1]], [6, 32], [1, 6], null),
  S("Household", "Paper & Disposables", "Disposables", "🥤", ["Paper Cups", "Aluminium Foil", "Cling Film", "Garbage Bags"], [["Pack", "pack", 1]], [4, 20], [0.5, 3], null),
  S("Personal Care", "Hair & Body", "Hair Care", "🧴", ["Shampoo", "Conditioner", "Hair Oil"], [["200 ml", "piece", 1], ["400 ml", "piece", 1]], [9, 38], [0.4, 3], null, { variants: ["Anti-Dandruff", "Repair", "Smooth", "Herbal"] }),
  S("Personal Care", "Hair & Body", "Body Care", "🧼", ["Body Wash", "Bar Soap", "Body Lotion", "Deodorant"], [["150 ml", "piece", 1], ["250 ml", "piece", 1], ["4 x 120 g", "pack", 1]], [5, 34], [0.5, 4], null),
  S("Personal Care", "Oral & Health", "Oral Care", "🪥", ["Toothpaste", "Toothbrush", "Mouthwash"], [["100 ml", "piece", 1], ["Twin pack", "pack", 1]], [5, 26], [0.5, 3], null),
  S("Baby", "Baby Care", "Diapers & Wipes", "🍼", ["Diapers Size 3", "Diapers Size 4", "Diapers Size 5", "Baby Wipes"], [["Pack 40", "pack", 1], ["Pack 64", "pack", 1]], [18, 75], [0.4, 2.5], null),
  S("Baby", "Baby Care", "Baby Food", "🥣", ["Infant Formula Stage 1", "Infant Formula Stage 2", "Baby Cereal"], [["400 g", "piece", 1], ["900 g", "piece", 1]], [25, 120], [0.2, 1.5], 365),
  S("Electronics", "Mobile & Accessories", "Accessories", "🔌", ["USB-C Cable", "Fast Charger 25W", "Power Bank 10000mAh", "Wireless Earbuds", "Phone Case"], [["Unit", "piece", 1]], [15, 220], [0.05, 0.6], null, { colours: ["Black", "White", "Blue"], serialized: false }),
  S("Electronics", "Small Appliances", "Kitchen Appliances", "🔌", ["Electric Kettle", "Blender", "Air Fryer", "Toaster", "Coffee Maker"], [["Unit", "piece", 1]], [60, 480], [0.02, 0.25], null, { colours: ["Black", "Silver", "White"], serialized: true }),
  S("Home & Living", "Kitchenware", "Cookware", "🍳", ["Non-stick Pan", "Cooking Pot", "Knife Set", "Food Containers"], [["Unit", "piece", 1], ["Set", "piece", 1]], [18, 160], [0.05, 0.5], null, { colours: ["Black", "Red", "Grey"] }),
  S("Home & Living", "Home Textiles", "Textiles", "🛏️", ["Bath Towel", "Bedsheet Set", "Cushion Cover", "Prayer Mat"], [["Unit", "piece", 1]], [15, 140], [0.05, 0.5], null, { colours: ["White", "Beige", "Navy", "Grey"] }),
];

const BRANDS_BY_CATEGORY: Record<string, string[]> = {
  "Fruits & Vegetables": ["Gulf Fresh", "Oasis Farms", "Palm Valley", "Arabian Harvest", "Green Crescent"],
  "Dairy & Eggs": ["Desert Dairy", "Gulf Fresh", "Oasis Farms", "Green Crescent"],
  Bakery: ["Al Waha Bakery", "Palm Valley", "Gulf Fresh"],
  "Meat & Poultry": ["Najd Poultry", "Arabian Harvest", "Green Crescent"],
};

const BRANDS: Record<string, string[]> = {
  "Fresh Food": ["Gulf Fresh", "Oasis Farms", "Palm Valley", "Desert Dairy", "Al Waha Bakery", "Arabian Harvest", "Najd Poultry", "Green Crescent"],
  Grocery: ["Sahara Gold", "Pearl Pantry", "Bayt", "Falcon", "Zahra", "Noura", "Golden Dune", "Al Majd"],
  Frozen: ["Polar Gulf", "Frosty Dunes", "Bayt Frozen", "Arctic Palm"],
  Household: ["Marina Home", "CleanWave", "Bayt Care", "Sparkle", "Najma"],
  "Personal Care": ["Desert Bloom", "Lumière", "Pure Oasis", "Amber", "Silk Road"],
  Baby: ["Little Pearl", "Nunu", "BabyNest"],
  Electronics: ["TechNest", "Lumo", "Voltix", "Kitchenly"],
  "Home & Living": ["Bayt Living", "Casa Gulf", "Marina Home", "Dar"],
};

function ean13(seed: number) {
  const digits = [6, 2, 9];
  for (let i = 0; i < 9; i++) digits.push(Math.floor(h(seed, i, 99) * 10));
  const sum = digits.reduce((s, d, i) => s + d * (i % 2 ? 3 : 1), 0);
  digits.push((10 - (sum % 10)) % 10);
  return digits.join("");
}

function upcA(seed: number) {
  const digits = [0];
  for (let i = 0; i < 10; i++) digits.push(Math.floor(h(seed, i, 98) * 10));
  const sum = digits.reduce((s, d, i) => s + d * (i % 2 ? 1 : 3), 0);
  digits.push((10 - (sum % 10)) % 10);
  return digits.join("");
}

const GCC_ORIGINS = new Set(["UAE", "Saudi Arabia", "Oman", "Qatar", "Kuwait", "Bahrain"]);

const PACKAGING: Record<string, string> = {
  Fruits: "Loose / crate",
  Vegetables: "Loose / crate",
  Milk: "Bottle",
  "Yoghurt & Cheese": "Tub",
  Eggs: "Tray",
  Bread: "Bag",
  Poultry: "Tray (MAP)",
  Meat: "Vacuum pack",
  "Rice & Grains": "Bag",
  "Cooking Oil": "Bottle",
  "Flour & Sugar": "Bag",
  Water: "Shrink-wrapped multipack",
  "Juices & Soft Drinks": "Bottle / can",
  "Tea & Coffee": "Box / jar",
  Snacks: "Pouch",
  "Chocolate & Sweets": "Wrapper / box",
  "Canned Food": "Can",
  "Pasta & Noodles": "Bag",
  "Frozen Ready Meals": "Box",
  "Ice Cream": "Tub",
  Laundry: "Box / bottle",
  "Surface Care": "Bottle",
  Paper: "Shrink-wrapped pack",
  Disposables: "Box",
  "Hair Care": "Bottle",
  "Body Care": "Bottle / bar",
};

const FLAVOURED = new Set(["Juices & Soft Drinks", "Ice Cream", "Snacks", "Chocolate & Sweets", "Milk", "Yoghurt & Cheese", "Tea & Coffee"]);
const FLAVOUR_WORDS = ["Orange", "Mango", "Cola", "Lemon", "Vanilla", "Dark Chocolate", "Milk Chocolate", "Chocolate", "Green Tea", "Black Tea"];
function flavourFor(sub: string, product: string, k: number): string | null {
  if (!FLAVOURED.has(sub)) return null;
  const hit = FLAVOUR_WORDS.find((w) => product.includes(w));
  if (hit) return hit;
  const opts = sub === "Snacks" ? ["Salted", "Cheese", "Chilli", "Sour Cream"] : sub === "Milk" ? ["Plain", "Strawberry", "Chocolate", "Banana"] : ["Original", "Strawberry", "Honey"];
  return opts[Math.floor(h(k, 41) * opts.length)];
}

function lifecycleFor(status: Sku["status"], k: number): Sku["lifecycle"] {
  if (status === "Discontinued") return "End of life";
  if (status === "New") return "Introduction";
  const r = h(k, 42);
  return r < 0.22 ? "Growth" : r < 0.88 ? "Maturity" : "Decline";
}

/** GCC retail calendar (real dates; uplift = expected demand change by department). */
export const RETAIL_CALENDAR: CalendarEvent[] = [
  { id: "CAL-RAM26", name: "Ramadan 2026", kind: "Religious", countries: ["AE", "SA", "QA", "KW", "OM", "BH"], start: "2026-02-18", end: "2026-03-19", uplift: { Grocery: 0.38, "Fresh Food": 0.3, Frozen: 0.22, Household: 0.12 } },
  { id: "CAL-EIDF26", name: "Eid al-Fitr 2026", kind: "Religious", countries: ["AE", "SA", "QA", "KW", "OM", "BH"], start: "2026-03-20", end: "2026-03-23", uplift: { "Fresh Food": 0.25, Grocery: 0.2, "Personal Care": 0.3, Electronics: 0.25 } },
  { id: "CAL-EIDA26", name: "Eid al-Adha 2026", kind: "Religious", countries: ["AE", "SA", "QA", "KW", "OM", "BH"], start: "2026-05-26", end: "2026-05-29", uplift: { "Fresh Food": 0.45, Grocery: 0.18 } },
  { id: "CAL-BTS26", name: "Back to School 2026", kind: "Seasonal", countries: ["AE", "SA", "QA", "KW", "OM", "BH"], start: "2026-08-17", end: "2026-09-06", uplift: { Electronics: 0.35, Grocery: 0.08 } },
  { id: "CAL-SND26", name: "Saudi National Day 2026", kind: "National", countries: ["SA"], start: "2026-09-21", end: "2026-09-24", uplift: { Grocery: 0.15, Electronics: 0.3 } },
  { id: "CAL-WF26", name: "White Friday 2026", kind: "Promotion", countries: ["AE", "SA", "QA", "KW", "OM", "BH"], start: "2026-11-25", end: "2026-11-30", uplift: { Electronics: 0.85, "Home & Living": 0.45, "Personal Care": 0.25, Household: 0.2 } },
  { id: "CAL-UND26", name: "UAE National Day 2026", kind: "National", countries: ["AE"], start: "2026-12-01", end: "2026-12-03", uplift: { Grocery: 0.18, "Fresh Food": 0.15 } },
  { id: "CAL-DSF26", name: "Dubai Shopping Festival 2026-27", kind: "Promotion", countries: ["AE"], start: "2026-12-11", end: "2027-01-10", uplift: { Electronics: 0.4, "Home & Living": 0.3, "Personal Care": 0.15 } },
  { id: "CAL-BND26", name: "Bahrain National Day 2026", kind: "National", countries: ["BH"], start: "2026-12-16", end: "2026-12-17", uplift: { Grocery: 0.15 } },
  { id: "CAL-QND26", name: "Qatar National Day 2026", kind: "National", countries: ["QA"], start: "2026-12-18", end: "2026-12-18", uplift: { Grocery: 0.15 } },
  { id: "CAL-RAM27", name: "Ramadan 2027", kind: "Religious", countries: ["AE", "SA", "QA", "KW", "OM", "BH"], start: "2027-02-08", end: "2027-03-09", uplift: { Grocery: 0.38, "Fresh Food": 0.3, Frozen: 0.22, Household: 0.12 } },
  { id: "CAL-EIDF27", name: "Eid al-Fitr 2027", kind: "Religious", countries: ["AE", "SA", "QA", "KW", "OM", "BH"], start: "2027-03-10", end: "2027-03-13", uplift: { "Fresh Food": 0.25, Grocery: 0.2, "Personal Care": 0.3, Electronics: 0.25 } },
  { id: "CAL-EIDA27", name: "Eid al-Adha 2027", kind: "Religious", countries: ["AE", "SA", "QA", "KW", "OM", "BH"], start: "2027-05-16", end: "2027-05-19", uplift: { "Fresh Food": 0.45, Grocery: 0.18 } },
];

const CARRIERS = ["GulfLink 3PL", "Desert Freight Logistics", "Oasis Cold Chain 3PL", "Peninsula Haulage", "Crescent Logistics"];

function productMaster(k: number, sub: string, product: string, brand: string, baseUom: Uom, sizeLabel: string, cost: number, origin: string, statusR: number) {
  const uoms = uomsFor(baseUom, sizeLabel);
  const caseU = uoms.find((u) => u.uom === "case") ?? uoms.find((u) => u.uom === "carton");
  const casePack = caseU ? Math.round(caseU.factor * 1000) / 1000 : 1;
  const imported = !GCC_ORIGINS.has(origin);
  const landedCost = Math.round(cost * (imported ? 1.08 + h(k, 43) * 0.05 : 1.01 + h(k, 43) * 0.015) * 100) / 100;
  let spuHash = 0;
  for (const ch of `${brand}|${product}`) spuHash = (spuHash * 31 + ch.charCodeAt(0)) % 9_000_000;
  const status: Sku["status"] = statusR < 0.03 ? "Discontinued" : statusR < 0.08 ? "New" : statusR < 0.12 ? "Seasonal" : "Active";
  return {
    ean: ean13(k + 17),
    upc: origin === "Singapore" || h(k, 44) < 0.06 ? upcA(k + 5) : null,
    spu: `SPU-${String(1_000_000 + spuHash).slice(-7)}`,
    flavour: flavourFor(sub, product, k),
    packaging: PACKAGING[sub] ?? "Box",
    lifecycle: lifecycleFor(status, k),
    casePack,
    moq: Math.round(casePack * (1 + Math.floor(h(k, 45) * 3)) * 1000) / 1000,
    landedCost,
    mrp: origin === "India" ? Math.round(landedCost * 1.62 * 100) / 100 : null,
  };
}

function uomsFor(base: Uom, sizeLabel: string): Sku["uoms"] {
  if (base === "kg") return [
    { uom: "kg", factor: 1, label: "Kilogram" },
    { uom: "g", factor: 0.001, label: "Gram" },
    { uom: "case", factor: 10, label: "Case (10 kg)" },
    { uom: "pallet", factor: 400, label: "Pallet (40 cases)" },
  ];
  if (base === "litre") {
    const m = sizeLabel.match(/([\d.]+)\s*(ml|L)/i);
    const litres = m ? (m[2].toLowerCase() === "ml" ? Number(m[1]) / 1000 : Number(m[1])) : 1;
    return [
      { uom: "litre", factor: 1, label: "Litre" },
      { uom: "ml", factor: 0.001, label: "Millilitre" },
      { uom: "piece", factor: litres, label: `Bottle (${sizeLabel})` },
      { uom: "carton", factor: litres * 12, label: "Carton (12 bottles)" },
      { uom: "pallet", factor: litres * 12 * 60, label: "Pallet (60 cartons)" },
    ];
  }
  const caseQty = base === "pack" ? 6 : 24;
  return [
    { uom: base, factor: 1, label: base === "pack" ? "Pack" : "Piece" },
    { uom: "carton", factor: caseQty / 2, label: `Carton (${caseQty / 2})` },
    { uom: "case", factor: caseQty, label: `Case (${caseQty})` },
    { uom: "pallet", factor: caseQty * 50, label: `Pallet (50 cases)` },
  ];
}

const SUPPLIER_NAMES = [
  "Emirates Fresh Produce", "Gulf Dairy Industries", "Arabian Food Distributors", "Najd Agricultural Co.", "Al Khaleej Bakeries", "Red Sea Poultry",
  "Pearl Trading LLC", "Sahara Food Industries", "Falcon Beverages", "Oasis Water Co.", "Golden Grains Trading", "Levant Imports",
  "Nile Valley Foods", "Indus Rice Exports", "Anatolia Snacks", "Mediterranean Oils", "Polar Frozen Foods", "Arctic Cold Chain Trading",
  "CleanWave Industries", "Bayt Household Supplies", "Desert Bloom Cosmetics", "Silk Road Personal Care", "Little Pearl Baby Products", "Gulf Paper Mills",
  "TechNest Distribution", "Voltix Electronics FZE", "Kitchenly Appliances", "Casa Gulf Home", "Dar Textiles", "Asia Pacific Trading",
  "Al Majd Wholesale", "Zahra Foods", "Noura Trading", "Muscat Foodstuff", "Doha Fresh Supplies", "Kuwait Food Co.",
  "Bahrain Distribution Hub", "Jeddah Import House", "Eastern Province Traders", "Global Brands FZCO",
];
const SUPPLIER_COUNTRY = ["UAE", "Saudi Arabia", "UAE", "Saudi Arabia", "UAE", "Saudi Arabia", "UAE", "Saudi Arabia", "UAE", "UAE", "UAE", "Jordan", "Egypt", "India", "Türkiye", "Spain", "UAE", "Saudi Arabia", "UAE", "UAE", "UAE", "UAE", "UAE", "Saudi Arabia", "UAE", "UAE", "UAE", "UAE", "Türkiye", "Singapore", "Saudi Arabia", "UAE", "Kuwait", "Oman", "Qatar", "Kuwait", "Bahrain", "Saudi Arabia", "Saudi Arabia", "UAE"];
const SUPPLIER_CATS: string[][] = [
  ["Fruits & Vegetables"], ["Dairy & Eggs"], ["Staples", "Canned & Packaged"], ["Fruits & Vegetables", "Dairy & Eggs"], ["Bakery"], ["Meat & Poultry"],
  ["Beverages", "Snacks & Confectionery"], ["Staples", "Canned & Packaged"], ["Beverages"], ["Beverages"], ["Staples"], ["Canned & Packaged", "Snacks & Confectionery"],
  ["Canned & Packaged"], ["Staples"], ["Snacks & Confectionery"], ["Staples"], ["Frozen Food"], ["Frozen Food", "Meat & Poultry"],
  ["Cleaning"], ["Cleaning", "Paper & Disposables"], ["Hair & Body"], ["Hair & Body", "Oral & Health"], ["Baby Care"], ["Paper & Disposables"],
  ["Mobile & Accessories"], ["Mobile & Accessories", "Small Appliances"], ["Small Appliances"], ["Kitchenware"], ["Home Textiles"], ["Kitchenware", "Home Textiles", "Mobile & Accessories"],
  ["Staples", "Beverages"], ["Snacks & Confectionery", "Staples"], ["Canned & Packaged", "Beverages"], ["Fruits & Vegetables", "Dairy & Eggs"], ["Fruits & Vegetables", "Bakery"], ["Staples", "Dairy & Eggs"],
  ["Cleaning", "Paper & Disposables"], ["Frozen Food", "Canned & Packaged"], ["Meat & Poultry", "Bakery"], ["Hair & Body", "Baby Care", "Oral & Health"],
];
/** Chronically late suppliers (used by the supplier-delay workflow). */
export const LATE_SUPPLIERS = [1, 16, 25];

const FIRST = ["Ahmed", "Fatima", "Omar", "Aisha", "Khalid", "Mariam", "Yousef", "Noura", "Hassan", "Layla", "Rashid", "Sara", "Faisal", "Huda", "Tariq", "Reem", "Imran", "Priya", "Joseph", "Anil"];
const LAST = ["Al Mansoori", "Al Qahtani", "Haddad", "Al Shamsi", "Rahman", "Al Harbi", "Nasser", "Al Kuwari", "Saleh", "Al Balushi", "Khan", "Menon", "Fernandes", "Al Dosari", "Yousif"];
export const TECHNICIANS = ["Ravi Kumar (Cold chain)", "Mohammed Saeed (HVAC)", "Arjun Nair (Refrigeration)", "Bilal Ahmed (Electrical)", "Elena Cruz (POS & IT)", "Samir Haddad (Generators)"];

const person = (a: number, b: number) => `${FIRST[Math.floor(h(a, b, 1) * FIRST.length)]} ${LAST[Math.floor(h(a, b, 2) * LAST.length)]}`;

const FORMAT_FACTOR: Record<StoreFormat, number> = { Hypermarket: 1.7, Supermarket: 1.0, Express: 0.42 };
const FORMAT_RANGE: Record<StoreFormat, number> = { Hypermarket: 0.96, Supermarket: 0.72, Express: 0.34 };

export function generateRetail(anchor: Date = new Date()): RetailBase {
  const rng = createRng(SEED);
  const today = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), anchor.getUTCDate()));
  const anchorDate = iso(today);

  // ---- Stores & DCs ----
  const stores: Store[] = STORE_DEFS.map(([name, country, region, city, format, dcIdx], idx) => {
    const sizeSqm = format === "Hypermarket" ? rng.int(8000, 14000) : format === "Supermarket" ? rng.int(1800, 4500) : rng.int(350, 900);
    const traffic = FORMAT_FACTOR[format] * rng.range(0.82, 1.22);
    return { idx, id: `S${101 + idx}`, name, country, region, city, format, sizeSqm, manager: person(idx, 7), opened: rng.int(2009, 2023), traffic, dcIdx, monthlyTargetAed: 0 };
  });
  const dcs: DistributionCenter[] = DCS.map(([name, country], idx) => ({ idx, id: `DC${idx + 1}`, name, country }));

  // ---- Suppliers ----
  const suppliers: Supplier[] = SUPPLIER_NAMES.map((name, idx) => ({
    idx,
    id: `SUP-${String(idx + 1).padStart(3, "0")}`,
    name,
    country: SUPPLIER_COUNTRY[idx],
    categories: SUPPLIER_CATS[idx],
    leadTimeDays: SUPPLIER_CATS[idx].some((c) => ["Fruits & Vegetables", "Dairy & Eggs", "Bakery", "Meat & Poultry"].includes(c)) ? rng.int(1, 3) : rng.int(5, 21),
    onTimeTarget: LATE_SUPPLIERS.includes(idx) ? rng.range(0.35, 0.55) : rng.range(0.82, 0.98),
    fillTarget: LATE_SUPPLIERS.includes(idx) ? rng.range(0.72, 0.85) : rng.range(0.9, 0.995),
    contact: person(idx, 33),
  }));
  const suppliersByCat = new Map<string, number[]>();
  suppliers.forEach((s) => s.categories.forEach((c) => suppliersByCat.set(c, [...(suppliersByCat.get(c) ?? []), s.idx])));

  // ---- SKUs ----
  const skus: Sku[] = [];
  let round = 0;
  while (skus.length < NSKU) {
    for (let si = 0; si < CATALOG.length && skus.length < NSKU; si++) {
      const d = CATALOG[si];
      const brands = BRANDS_BY_CATEGORY[d.cat] ?? BRANDS[d.dept];
      const pIdx = (round + si) % d.products.length;
      const bIdx = Math.floor(round / d.products.length + si) % brands.length;
      const sizeIdx = Math.floor(round / (d.products.length * brands.length)) % d.sizes.length;
      const variants = d.variants ?? [];
      const vIdx = variants.length ? Math.floor(round / 3) % variants.length : -1;
      const colours = d.colours ?? [];
      const colour = colours.length ? colours[round % colours.length] : null;
      const [sizeLabel, baseUom] = d.sizes[sizeIdx];
      const k = skus.length;
      const variant = vIdx >= 0 ? variants[vIdx] : "Regular";
      const cost = Math.round(rng.range(d.price[0], d.price[1]) * 0.72 * 100) / 100;
      const markup = d.dept === "Fresh Food" ? rng.range(1.22, 1.45) : d.dept === "Electronics" ? rng.range(1.18, 1.35) : rng.range(1.25, 1.6);
      const cats = suppliersByCat.get(d.cat) ?? [0];
      const supplierIdx = cats[Math.floor(h(k, 5) * cats.length)];
      const alt = cats.filter((c) => c !== supplierIdx);
      const statusR = h(k, 6);
      skus.push({
        idx: k,
        id: `SKU-${100001 + k}`,
        name: `${brands[bIdx]} ${d.products[pIdx]}${vIdx >= 0 && variant !== "Regular" ? " " + variant : ""}${colour ? " " + colour : ""} ${sizeLabel}`,
        brand: brands[bIdx],
        department: d.dept,
        category: d.cat,
        subcategory: d.sub,
        variant,
        size: sizeLabel,
        colour,
        gtin: ean13(k + 17),
        baseUom,
        uoms: uomsFor(baseUom, sizeLabel),
        cost,
        price: Math.round(cost * markup * 100) / 100,
        status: statusR < 0.03 ? "Discontinued" : statusR < 0.08 ? "New" : statusR < 0.12 ? "Seasonal" : "Active",
        perishable: d.shelf !== null && d.shelf <= 30,
        shelfLifeDays: d.shelf,
        serialized: !!d.serialized,
        supplierIdx,
        altSupplierIdx: alt.length ? alt[Math.floor(h(k, 8) * alt.length)] : suppliersByCat.get(d.cat)?.[0] ?? 0,
        // long-tail popularity
        baseRate: rng.range(d.rate[0], d.rate[1]) * Math.pow(h(k, 9) + 0.15, 1.6),
        icon: d.icon,
        ...productMaster(k, d.sub, d.products[pIdx], brands[bIdx], baseUom, sizeLabel, cost, SUPPLIER_COUNTRY[supplierIdx] ?? "UAE", statusR),
      });
    }
    round++;
  }

  // ---- Store x SKU inventory ----
  const N = stores.length * NSKU;
  const carried = new Uint8Array(N);
  const onHand = new Int32Array(N);
  const reserved = new Int32Array(N);
  const damaged = new Int32Array(N);
  const velocity = new Float32Array(N);
  const lastSaleDaysAgo = new Uint8Array(N);
  const S118 = 17;
  for (const st of stores) {
    for (let k = 0; k < NSKU; k++) {
      const sku = skus[k];
      const p = st.idx * NSKU + k;
      let range = FORMAT_RANGE[st.format];
      if (sku.department === "Electronics" || sku.department === "Home & Living") range *= st.format === "Express" ? 0.15 : 0.85;
      if (sku.status === "Discontinued") range *= 0.6;
      if (h(st.idx, k, 1) > range) continue;
      carried[p] = 1;
      const v = sku.baseRate * st.traffic * (0.55 + h(st.idx, k, 2) * 0.9);
      velocity[p] = v;
      const r = h(st.idx, k, 3);
      const fast = sku.baseRate > 2.5;
      const stockoutP = st.idx === S118 && fast ? 0.16 : 0.009;
      let oh: number;
      let last = v >= 1 ? 0 : Math.min(30, Math.floor(h(st.idx, k, 4) * (1 / Math.max(v, 0.04))));
      if (r < stockoutP) {
        oh = 0;
        last = 1 + Math.floor(h(st.idx, k, 5) * 5);
      } else if (r < stockoutP + 0.025) oh = Math.floor(v * (0.3 + h(st.idx, k, 6) * 2.2));
      else if (r < stockoutP + 0.031 && v >= 1) {
        oh = Math.ceil(v * (6 + h(st.idx, k, 7) * 10));
        last = 6 + Math.floor(h(st.idx, k, 8) * 9); // phantom inventory
      } else if (r < stockoutP + 0.046) oh = Math.ceil(Math.max(6, v * (110 + h(st.idx, k, 9) * 150))); // overstock
      else oh = Math.ceil(v * (8 + h(st.idx, k, 10) * 22));
      if (sku.baseUom === "kg") oh = Math.round(oh);
      onHand[p] = oh;
      lastSaleDaysAgo[p] = last;
      if (h(st.idx, k, 11) < 0.04) reserved[p] = Math.min(oh, 1 + Math.floor(h(st.idx, k, 12) * 4));
      if (h(st.idx, k, 13) < 0.025) damaged[p] = 1 + Math.floor(h(st.idx, k, 14) * 3);
    }
  }

  // ---- DC stock ----
  const dcStock = new Int32Array(dcs.length * NSKU);
  for (const dc of dcs) {
    const served = stores.filter((s) => s.dcIdx === dc.idx);
    for (let k = 0; k < NSKU; k++) {
      let demand = 0;
      for (const s of served) demand += velocity[s.idx * NSKU + k];
      const sup = skus[k].supplierIdx;
      const days = LATE_SUPPLIERS.includes(sup) ? h(dc.idx, k, 21) * 6 : 10 + h(dc.idx, k, 22) * 30;
      dcStock[dc.idx * NSKU + k] = Math.round(demand * days);
    }
  }

  // ---- Monthly sales targets ----
  for (const st of stores) {
    let sales = 0;
    for (let k = 0; k < NSKU; k++) sales += velocity[st.idx * NSKU + k] * skus[k].price;
    st.monthlyTargetAed = Math.round((sales * 30 * (st.idx === S118 ? 1.18 : rng.range(0.92, 1.08))) / 1000) * 1000;
  }

  // ---- Purchase orders ----
  const pos: PurchaseOrder[] = [];
  const skusBySupplier = new Map<number, number[]>();
  skus.forEach((s) => skusBySupplier.set(s.supplierIdx, [...(skusBySupplier.get(s.supplierIdx) ?? []), s.idx]));
  let poN = 50001;
  for (let i = 0; i < 760; i++) {
    const sup = suppliers[Math.floor(rng.next() * suppliers.length)];
    const pool = skusBySupplier.get(sup.idx);
    if (!pool?.length) continue;
    const fresh = sup.leadTimeDays <= 3;
    const destType: "dc" | "store" = fresh ? "store" : "dc";
    const destIdx = destType === "store" ? rng.int(0, stores.length - 1) : rng.int(0, dcs.length - 1);
    const createdOffset = -Math.floor(rng.next() * 70) - 1;
    const created = addDaysIso(anchorDate, createdOffset);
    const promised = addDaysIso(created, sup.leadTimeDays);
    const late = rng.next() > sup.onTimeTarget;
    const delay = late ? rng.int(2, LATE_SUPPLIERS.includes(sup.idx) ? 12 : 5) : rng.int(-1, 0);
    const arrival = addDaysIso(promised, delay);
    const arrived = arrival <= anchorDate;
    const lines: PoLine[] = [];
    const n = rng.int(3, 9);
    for (let j = 0; j < n; j++) {
      const k = pool[Math.floor(rng.next() * pool.length)];
      if (lines.some((l) => l.skuIdx === k)) continue;
      const ordered = Math.max(6, Math.round(skus[k].baseRate * (destType === "dc" ? 60 : 4) * rng.range(4, 9)));
      const fill = rng.next() < sup.fillTarget ? 1 : rng.range(0.55, 0.92);
      const received = arrived ? Math.round(ordered * fill) : 0;
      const invAnomaly = arrived && rng.next() < 0.05;
      lines.push({
        skuIdx: k,
        ordered,
        received,
        unitCost: skus[k].cost,
        invoicedQty: arrived ? (invAnomaly && rng.next() < 0.5 ? ordered : received) : null,
        invoicedCost: arrived ? Math.round(skus[k].cost * (invAnomaly ? rng.range(1.06, 1.18) : 1) * 100) / 100 : null,
      });
    }
    const partial = arrived && lines.some((l) => l.received < l.ordered);
    pos.push({
      id: `PO-${poN++}`,
      supplierIdx: sup.idx,
      destType,
      destIdx,
      created,
      promised,
      received: arrived ? arrival : null,
      status: arrived ? (partial ? "Partially received" : "Received") : createdOffset > -2 && rng.next() < 0.5 ? "Pending approval" : "Sent",
      lines,
      createdBy: "Auto-replenishment",
      grn: arrived ? `GRN-${poN - 1 + 30000}` : null,
      asn:
        !arrived && h(poN, 1, 31) < 0.7 && addDaysIso(promised, -Math.min(sup.leadTimeDays, 2)) <= anchorDate
          ? { id: `ASN-${poN - 1 + 70000}`, shipped: addDaysIso(promised, -Math.min(sup.leadTimeDays, 2)), eta: arrival < anchorDate ? addDaysIso(anchorDate, 1 + Math.floor(h(poN, 2, 31) * 4)) : arrival, carrier: CARRIERS[Math.floor(h(poN, 3, 31) * CARRIERS.length)] }
          : null,
      flow: destType === "store" ? "Direct to store" : lines.every((l) => skus[l.skuIdx].perishable) || h(poN, 4, 31) < 0.2 ? "Cross-dock" : "Putaway",
    });
  }

  // ---- Equipment ----
  const equipment: Equipment[] = [];
  const counts: Record<StoreFormat, Record<EquipmentType, number>> = {
    Hypermarket: { Freezer: 6, Chiller: 8, "Cold Room": 2, HVAC: 4, "POS Terminal": 22, Generator: 1 },
    Supermarket: { Freezer: 4, Chiller: 5, "Cold Room": 1, HVAC: 2, "POS Terminal": 9, Generator: 1 },
    Express: { Freezer: 2, Chiller: 2, "Cold Room": 0, HVAC: 1, "POS Terminal": 3, Generator: 0 },
  };
  const MAKES: Record<EquipmentType, string[]> = {
    Freezer: ["Arctica ULT-90", "FrostLine FX6", "PolarCase 5D"],
    Chiller: ["CoolMax MD-4", "FrostLine CL3", "PolarCase Deli"],
    "Cold Room": ["ColdCore CR-40", "Arctica Walk-In 30"],
    HVAC: ["AirGulf 60TR", "DesertCool RTU-40"],
    "POS Terminal": ["Lumo POS 15", "TechNest T2 Register"],
    Generator: ["PowerGulf 250kVA", "Voltix GenSet 180"],
  };
  for (const st of stores) {
    let n = 1;
    for (const [type, cnt] of Object.entries(counts[st.format]) as Array<[EquipmentType, number]>) {
      for (let i = 0; i < cnt; i++) {
        const id = `${st.id}-${type === "POS Terminal" ? "POS" : type === "Cold Room" ? "CR" : type.slice(0, 3).toUpperCase()}${String(i + 1).padStart(2, "0")}`;
        const seed = st.idx * 1000 + n++;
        const isCold = type === "Freezer" || type === "Chiller" || type === "Cold Room";
        const setpoint = type === "Freezer" ? -18 : type === "Chiller" ? 3 : type === "Cold Room" ? 2 : type === "HVAC" ? 24 : type === "POS Terminal" ? 100 : 100;
        const faultP = st.idx === S118 && type === "Freezer" && i === 1 ? 1 : isCold ? 0.03 : type === "POS Terminal" ? 0.02 : type === "HVAC" ? 0.04 : 0.03;
        const hasFault = h(seed, 1, 77) < faultP;
        const since = hasFault ? 6 + Math.floor(h(seed, 2, 77) * 30) : 99;
        const readings: number[] = [];
        for (let t = 0; t < 48; t++) {
          const drift = hasFault && t >= 48 - since ? (t - (48 - since) + 1) : 0;
          let v: number;
          if (isCold) v = setpoint + (h(seed, t, 3) - 0.5) * 1.2 + drift * (type === "Freezer" ? 0.33 : 0.2);
          else if (type === "HVAC") v = setpoint + (h(seed, t, 3) - 0.5) * 1.2 + drift * 0.18;
          else if (type === "POS Terminal") v = hasFault && t >= 48 - since ? 0 : 100;
          else v = Math.max(5, 100 - t * 0.4 - (hasFault ? drift * 2.4 : 0)); // generator fuel %
          readings.push(Math.round(v * 10) / 10);
        }
        equipment.push({
          id,
          storeIdx: st.idx,
          type,
          name: `${type} ${i + 1}`,
          make: MAKES[type][Math.floor(h(seed, 4) * MAKES[type].length)],
          installed: 2012 + Math.floor(h(seed, 5) * 12),
          setpoint: type === "Generator" ? null : setpoint,
          readings,
          unit: isCold || type === "HVAC" ? "°C" : type === "POS Terminal" ? "% online" : "% fuel",
          fault: hasFault
            ? {
                kind:
                  type === "Freezer" || type === "Chiller" || type === "Cold Room"
                    ? "Temperature above safe range · possible compressor or door-seal failure"
                    : type === "HVAC"
                      ? "Supply air temperature rising · cooling capacity loss"
                      : type === "POS Terminal"
                        ? "Terminal offline · payment device not responding"
                        : "Fuel level dropping faster than load profile",
                since,
              }
            : null,
          lastService: addDaysIso(anchorDate, -Math.floor(h(seed, 6) * 200)),
          serviceIntervalDays: isCold ? 90 : type === "POS Terminal" ? 365 : 180,
        });
      }
    }
  }

  // ---- Audits ----
  const audits: Audit[] = [];
  const FINDINGS: Record<Audit["type"], string[]> = {
    Shelf: ["Gaps on shelf in beverages aisle", "Planogram not followed in snacks", "Facings missing for promoted items", "Out-of-stock labels not displayed", "Products past sell-by date on shelf"],
    Safety: ["Fire exit partially blocked by pallets", "Wet floor without signage", "Ladder not stored correctly", "First-aid kit incomplete"],
    Hygiene: ["Deli counter cleaning log incomplete", "Bakery area surfaces not sanitised", "Pest control record overdue", "Staff hairnets not worn in butchery"],
    "Cold chain": ["Freezer temperature log gaps", "Chiller door left open", "Frozen goods stacked above load line"],
    Pricing: ["Shelf label does not match system price", "Promotion label still displayed after end date", "Missing unit price on shelf label"],
  };
  let auditN = 1;
  for (const st of stores) {
    for (const type of Object.keys(FINDINGS) as Audit["type"][]) {
      for (let i = 0; i < 2; i++) {
        const base = st.idx === S118 ? 62 : 74;
        const score = Math.round(Math.min(100, base + rng.next() * 26));
        const nf = score > 92 ? 0 : score > 82 ? 1 : score > 72 ? 2 : 3;
        audits.push({
          id: `AUD-${String(auditN++).padStart(4, "0")}`,
          storeIdx: st.idx,
          type,
          date: addDaysIso(anchorDate, -rng.int(1 + i * 40, 40 + i * 45)),
          score,
          auditor: person(st.idx, auditN),
          findings: Array.from(new Set(Array.from({ length: nf }, () => rng.pick(FINDINGS[type])))),
        });
      }
    }
  }

  // ---- Pricing exceptions ----
  const pricingExceptions: PricingException[] = [];
  for (let i = 0; i < 90; i++) {
    const s = i < 9 ? S118 : rng.int(0, stores.length - 1);
    let k = rng.int(0, NSKU - 1);
    for (let t = 0; t < 20 && !carried[s * NSKU + k]; t++) k = rng.int(0, NSKU - 1);
    const sys = skus[k].price;
    pricingExceptions.push({
      id: `PX-${1001 + i}`,
      storeIdx: s,
      skuIdx: k,
      systemPrice: sys,
      shelfPrice: Math.round(sys * (rng.next() < 0.5 ? rng.range(1.05, 1.25) : rng.range(0.78, 0.95)) * 100) / 100,
      found: addDaysIso(anchorDate, -rng.int(0, 10)),
    });
  }

  // ---- Promotions ----
  const PROMOS = ["Ramadan Essentials", "Weekend Fresh Deals", "Back to School", "Healthy Living Week", "Mega Household Savings", "Baby Week", "Tech Fest", "Summer Beverages", "National Day Offers", "Breakfast Bundle", "Frozen Favourites", "Personal Care Picks"];
  const promotions: Promotion[] = PROMOS.map((name, i) => ({
    id: `PROMO-${201 + i}`,
    name,
    skuIdxs: Array.from({ length: rng.int(15, 40) }, () => rng.int(0, NSKU - 1)),
    discountPct: rng.pick([10, 15, 20, 25, 30]),
    start: addDaysIso(anchorDate, -rng.int(1, 10)),
    end: addDaysIso(anchorDate, rng.int(3, 20)),
    countries: i % 3 === 0 ? ["AE", "SA", "QA", "KW", "OM", "BH"] : [rng.pick(["AE", "SA", "QA", "KW", "OM", "BH"] as CountryCode[])],
    upliftPct: rng.int(12, 65),
  }));

  // ---- Store tasks ----
  const TASKS: Array<[string, StoreTask["type"]]> = [
    ["Opening checklist", "Checklist"],
    ["Closing checklist", "Checklist"],
    ["Cold chain temperature log", "Checklist"],
    ["Refill gaps in beverages aisle", "Replenishment"],
    ["Update shelf labels for price change", "Pricing"],
    ["Set up promotion end-caps", "Pricing"],
    ["Clean freezer condenser coils", "Maintenance"],
    ["Close audit findings", "Audit follow-up"],
    ["Rotate stock (FEFO) in dairy", "Replenishment"],
  ];
  const tasks: StoreTask[] = [];
  let taskN = 1;
  for (const st of stores) {
    const n = 3 + Math.floor(h(st.idx, 0, 41) * 4);
    for (let i = 0; i < n; i++) {
      const [title, type] = TASKS[Math.floor(h(st.idx, i, 42) * TASKS.length)];
      const r = h(st.idx, i, 43);
      tasks.push({
        id: `TSK-${String(taskN++).padStart(4, "0")}`,
        storeIdx: st.idx,
        title,
        type,
        due: addDaysIso(anchorDate, Math.floor(h(st.idx, i, 44) * 5) - 1),
        assignee: person(st.idx, 50 + i),
        status: r < 0.35 ? "Done" : r < 0.6 ? "In progress" : "Open",
      });
    }
  }

  // ---- Existing maintenance tickets ----
  const tickets: Ticket[] = [];
  let tN = 3001;
  for (const [fi, e] of equipment.filter((x) => x.fault).entries()) {
    if (e.storeIdx === S118 || h(fi, 1, 51) < 0.6) continue; // half of current faults have no ticket yet (detected by SCIO)
    tickets.push({
      id: `TKT-${tN++}`,
      equipmentId: e.id,
      storeIdx: e.storeIdx,
      issue: e.fault!.kind,
      priority: e.type === "Freezer" || e.type === "Cold Room" ? "P1" : "P2",
      status: "Assigned",
      technician: TECHNICIANS[Math.floor(h(tN, 2, 51) * TECHNICIANS.length)],
      created: addDaysIso(anchorDate, -1),
      resolved: null,
    });
  }
  for (let i = 0; i < 18; i++) {
    const e = equipment[Math.floor(h(i, 3, 52) * equipment.length)];
    tickets.push({
      id: `TKT-${tN++}`,
      equipmentId: e.id,
      storeIdx: e.storeIdx,
      issue: rng.pick(["Preventive maintenance", "Door gasket replacement", "Receipt printer jam", "Filter replacement", "Compressor noise"]),
      priority: "P3",
      status: "Resolved",
      technician: rng.pick(TECHNICIANS),
      created: addDaysIso(anchorDate, -rng.int(5, 40)),
      resolved: addDaysIso(anchorDate, -rng.int(1, 4)),
    });
  }

  // ---- Store x SKU commercial attributes ----
  const discountPct = new Uint8Array(N);
  const returns30 = new Uint16Array(N);
  const ageDays = new Uint16Array(N);
  const lyVelocity = new Float32Array(N);
  const activePromos = new Map<number, Promotion[]>();
  for (const pr of promotions) if (pr.start <= anchorDate && pr.end >= anchorDate) for (const k of pr.skuIdxs) activePromos.set(k, [...(activePromos.get(k) ?? []), pr]);
  const RETURN_RATE: Record<string, number> = { Electronics: 0.045, "Home & Living": 0.03, "Personal Care": 0.015, Baby: 0.012, Household: 0.01, Grocery: 0.006, "Fresh Food": 0.004, Frozen: 0.004 };
  for (const st of stores) {
    const leakP = st.city === "Dubai" ? 0.1 : 0.012; // unauthorised manual discounting (margin leakage)
    for (let k = 0; k < NSKU; k++) {
      const p = st.idx * NSKU + k;
      if (!carried[p]) continue;
      const sku = skus[k];
      const v = velocity[p];
      // dead stock: slow non-perishables with no sale for 90+ days
      if (!sku.perishable && v < 0.35 && h(st.idx, k, 60) < 0.02) {
        lastSaleDaysAgo[p] = 90 + Math.floor(h(st.idx, k, 61) * 140);
        if (onHand[p] < 3) onHand[p] = 3 + Math.floor(h(st.idx, k, 62) * 18);
      }
      const promo = activePromos.get(k)?.find((pr) => pr.countries.includes(st.country));
      let d = Math.floor(h(st.idx, k, 63) * 4);
      if (promo) d = Math.round(promo.discountPct * (0.55 + h(st.idx, k, 64) * 0.3));
      else if (v >= 0.3 && h(st.idx, k, 65) < leakP) d = 14 + Math.floor(h(st.idx, k, 66) * 19);
      discountPct[p] = d;
      const sold30 = v * Math.max(0, 30 - Math.min(30, lastSaleDaysAgo[p]));
      let rr = (RETURN_RATE[sku.department] ?? 0.008) * (0.6 + h(st.idx, k, 67) * 0.8);
      if (h(st.idx, k, 68) < 0.004 && sold30 > 3) rr = 0.15 + h(st.idx, k, 69) * 0.15; // abnormal returns
      returns30[p] = Math.min(65535, Math.round(sold30 * rr));
      const cover = onHand[p] / Math.max(v, 0.02);
      const age = lastSaleDaysAgo[p] >= 90 ? lastSaleDaysAgo[p] + 20 + h(st.idx, k, 70) * 120 : sku.perishable ? Math.min(sku.shelfLifeDays ?? 30, cover * 0.6 + 1) : Math.min(400, cover * (0.5 + h(st.idx, k, 70) * 0.7) + 3);
      ageDays[p] = Math.min(65535, Math.round(age));
      lyVelocity[p] = sku.status === "New" ? 0 : (v * (st.idx === S118 ? 1.12 + h(st.idx, k, 71) * 0.2 : 0.86 + h(st.idx, k, 71) * 0.22)) / (promo ? 1 + (promo.upliftPct / 100) * 0.7 : 1);
    }
  }

  // ---- Store-day POS facts (120 days) ----
  const storeDays: StoreDay[] = [];
  const WEEKDAY = [0.93, 0.87, 0.89, 0.95, 1.12, 1.24, 1.17]; // GCC week: Thu-Sat peak
  const r2 = (n: number) => Math.round(n * 100) / 100;
  for (const st of stores) {
    let gross = 0;
    let disc = 0;
    let cogs = 0;
    let units = 0;
    let ret = 0;
    for (let k = 0; k < NSKU; k++) {
      const p = st.idx * NSKU + k;
      if (!carried[p]) continue;
      const sku = skus[k];
      const u = (velocity[p] * Math.max(0, 30 - Math.min(30, lastSaleDaysAgo[p]))) / 30;
      gross += u * sku.price;
      disc += (u * sku.price * discountPct[p]) / 100;
      cogs += u * sku.landedCost;
      units += u;
      ret += (returns30[p] / 30) * sku.price;
    }
    const atv = (st.format === "Hypermarket" ? 185 : st.format === "Supermarket" ? 108 : 44) * (0.9 + h(st.idx, 0, 83) * 0.2);
    const conv = (st.format === "Hypermarket" ? 0.66 : st.format === "Supermarket" ? 0.74 : 0.86) * (0.95 + h(st.idx, 0, 84) * 0.1);
    const lfl = st.idx === S118 ? -0.09 : -0.02 + h(st.idx, 0, 80) * 0.09;
    for (let d = 119; d >= 0; d--) {
      const date = addDaysIso(anchorDate, -d);
      let f = WEEKDAY[new Date(date + "T00:00:00Z").getUTCDay()] * (0.94 + h(st.idx, d, 81) * 0.12);
      for (const ev of RETAIL_CALENDAR) if (ev.countries.includes(st.country) && date >= ev.start && date <= ev.end) f *= 1 + Math.max(...Object.values(ev.uplift)) * 0.35;
      if (st.idx === S118 && d < 35) f *= 0.84;
      const g = gross * f;
      // Dubai: unauthorised discounting has been building over the last four weeks
      const leakRamp = st.city === "Dubai" && d < 28 ? 1 + ((28 - d) / 28) * 1.6 : st.city === "Dubai" ? 0.55 : 1;
      const net = g - disc * f * leakRamp - ret * f;
      const txns = Math.max(1, Math.round(net / (atv * (0.95 + h(st.idx, d, 82) * 0.1))));
      storeDays.push({
        storeIdx: st.idx,
        date,
        grossSales: r2(g),
        discounts: r2(disc * f * leakRamp),
        returns: r2(ret * f),
        netSales: r2(net),
        cogs: r2(cogs * f),
        transactions: txns,
        units: Math.round(units * f),
        footfall: Math.round(txns / (conv * (0.95 + h(st.idx, d, 85) * 0.1))),
        lyNetSales: r2((net / (1 + lfl)) * (0.97 + h(st.idx, d, 86) * 0.06)),
        lyTransactions: Math.round(txns / (1 + lfl * 0.7)),
      });
    }
  }

  const basket = basketAffinity(generatePosJournal({ anchorDate, stores, skus, carried, velocity, discountPct }), skus);

  return {
    anchorDate,
    countries: COUNTRIES,
    stores,
    dcs,
    skus,
    suppliers,
    pos,
    equipment,
    audits,
    pricingExceptions,
    promotions,
    tasks,
    tickets,
    carried,
    onHand,
    reserved,
    damaged,
    velocity,
    lastSaleDaysAgo,
    dcStock,
    discountPct,
    returns30,
    ageDays,
    lyVelocity,
    storeDays,
    calendar: RETAIL_CALENDAR,
    basket,
  };
}

// ---- POS journal & basket analysis ---------------------------------------------------

export interface PosTxn {
  id: string;
  storeIdx: number;
  at: string;
  tender: "Card" | "Cash" | "Mobile wallet";
  member: boolean;
  lines: Array<{ skuIdx: number; qty: number; unitPrice: number; discount: number }>;
  total: number;
}

const AFFINITY: Array<[string, string, number]> = [
  ["Bakery", "Dairy & Eggs", 0.5],
  ["Snacks & Confectionery", "Beverages", 0.45],
  ["Meat & Poultry", "Fruits & Vegetables", 0.5],
  ["Canned & Packaged", "Staples", 0.35],
  ["Cleaning", "Paper & Disposables", 0.4],
  ["Frozen Food", "Beverages", 0.25],
  ["Dairy & Eggs", "Bakery", 0.3],
  ["Hair & Body", "Cleaning", 0.2],
];

/** Today's point-of-sale tickets (120 per store), built from store ranges and demand. */
export function generatePosJournal(b: Pick<RetailBase, "anchorDate" | "stores" | "skus" | "carried" | "velocity" | "discountPct">, perStore = 120): PosTxn[] {
  const rng = createRng(SEED + 777);
  const out: PosTxn[] = [];
  for (const st of b.stores) {
    const byCat = new Map<string, { skus: number[]; cum: number[] }>();
    const catWeight = new Map<string, number>();
    for (let k = 0; k < NSKU; k++) {
      const p = st.idx * NSKU + k;
      if (!b.carried[p]) continue;
      const c = b.skus[k].category;
      const e = byCat.get(c) ?? { skus: [], cum: [] };
      const w = b.velocity[p] * b.skus[k].price;
      e.skus.push(k);
      e.cum.push((e.cum[e.cum.length - 1] ?? 0) + w);
      byCat.set(c, e);
      catWeight.set(c, (catWeight.get(c) ?? 0) + w);
    }
    const cats = [...catWeight.entries()];
    const catTotal = cats.reduce((a, [, w]) => a + w, 0);
    const pickCat = () => {
      let r = rng.next() * catTotal;
      for (const [c, w] of cats) if ((r -= w) <= 0) return c;
      return cats[cats.length - 1][0];
    };
    const pickSku = (c: string) => {
      const e = byCat.get(c)!;
      const r = rng.next() * e.cum[e.cum.length - 1];
      let lo = 0;
      let hi = e.cum.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (e.cum[mid] < r) lo = mid + 1;
        else hi = mid;
      }
      return e.skus[lo];
    };
    const meanItems = st.format === "Hypermarket" ? 9 : st.format === "Supermarket" ? 6 : 3;
    for (let t = 0; t < perStore; t++) {
      const n = Math.max(1, Math.round(meanItems * (0.3 + rng.next() * 1.4)));
      const inBasket = new Set<string>();
      const lines: PosTxn["lines"] = [];
      for (let i = 0; i < n; i++) {
        let c = pickCat();
        if (i > 0 && rng.next() < 0.5) {
          const rule = AFFINITY.find(([a, bb]) => inBasket.has(a) && !inBasket.has(bb) && byCat.has(bb));
          if (rule && rng.next() < rule[2] * 1.6) c = rule[1];
        }
        inBasket.add(c);
        const k = pickSku(c);
        if (lines.some((l) => l.skuIdx === k)) continue;
        const sku = b.skus[k];
        const qty = sku.baseUom === "kg" ? Math.round((0.4 + rng.next() * 2) * 100) / 100 : 1 + (rng.next() < 0.2 ? 1 : 0);
        const disc = b.discountPct[st.idx * NSKU + k];
        lines.push({ skuIdx: k, qty, unitPrice: sku.price, discount: Math.round(sku.price * qty * disc) / 100 });
      }
      const minutes = 8 * 60 + Math.floor((t / perStore) * 14 * 60 + rng.next() * 6);
      out.push({
        id: `TXN-${st.id}-${String(t + 1).padStart(4, "0")}`,
        storeIdx: st.idx,
        at: `${b.anchorDate}T${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}:00+04:00`,
        tender: rng.next() < 0.68 ? "Card" : rng.next() < 0.55 ? "Cash" : "Mobile wallet",
        member: rng.next() < 0.42,
        lines,
        total: Math.round(lines.reduce((a, l) => a + l.unitPrice * l.qty - l.discount, 0) * 100) / 100,
      });
    }
  }
  return out;
}

/** Category-pair support, confidence and lift from POS baskets. */
export function basketAffinity(journal: PosTxn[], skus: Sku[]): BasketPair[] {
  const n = journal.length || 1;
  const single = new Map<string, number>();
  const pair = new Map<string, number>();
  for (const t of journal) {
    const cats = [...new Set(t.lines.map((l) => skus[l.skuIdx].category))].sort();
    for (const c of cats) single.set(c, (single.get(c) ?? 0) + 1);
    for (let i = 0; i < cats.length; i++) for (let j = i + 1; j < cats.length; j++) pair.set(`${cats[i]}|${cats[j]}`, (pair.get(`${cats[i]}|${cats[j]}`) ?? 0) + 1);
  }
  const out: BasketPair[] = [];
  for (const [key, cnt] of pair) {
    if (cnt < 25) continue;
    const [x, y] = key.split("|");
    // report the direction with the higher confidence
    for (const [a, b] of [[x, y], [y, x]] as const) {
      const confidence = cnt / single.get(a)!;
      const lift = confidence / (single.get(b)! / n);
      out.push({ a, b, baskets: cnt, support: Math.round((cnt / n) * 10000) / 10000, confidence: Math.round(confidence * 1000) / 1000, lift: Math.round(lift * 100) / 100 });
    }
  }
  return out.sort((p, q) => q.lift - p.lift).slice(0, 40);
}

// The generated dataset lives in Convex (see convex/scioSeed.ts); the app loads it via src/demo/scioData.ts.

/** Chain-level daily units sold for a SKU over the last SALES_DAYS days (deterministic). */
export function skuDailySales(base: RetailBase, k: number, storeIdx?: number): number[] {
  let daily = 0;
  if (storeIdx !== undefined) daily = base.velocity[storeIdx * NSKU + k];
  else for (const s of base.stores) daily += base.velocity[s.idx * NSKU + k];
  const out: number[] = [];
  const today = new Date(base.anchorDate + "T00:00:00Z");
  for (let d = 0; d < SALES_DAYS; d++) {
    const date = new Date(today.getTime() - (SALES_DAYS - d) * DAY);
    const wd = date.getUTCDay();
    const weekly = wd === 4 || wd === 5 ? 1.28 : wd === 6 ? 1.12 : 0.92;
    const trend = 0.92 + (0.16 * d) / SALES_DAYS;
    const noise = 0.82 + h(k, d, storeIdx ?? 999) * 0.36;
    let v = daily * weekly * trend * noise;
    if (storeIdx !== undefined) {
      const p = storeIdx * NSKU + k;
      const lastSale = base.lastSaleDaysAgo[p];
      if (d >= SALES_DAYS - lastSale) v = 0; // no sales while out of stock / phantom
    }
    out.push(Math.round(v * 10) / 10);
  }
  return out;
}

/** Batches for a perishable SKU at a store (FEFO order). */
export function batchesFor(base: RetailBase, s: number, k: number, onHand: number) {
  const sku = base.skus[k];
  if (!sku.perishable || onHand <= 0) return [];
  const shelf = sku.shelfLifeDays ?? 30;
  const v = base.velocity[s * NSKU + k];
  const risky = h(s, k, 61) < 0.06; // an older batch that will not sell through in time
  const out: Array<{ lot: string; qty: number; mfg: string; expiry: string; daysLeft: number }> = [];
  let remaining = onHand;
  const n = onHand > v * 4 ? 3 : onHand > v * 2 ? 2 : 1;
  for (let i = 0; i < n && remaining > 0; i++) {
    const daysLeft = i === 0 ? (risky ? Math.max(1, Math.floor(1 + h(s, k, 62) * Math.min(12, shelf - 1))) : Math.max(1, Math.floor(shelf * (0.35 + h(s, k, 63) * 0.4)))) : Math.floor(shelf * (0.6 + i * 0.15));
    const share =
      i === 0
        ? Math.max(1, Math.min(remaining, Math.round(risky ? v * daysLeft * (1.8 + h(s, k, 64) * 2.2) + 1 : v * daysLeft * 0.7)))
        : i === n - 1
          ? remaining
          : Math.max(1, Math.round(remaining * 0.5));
    remaining -= share;
    out.push({
      lot: `L${(sku.idx * 7 + s * 13 + i * 101).toString(36).toUpperCase().padStart(6, "0")}`,
      qty: share,
      mfg: addDaysIso(base.anchorDate, daysLeft - shelf),
      expiry: addDaysIso(base.anchorDate, daysLeft),
      daysLeft,
    });
  }
  return out;
}

/** Fast check of the oldest batch (no allocation) - used for chain-wide expiry scans. */
export function oldestBatchQuick(base: RetailBase, s: number, k: number, onHand: number): { daysLeft: number; qty: number } | null {
  const sku = base.skus[k];
  if (!sku.perishable || onHand <= 0) return null;
  const shelf = sku.shelfLifeDays ?? 30;
  const v = base.velocity[s * NSKU + k];
  const risky = h(s, k, 61) < 0.06;
  const daysLeft = risky ? Math.max(1, Math.floor(1 + h(s, k, 62) * Math.min(12, shelf - 1))) : Math.max(1, Math.floor(shelf * (0.35 + h(s, k, 63) * 0.4)));
  const qty = Math.max(1, Math.min(onHand, Math.round(risky ? v * daysLeft * (1.8 + h(s, k, 64) * 2.2) + 1 : v * daysLeft * 0.7)));
  return { daysLeft, qty };
}
