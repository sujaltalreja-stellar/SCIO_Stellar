// Role-based access for SCIO Retail OS (demo).

export type RetailRole = "HQ" | "Regional Manager" | "Store Manager" | "Procurement" | "Inventory Manager";

export type Permission =
  | "transfer.create"
  | "transfer.approve"
  | "transfer.receive"
  | "po.create"
  | "po.approve"
  | "po.receive"
  | "count.run"
  | "markdown.apply"
  | "ticket.create"
  | "ticket.assign"
  | "ticket.resolve"
  | "alert.manage"
  | "price.fix"
  | "task.update"
  | "settings.thresholds";

const ALL: Permission[] = [
  "transfer.create",
  "transfer.approve",
  "transfer.receive",
  "po.create",
  "po.approve",
  "po.receive",
  "count.run",
  "markdown.apply",
  "ticket.create",
  "ticket.assign",
  "ticket.resolve",
  "alert.manage",
  "price.fix",
  "task.update",
  "settings.thresholds",
];

export const ROLE_PERMISSIONS: Record<RetailRole, Permission[]> = {
  HQ: ALL,
  "Regional Manager": ["transfer.create", "transfer.approve", "markdown.apply", "ticket.create", "ticket.assign", "ticket.resolve", "alert.manage", "price.fix", "task.update", "count.run"],
  "Store Manager": ["transfer.create", "transfer.receive", "po.receive", "count.run", "markdown.apply", "ticket.create", "ticket.assign", "ticket.resolve", "alert.manage", "price.fix", "task.update"],
  Procurement: ["po.create", "po.approve", "po.receive", "alert.manage", "transfer.create"],
  "Inventory Manager": ["transfer.create", "transfer.approve", "transfer.receive", "po.create", "po.receive", "count.run", "markdown.apply", "alert.manage", "ticket.create"],
};

export const ROLE_DESCRIPTION: Record<RetailRole, string> = {
  HQ: "All countries and stores · all actions · configures thresholds",
  "Regional Manager": "Stores in assigned country · approves transfers and markdowns",
  "Store Manager": "Own store only · receives stock, counts, markdowns, tickets",
  Procurement: "All stores · creates and approves purchase orders",
  "Inventory Manager": "All stores · transfers, replenishment, cycle counts",
};

export function can(role: RetailRole | undefined, perm: Permission) {
  return !!role && ROLE_PERMISSIONS[role].includes(perm);
}
