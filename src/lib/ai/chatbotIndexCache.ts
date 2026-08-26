// ============================================================================
// STELLAR SCIO CHATBOT SEMANTIC INVERTED INDEX & MULTI-TIER CACHE ENGINE
// Enables instant sub-millisecond retrieval and index caching across all sectors
// ============================================================================

export interface CachedResponse {
  query: string;
  normalizedTokens: string[];
  response: {
    text: string;
    provider: string;
    visualType?: string;
    suggestedAction?: any;
  };
  sector: string;
  timestamp: number;
  hitCount: number;
}

export interface CacheLookupResult {
  hit: boolean;
  matchType: "exact" | "semantic_index" | "live_generated";
  similarityScore: number;
  data: {
    text: string;
    provider: string;
    visualType?: string;
    suggestedAction?: any;
    cacheMeta?: {
      hit: boolean;
      matchType: string;
      similarityScore: number;
      latencyMs: number;
      indexSize: number;
    };
  } | null;
}

// Stop words to strip for high-precision semantic matching
const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "if", "then", "else", "when",
  "at", "by", "for", "with", "about", "against", "between", "into", "through",
  "during", "before", "after", "above", "below", "to", "from", "up", "down",
  "in", "out", "on", "off", "over", "under", "again", "further", "then", "once",
  "here", "there", "when", "where", "why", "how", "all", "any", "both", "each",
  "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only",
  "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just",
  "don", "should", "now", "tell", "me", "what", "is", "are", "do", "does", "explain",
  "show", "give", "please", "our", "we", "us", "i", "my", "your", "you", "details",
  "overview", "system", "scio", "stellar"
]);

/**
 * Normalizes text, removes punctuation & stop words, and creates stemmed tokens
 */
export function tokenizeQuery(text: string): string[] {
  if (!text) return [];
  const clean = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = clean.split(" ");
  const tokens: string[] = [];

  for (const w of words) {
    if (w.length < 2 || STOP_WORDS.has(w)) continue;
    
    // Basic domain stemming
    let stem = w;
    if (stem.endsWith("ing") && stem.length > 5) stem = stem.slice(0, -3);
    else if (stem.endsWith("tions") && stem.length > 6) stem = stem.slice(0, -5) + "t";
    else if (stem.endsWith("tion") && stem.length > 5) stem = stem.slice(0, -4) + "t";
    else if (stem.endsWith("ies") && stem.length > 4) stem = stem.slice(0, -3) + "y";
    else if (stem.endsWith("es") && stem.length > 4) stem = stem.slice(0, -2);
    else if (stem.endsWith("s") && stem.length > 3) stem = stem.slice(0, -1);

    if (stem && !tokens.includes(stem)) {
      tokens.push(stem);
    }
  }

  return tokens;
}

/**
 * Computes semantic similarity (Weighted Jaccard + Token Overlap) between two token arrays
 */
export function computeTokenSimilarity(tokensA: string[], tokensB: string[]): number {
  if (!tokensA.length || !tokensB.length) return 0;
  
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  
  let intersection = 0;
  for (const t of setA) {
    if (setB.has(t)) {
      intersection++;
    } else {
      // Partial prefix match
      for (const tb of setB) {
        if ((t.length > 3 && tb.startsWith(t)) || (tb.length > 3 && t.startsWith(tb))) {
          intersection += 0.85;
          break;
        }
      }
    }
  }

  const union = setA.size + setB.size - intersection;
  if (union <= 0) return 0;
  
  const jaccard = intersection / union;
  const coverageA = intersection / setA.size;
  const coverageB = intersection / setB.size;

  // Blended harmonic score
  return (jaccard * 0.4) + (Math.max(coverageA, coverageB) * 0.6);
}

// In-Memory Global Semantic Cache Index across requests
class SectorChatbotIndexCache {
  private sectorIndices: Map<string, CachedResponse[]> = new Map();
  private maxPerSector = 250;

  constructor() {
    this.seedDefaultKnowledge();
  }

