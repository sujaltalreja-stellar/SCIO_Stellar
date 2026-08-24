# Stellar SCIO Platform - Utilities & Energy Operations Center (OCC)

Welcome to the **Stellar SCIO Utilities & Energy** control platform. This workspace provides real-time SCADA telemetry visualization, asset diagnostics, automated work dispatch, MRO inventory tracking, PPA financial accounting, and compliance validation.

---

## 1. Centralized OCC Dashboard (Central Operations Room)

The **Central Operations Room** provides a command-center view of the entire renewable energy fleet with heavy data visualizations:
* **Cumulative Grid Performance Status Tiles**: Shows total Carbon CO₂ Offsets (tonnes), green share ratio, spinning reserves capacity (MW), and SCADA average equipment health.
* **Live Energy Dispatch Comparison Chart (Area Chart)**: Real-time Recharts visual plotting live Solar yields, Wind generator yields, and active Battery (BESS) charging/discharging curves matched against current Grid Demand Load (MW) over a rolling 24-hour window.
* **Sourced Fuel Distribution Progress Indicators**: Breaks down the active generation mix percentage wise across Solar PV, Wind Ridge, and BESS capacity blocks.
* **Grid Stabilizer Advisory Console**: Diagnostic guidelines recommending adjustments based on grid load variations.

---

## 2. SCIO Flow Explorer (Linear Grid Path)

* **Interactive Texas Grid map (ERCOT)**: SVG outline with animated dash-array transmission lines showing active energy transfers between West Texas generation zones (El Paso), Northern wind clusters (Abilene), and Central substation nodes (Austin).
* **Sequential Node Diagnostics Ticker**: Allows operators to step through the linear path (Infrastructure ➔ Site ➔ Asset ➔ Field Job ➔ Condition ➔ Maintenance ➔ Materials ➔ Supply ➔ Compliance ➔ Intelligence) with individual node health logs.

---

## 3. Grid Infrastructure & Plants Registry

* **Fleet Database Directory**: Full searchable, categorizable registry of all 9 active plants in the mock database (Mojave Solar One, Desert Sunlight, Hornsdale Storage, sweetwater Wind, etc.).
* **Telemetry Diagnostics**: Dynamically displays plant-specific metrics like ambient temperature, solar irradiance (W/m²), rotor RPM, blade pitch angles, and grid AC voltage profiles.
* **Seeded Equipment Tables**: Full inventory lists showing every physical asset deployed at the plant, its manufacturer, serial number, and dynamic health factor.
* **Live Incident Warnings**: Active alarms console allowing operators to acknowledge or resolve SCADA alerts instantly.

---

## 4. Equipment Reliability & AI Diagnostics

* **MTBF & MTTR Gauges**: Displays Mean Time Between Failures and Mean Time To Repair indicators.
* **SCIO Copilot Predictive Health Insights**: Feeds anomalies, risks, and optimization insights directly to the operator with confidence scores and recommended root-cause actions.

---

## 5. Warehouse Inventory, Requisitions, & ERP Sync

* **Critical Spares Inventory**: Tracks warehouse stock levels, part allocations, unit costs, and reorder levels.
* **Purchase Requisitions approvals workflow**: Automates parts order generation when stock falls below safety threshold. Dispatches purchase orders (POs) and updates locked maintenance schedules upon manual approval.
* **SAP / Maximo ERP Sync Connectors**: Direct pipeline synchronization logs. Operators can manually sync inventory levels and invoice ledgers using the **Trigger ERP Sync** button.

---

## 6. Under the Hood: Reactive SCADA Architecture

* **TypeScript Data Store (`energyMockDb.ts`)**: Seeding configuration class (`MockDbStore`) acting as a reactive client-side database. It implements a pub-sub listener pattern (`subscribe`/`notify`) ensuring Next.js components re-render reactively when state mutations occur.
* **Background Telemetry Loop**: An active 5-second interval loop that simulates weather conditions and fluctuates live generation metrics.
* **Glassmorphism Design Theme (`globals.css`)**: Shifted all style variables to a deep Obsidian background (`#030404`) highlighted with vibrant neon green accent lines (`#00ff66` / `#39ff14`) to deliver a high-contrast command center interface.
