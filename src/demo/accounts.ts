import type { RetailRole } from "./retail/rbac";

// Demo personas. They are seeded into Convex (scioAccounts, salted SHA-256
// password hashes) and the password check happens server-side. Passwords
// stay listed here only for the sign-in page's quick role picker.

export interface DemoAccount {
  email: string;
  password: string;
  name: string;
  role: string;
  retailRole: RetailRole;
  scope?: { country?: string; store?: string };
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { email: "omar.almansoori@stellarscio.app", password: "Scio@2026", name: "Omar Al Mansoori", role: "Operations Director", retailRole: "HQ" },
  { email: "sara.alnuaimi@stellarscio.app", password: "Manager@2026", name: "Sara Al Nuaimi", role: "Inventory Manager", retailRole: "Inventory Manager" },
  { email: "layla.haddad@stellarscio.app", password: "Retail@2026", name: "Layla Haddad", role: "Regional Manager · UAE", retailRole: "Regional Manager", scope: { country: "AE" } },
  { email: "faisal.alharbi@stellarscio.app", password: "Retail@2026", name: "Faisal Al Harbi", role: "Store Manager · S118 Riyadh Al Malaz", retailRole: "Store Manager", scope: { store: "S118" } },
  { email: "priya.menon@stellarscio.app", password: "Retail@2026", name: "Priya Menon", role: "Procurement Manager", retailRole: "Procurement" },
];