  /**
   * Look up query in the sector's inverted index & semantic cache
   */
  public lookup(sector: string, rawQuery: string, similarityThreshold = 0.68): CacheLookupResult {
    const startTime = performance.now();
    const cleanQuery = rawQuery.trim().toLowerCase();
    const queryTokens = tokenizeQuery(cleanQuery);
    const sectorPool = this.sectorIndices.get(sector) || [];

    if (!queryTokens.length || !sectorPool.length) {
      return {
        hit: false,
        matchType: "live_generated",
        similarityScore: 0,
        data: null
      };
    }

    // 1. Exact Normalized Match (L1 Cache)
    for (const entry of sectorPool) {
      if (entry.query.trim().toLowerCase() === cleanQuery) {
        entry.hitCount++;
        const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;
        return {
          hit: true,
          matchType: "exact",
          similarityScore: 1.0,
          data: {
            ...entry.response,
            provider: `${entry.response.provider} (Cached L1)`,
            cacheMeta: {
              hit: true,
              matchType: "Exact Hash Cache",
              similarityScore: 1.0,
              latencyMs,
              indexSize: sectorPool.length
            }
          }
        };
      }
    }

    // 2. Semantic Token Index Match (L2 Semantic Cache)
    let bestMatch: CachedResponse | null = null;
    let highestSimilarity = 0;

    for (const entry of sectorPool) {
      const score = computeTokenSimilarity(queryTokens, entry.normalizedTokens);
      if (score > highestSimilarity) {
        highestSimilarity = score;
        bestMatch = entry;
      }
    }

    if (bestMatch && highestSimilarity >= similarityThreshold) {
      bestMatch.hitCount++;
      const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;
      return {
        hit: true,
        matchType: "semantic_index",
        similarityScore: Math.round(highestSimilarity * 100) / 100,
        data: {
          ...bestMatch.response,
          provider: `${bestMatch.response.provider} (Indexed Cache · ${Math.round(highestSimilarity * 100)}% Match)`,
          cacheMeta: {
            hit: true,
            matchType: "Semantic Inverted Index",
            similarityScore: Math.round(highestSimilarity * 100) / 100,
            latencyMs,
            indexSize: sectorPool.length
          }
        }
      };
    }

    return {
      hit: false,
      matchType: "live_generated",
      similarityScore: Math.round(highestSimilarity * 100) / 100,
      data: null
    };
  }

  /**
   * Save a newly synthesized AI answer into the sector index cache
   */
  public store(
    sector: string,
    rawQuery: string,
    response: { text: string; provider: string; visualType?: string; suggestedAction?: any }
  ): void {
    if (!rawQuery.trim() || !response.text.trim()) return;

    const queryTokens = tokenizeQuery(rawQuery);
    if (!this.sectorIndices.has(sector)) {
      this.sectorIndices.set(sector, []);
    }

    const pool = this.sectorIndices.get(sector)!;

    // Remove if exact duplicate exists
    const cleanQuery = rawQuery.trim().toLowerCase();
    const existingIndex = pool.findIndex(e => e.query.trim().toLowerCase() === cleanQuery);
    if (existingIndex >= 0) {
      pool.splice(existingIndex, 1);
    }

    // Insert at front (LRU strategy)
    pool.unshift({
      query: rawQuery.trim(),
      normalizedTokens: queryTokens,
      response: {
        ...response,
        // Strip previous cached tags from provider before saving
        provider: response.provider.replace(/\s*\(Cached.*?\)/g, "").replace(/\s*\(Indexed.*?\)/g, "").trim()
      },
      sector,
      timestamp: Date.now(),
      hitCount: 1
    });

    // Enforce max capacity per sector
    if (pool.length > this.maxPerSector) {
      pool.pop();
    }
  }

