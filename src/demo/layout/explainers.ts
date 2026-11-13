// Plain business-language explanations for each module, shown by "Explain this page".

export interface Explainer {
  title: string;
  what: string; // what the page shows
  why: string; // why it matters to the business
  how: string[]; // how to use it
  terms?: Array<[string, string]>; // jargon explained
  ask?: string; // a good question to ask SCIO next
}

const R = "/app/retail";

export const EXPLAINERS: Array<{ match: (p: string) => boolean; e: Explainer }> = [
  {
    match: (p) => p.startsWith(`${R}/ask`),
    e: {
      title: "Ask SCIO",
      what: "A conversation with your whole business. SCIO reads sales, stock, suppliers, staff and equipment from your existing systems and answers in plain words.",
      why: "Managers get answers in seconds instead of opening five systems and building a report. It also proposes fixes you can approve on the spot.",
      how: ["Type a question the way you'd ask a colleague.", "Tap a status number to ask about it.", "When SCIO drafts actions, review and press Approve — nothing happens without you."],
      terms: [["Sources", "The systems an answer came from, e.g. POS for sales, P2P for supplier orders."], ["Approve", "Turns SCIO's suggestion into a real transfer, order or ticket."]],
      ask: "What should I focus on today?",
    },
  },
  {
    match: (p) => p.startsWith(`${R}/intelligence`),
    e: {
      title: "Intelligence",
      what: "The few signals that matter most, connected across systems: money being lost today, why it's happening, what will run out next, and what SCIO has already saved.",
      why: "Your ERP records transactions in one system. This page joins them up to show causes and money impact — things no single system can see.",
      how: ["Start with ‘Money leaking today’.", "Read the ‘Why’ chain to see the root cause across systems.", "Tap ‘Ask’ on any card, or ‘Fix with SCIO’ to act."],
      terms: [["Phantom stock", "Items the system says you have, but that aren't selling — usually lost, stolen or in the back room."], ["True supplier cost", "Lost sales caused by a supplier's late deliveries, on top of the invoice price."]],
      ask: "Where am I losing the most money and how do I stop it?",
    },
  },
  {
    match: (p) => p === R || p === `${R}/`,
    e: {
      title: "Home",
      what: "A one-minute view of the day: a short summary, three headline numbers and the three most important actions.",
      why: "So every manager starts the day knowing what needs attention first, without reading a dashboard.",
      how: ["Read the summary line.", "Work through Priority Actions from top to bottom.", "Ask the SCIO agent if anything is unclear."],
      terms: [["Health score", "One number (0–100) combining sales vs target, shelf availability and critical issues."]],
      ask: "Explain today's situation simply.",
    },
  },
  {
    match: (p) => p.startsWith(`${R}/actions`),
    e: {
      title: "Actions",
      what: "Every open problem SCIO has detected, ranked by money at stake, with the system it came from, who owns it and its status.",
      why: "It turns alerts into accountable work: nothing gets lost between teams, and you can see what's being handled.",
      how: ["Click a row to see the AI insight and recommended action.", "Press ‘Start working’ to take ownership, ‘Mark resolved’ when done.", "Use the tabs to see urgent, in-progress or resolved items."],
      terms: [["Business impact", "Estimated AED at risk if the issue isn't fixed."], ["Urgent", "Critical issues that need action today."]],
      ask: "Which actions should my team do first?",
    },
  },
  {
    match: (p) => p.startsWith(`${R}/stores`),
    e: {
      title: "Stores",
      what: "How every store is performing against its sales target, which ones need attention, and the main reason for each.",
      why: "Regional and store managers can focus visits and support where money is being lost, not where it's loudest.",
      how: ["Check the Critical and Below target counts.", "Use the map or table to pick a store.", "Click a store for its full diagnosis."],
      terms: [["vs target", "Sales achieved as a % of the store's monthly target."], ["On-shelf availability", "Share of products actually available to buy."]],
      ask: "Which store needs my attention most and why?",
    },
  },
  {
    match: (p) => p.startsWith(`${R}/skus`),
    e: {
      title: "SKU Intelligence",
      what: "Every product (SKU) with its price, margin, stock, daily sales and how many stores have run out.",
      why: "Helps buyers and category managers spot products that are selling out, sitting idle or tying up cash.",
      how: ["Tap a tile (Out of stock, Running low, Overstocked) to filter.", "Open a product to see stock by store and act.", "Use ‘Ask about SKUs’ for quick questions."],
      terms: [["SKU", "A single sellable product, e.g. ‘Orange Juice 1 L’."], ["Days of supply", "How many days current stock will last at today's sales rate."]],
      ask: "Which products should I reorder this week?",
    },
  },
  {
    match: (p) => p.startsWith(`${R}/replenishment`),
    e: {
      title: "Inventory & Replenishment",
      what: "Work queues for stock problems: items about to run out, phantom stock, excess stock and expiring batches — each with a recommended fix.",
      why: "Keeps shelves full without over-ordering, cutting lost sales and waste at the same time.",
      how: ["Pick a tab.", "Use the suggested transfer, order, count or markdown.", "Approve in bulk where it makes sense."],
      terms: [["Transfer", "Moving stock from a store or warehouse that has too much to one that's short."], ["Markdown", "A discount to sell stock before it expires."]],
      ask: "What's the fastest way to fix today's stockouts?",
    },
  },
  {
    match: (p) => p.startsWith(`${R}/procurement`),
    e: {
      title: "Procurement",
      what: "Purchase orders from creation to delivery, including partial deliveries and invoice mismatches.",
      why: "Ensures you pay only for what arrived, at the agreed price, and that orders arrive in time to sell.",
      how: ["Review open and late orders.", "Check discrepancies before paying invoices.", "Create new orders when SCIO recommends them."],
      terms: [["PO", "Purchase order — your official order to a supplier."], ["3-way match", "Checking the order, the delivery and the invoice agree before paying."]],
      ask: "Which purchase orders are at risk?",
    },
  },
  {
    match: (p) => p.startsWith(`${R}/suppliers`),
    e: {
      title: "Suppliers",
      what: "A scorecard for every supplier: on-time delivery, how complete their deliveries are, delays and risk.",
      why: "The cheapest supplier isn't always the best — late deliveries cost lost sales. This shows the real picture for negotiations.",
      how: ["Sort by risk or on-time rate.", "Open late deliveries to see which stores are affected.", "Use it in supplier reviews."],
      terms: [["On-time rate", "Share of deliveries that arrived by the promised date."], ["Fill rate", "Share of ordered units actually delivered."]],
      ask: "Which supplier is costing me the most?",
    },
  },
  {
    match: (p) => p.startsWith(`${R}/transfers`),
    e: {
      title: "Transfers",
      what: "Stock moving between stores and warehouses: requested, approved, in transit and received.",
      why: "Using stock you already own is faster and cheaper than ordering more.",
      how: ["Approve requested transfers.", "Mark transfers received when they arrive."],
      ask: "Which transfers are still pending?",
    },
  },
  {
    match: (p) => p.startsWith(`${R}/maintenance`) || p.startsWith(`${R}/assets`),
    e: {
      title: "Maintenance & Assets",
      what: "Store equipment (fridges, freezers, AC, tills, generators) with live sensor readings, faults and repair tickets.",
      why: "A broken freezer means spoiled stock and lost sales. Catching faults early protects both.",
      how: ["Check faults with stock at risk first.", "Create a ticket and assign a technician.", "Track tickets until resolved."],
      terms: [["IoT", "Sensors on equipment that send readings like temperature in real time."], ["CMMS", "The maintenance system that tracks repairs and work orders."]],
      ask: "Which equipment faults are putting stock at risk?",
    },
  },
  {
    match: (p) => p.startsWith(`${R}/inspection`),
    e: {
      title: "Inspection",
      what: "Store audits and photo checks for shelves, pricing, hygiene, safety and cold chain.",
      why: "Keeps standards consistent across stores and catches problems customers would notice.",
      how: ["Review recent audit scores.", "Assign follow-ups for failed checks.", "Upload a shelf photo for AI inspection."],
      ask: "Which stores have the worst audit results?",
    },
  },
  {
    match: (p) => p.startsWith(`${R}/master`) || p.startsWith(`${R}/insights`),
    e: {
      title: "Insights",
      what: "Detailed analysis across sales, inventory, supply chain and risk, with drill-down dashboards for each figure.",
      why: "For deeper reviews and management meetings when you need the full numbers behind a decision.",
      how: ["Click any figure to open its dashboard.", "Switch between 7, 30 and 90 days."],
      terms: [["LFL", "Like-for-like: growth in stores open in both periods."], ["GMROI", "Gross margin earned per AED invested in stock."]],
      ask: "Summarise this month's performance for my management meeting.",
    },
  },
  {
    match: (p) => p.startsWith(`${R}/documents`),
    e: { title: "Documents", what: "Invoices, delivery notes and other documents, read automatically by AI and matched to orders.", why: "Removes manual data entry and catches billing errors before you pay.", how: ["Open a document to see what SCIO extracted.", "Check flagged mismatches."], ask: "Which invoices don't match their orders?" },
  },
  {
    match: (p) => p.startsWith(`${R}/reports`),
    e: { title: "Reports", what: "Ready-to-print reports generated from live data.", why: "Share consistent numbers with management, owners or auditors in one click.", how: ["Pick a report.", "Print or save it as PDF."] },
  },
  {
    match: (p) => p.startsWith(`${R}/settings`),
    e: {
      title: "Settings",
      what: "Connected systems, alert thresholds, roles and permissions, currencies and the full audit trail.",
      why: "Controls what SCIO watches, who can approve what, and keeps a record of every action for compliance.",
      how: ["Connected Systems shows every data source and its sync status.", "Thresholds set when SCIO raises an alert.", "Roles decide who can approve transfers, orders and tickets."],
      terms: [["Audit trail", "A permanent log of who did what and when."]],
    },
  },
  {
    match: (p) => p === "/app" || p === "/app/",
    e: { title: "Industrial dashboard", what: "Plant and asset health, inventory, maintenance and procurement for industrial operations.", why: "One view of what's running, what's at risk and what to fix first.", how: ["Check critical issues first.", "Open a module for details."], ask: "What are today's critical issues?" },
  },
  {
    match: (p) => p.startsWith("/app/inventory"),
    e: { title: "Inventory (industrial)", what: "Spare parts and materials with stock levels, usage and reorder needs.", why: "Avoids downtime from missing parts while keeping cash out of excess stock.", how: ["Check items below reorder point.", "Raise purchase requests."] },
  },
  {
    match: (p) => p.startsWith("/app/maintenance") || p.startsWith("/app/assets"),
    e: { title: "Maintenance & Assets (industrial)", what: "Equipment health, sensor alerts and work orders.", why: "Predicting failures avoids unplanned shutdowns and costly repairs.", how: ["Review assets at risk.", "Create and track work orders."] },
  },
  {
    match: (p) => p.startsWith("/app/procurement"),
    e: { title: "Procurement (industrial)", what: "Purchase requests and orders for parts and materials.", why: "Gets the right parts on time at the right price.", how: ["Approve pending requests.", "Follow up late orders."] },
  },
];

export function explainerFor(pathname: string): Explainer | null {
  return EXPLAINERS.find((x) => x.match(pathname))?.e ?? null;
}
