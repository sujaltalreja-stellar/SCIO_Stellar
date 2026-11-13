// Shared contract between the Ask SCIO API and UI.

export type CellValue = string | number | null;

export interface TableVisual {
  kind: "table";
  title: string;
  columns: Array<{ key: string; label: string; format?: "money" | "number" | "percent" | "days" | "text" }>;
  rows: Array<Record<string, CellValue>>;
}

export interface ChartVisual {
  kind: "bar" | "hbar" | "line" | "pie";
  title: string;
  xKey: string;
  series: Array<{ key: string; label: string }>;
  format?: "money" | "number" | "percent" | "days";
  rows: Array<Record<string, CellValue>>;
}

export type Visual = TableVisual | ChartVisual;

export interface CopilotTurn {
  role: "user" | "assistant";
  content: string;
}

export interface CopilotResponse {
  answer: string;
  visuals: Visual[];
  toolsUsed: string[];
  followUps: string[];
  /** What SCIO did to reach the answer, in order. */
  steps?: string[];
  /** Places in the app where the user can act on the answer. */
  actions?: Array<{ label: string; to: string }>;
  /** Actions SCIO drafted for the user to approve (agentic mode). */
  proposals?: ActionProposal[];
  /** Structured answer for the Operations assistant (card mode). */
  card?: AnswerCard;
  error?: string;
}

export type ProposalKind = "transfer" | "reorder" | "technician" | "markdown";

/** A batch of concrete operations SCIO drafted; executed in the browser only after approval. */
export interface ActionProposal {
  id: string;
  kind: ProposalKind;
  title: string;
  detail: string;
  impact: number; // AED protected
  /** ids of the stockout / equipment / expiry rows to act on */
  itemIds: string[];
}

export interface AnswerCard {
  headline: string;
  summary: string;
  kpis: Array<{ label: string; value: string; note?: string; tone?: "good" | "bad" | "neutral" }>;
  drivers: Array<{ title: string; detail: string; impact?: string }>;
  next: string[];
}