  /**
   * Pre-seed high-value industrial knowledge into the inverted index
   */
  private seedDefaultKnowledge() {
    // HOMEPAGE KNOWLEDGE SEEDS
    this.store("homepage", "Explain how SCIO works in 4 simple steps: Connect, Understand, Predict, Act.", {
      text: `**Stellar SCIO 4-Step Process**:\n\n` +
        `• **1. CONNECT**: Connects live sensor data from PLCs, SCADA, and IoT systems without requiring any hardware replacement.\n` +
        `• **2. UNDERSTAND**: Combines machine telemetry with equipment manuals, parts lists, and repair history into a live digital twin.\n` +
        `• **3. PREDICT**: Analyzes machine vibration and temperature trends to catch equipment wear 14 to 21 days before failure.\n` +
        `• **4. ACT**: Automatically creates maintenance work orders and orders required spare parts in SAP S/4HANA PM and IBM Maximo.`,
      provider: "Stellar SCIO Platform AI",
      suggestedAction: { type: "scroll", label: "View How SCIO Works (4 Steps)", payload: "#how-it-works" }
    });

    this.store("homepage", "Which 4 industries does SCIO support and what are the main features?", {
      text: `**Stellar SCIO Supported Industries**:\n\n` +
        `• **Renewable Energy & Power Grid**: Power generation monitoring, wind/solar panel health, and battery storage.\n` +
        `• **Maritime Fleet Operations**: Live ship GPS tracking, engine status, fuel consumption logs, and safety inspection checklists.\n` +
        `• **Manufacturing 4.0 & OEE**: Factory OEE tracking across robotic cells, downtime cause analysis, and machine tool wear.\n` +
        `• **Cold-Chain Logistics**: Temperature tracking for refrigerated containers, shipment delay predictions, and warehouse spare parts stock.`,
      provider: "Stellar SCIO Platform AI",
      suggestedAction: { type: "scroll", label: "Explore 4 Sector Hubs", payload: "#industries" }
    });

    // ENERGY KNOWLEDGE SEEDS
    this.store("energy", "Check wind turbine gearbox health and vibration monitoring", {
      text: `**Wind Turbine Health & Diagnostics**:\n\n` +
        `• **Vibration Analysis**: Monitors generator bearings and gearbox vibration patterns to catch wear weeks before breakdown.\n` +
        `• **Blade Pitch Drive**: Tracks hydraulic torque spikes and temperature variations to prevent blade pitch jamming.\n` +
        `• **Generation Output**: Helps sustain optimal power output while protecting mechanical components during heavy wind gusts.`,
      provider: "Renewable Energy AI Assistant",
      suggestedAction: { type: "launch_occ", label: "View Renewable Energy Control Tower", payload: { industry: "energy", tab: "energy-dashboard" } }
    });

    // MARITIME KNOWLEDGE SEEDS
    this.store("maritime", "How does SCIO track ship fuel levels and consumption?", {
      text: `**Maritime Fleet Fuel & Bunker Monitoring**:\n\n` +
        `• **Tank Levels**: Continuous sensor monitoring of fuel tank levels (HFO and MGO) in metric tons.\n` +
        `• **Daily Fuel Burn Rate**: Compares fuel consumption against vessel speed to recommend fuel-efficient sailing speeds.\n` +
        `• **Port Bunkering**: Flags refueling needs days before arrival so bunker fuel delivery can be scheduled at the next port berth.`,
      provider: "Maritime Fleet AI Assistant",
      suggestedAction: { type: "launch_occ", label: "Launch Maritime Fleet Control Center", payload: { industry: "maritime", tab: "dashboard" } }
    });

    // MANUFACTURING KNOWLEDGE SEEDS
    this.store("manufacturing", "Explain how SCIO calculates real-time OEE across Availability, Performance, and Quality", {
      text: `**Factory OEE Breakdown (91.4%)**:\n\n` +
        `• **Availability**: Tracks machine uptime vs planned downtime for tool changes or maintenance.\n` +
        `• **Performance**: Compares actual machine cycle speeds against rated speeds, flagging short conveyor jams and micro-stoppages.\n` +
        `• **Quality**: Camera vision AI inspects 100% of manufactured parts to isolate defect clusters and stop defective batches.`,
      provider: "Manufacturing AI Assistant",
      suggestedAction: { type: "launch_occ", label: "Launch Manufacturing 4.0 Control Center", payload: { industry: "manufacturing", tab: "dashboard" } }
    });

    // LOGISTICS KNOWLEDGE SEEDS
    this.store("logistics", "Check live temperature telemetry across all refrigerated reefers for excursion breaches", {
      text: `**Cold-Chain Container Temperature Control**:\n\n` +
        `• **Live Temperature Tracking**: IoT sensors transmit core container temperature every 15 seconds across refrigerated reefers.\n` +
        `• **Temperature Alerts**: Instant alerts trigger when container temperatures drift outside the safe range (-25°C to +4°C).\n` +
        `• **Shipment Delay Warnings**: Predicts port delays so depot crews can prepare backup generators and protect cargo.`,
      provider: "Supply Chain AI Assistant",
      suggestedAction: { type: "launch_occ", label: "Launch Supply Chain Control Center", payload: { industry: "logistics", tab: "dashboard" } }
    });
  }
}

// Global Singleton Instance
export const chatbotIndexCache = new SectorChatbotIndexCache();
