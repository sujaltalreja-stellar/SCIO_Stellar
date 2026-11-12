import React, { useEffect, useState } from "react";
import { scioHeaders } from "../auth";
import { Sparkles } from "lucide-react";

// Fetches and shows a plain-language AI explanation for an asset or inventory item.
export default function AiExplain({ kind, id }: { kind: "asset" | "item"; id: string }) {
  const [text, setText] = useState<string>("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  useEffect(() => {
    setText("");
    setState("idle");
  }, [kind, id]);

  const run = async () => {
    setState("loading");
    try {
      const res = await fetch("/api/scio/explain", {
        method: "POST",
        headers: scioHeaders(),
        body: JSON.stringify({ kind, id }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Failed");
      setText(data.explanation);
      setState("done");
    } catch (e: any) {
      setText(e?.message || "Could not generate an explanation.");
      setState("error");
    }
  };

  const render = (s: string) =>
    s.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
      p.startsWith("**") && p.endsWith("**") ? (
        <strong key={i} className="font-semibold text-slate-900">
          {p.slice(2, -2)}
        </strong>
      ) : (
        <React.Fragment key={i}>{p}</React.Fragment>
      )
    );

  return (
    <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-blue-700">
          <Sparkles className="h-4 w-4 text-blue-700" /> SCIO insight
        </span>
        {state !== "loading" && (
          <button onClick={run} className="rounded-lg border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50">
            {state === "idle" ? "Explain" : "Regenerate"}
          </button>
        )}
      </div>
      {state === "loading" && (
        <div className="mt-3 space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-slate-100" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
        </div>
      )}
      {state === "idle" && <p className="mt-2 text-xs text-slate-500">Get a plain-language explanation and recommended priority.</p>}
      {(state === "done" || state === "error") && (
        <p className={`mt-2.5 text-sm leading-relaxed ${state === "error" ? "text-rose-600" : "text-slate-600"}`}>{render(text)}</p>
      )}
    </div>
  );
}
