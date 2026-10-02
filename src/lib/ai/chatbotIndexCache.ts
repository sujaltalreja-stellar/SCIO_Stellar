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
    // Dynamic initialization - knowledge is served dynamically via skillEmbeddings vector engine
  }
}

// Global Singleton Instance
export const chatbotIndexCache = new SectorChatbotIndexCache();
