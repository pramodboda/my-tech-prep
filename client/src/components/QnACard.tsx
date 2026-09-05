import { useState, useRef, useCallback } from "react";
import type { Question } from "../types";
import RichEditor from "./RichEditor";
import { api } from "../lib/api";

interface Props {
  question: Question;
  onLocalUpdate: (q: Question) => void;
  onDelete: () => void;
}

// Debounces PATCH calls so we don't hit the API on every keystroke
function useDebouncedSave(delayMs = 500) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  return useCallback(
    (fn: () => void) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(fn, delayMs);
    },
    [delayMs],
  );
}

export default function QnACard({ question, onLocalUpdate, onDelete }: Props) {
  const [mode, setMode] = useState<"deep" | "short">("deep");
  const isDeep = mode === "deep";
  const debounce = useDebouncedSave();

  function change(patch: Partial<Question>) {
    const updated = { ...question, ...patch };
    onLocalUpdate(updated);
    debounce(() => {
      api.updateQuestion(question.id, patch).catch(() => {
        // best-effort: a toast/retry system is a good next addition
      });
    });
  }

  return (
    <div
      className="rounded-xl border bg-surface p-5 mb-4 transition-colors"
      style={{
        borderColor: isDeep ? "var(--color-deep)" : "var(--color-short)",
      }}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <input
          value={question.question}
          onChange={(e) => change({ question: e.target.value })}
          placeholder="Question…"
          className="flex-1 font-sans font-semibold text-lg bg-transparent outline-none placeholder:text-ink-soft/50"
        />
        <button
          onClick={onDelete}
          className="no-print text-xs text-ink-soft hover:text-red-600 shrink-0 mt-1"
        >
          Delete
        </button>
      </div>

      <div className="no-print inline-flex rounded-full border border-border p-0.5 mb-3 text-sm">
        <button
          onClick={() => setMode("deep")}
          className={`px-3 py-1 rounded-full transition-colors ${isDeep ? "bg-deep text-white" : "text-ink-soft"}`}
        >
          Deep
        </button>
        <button
          onClick={() => setMode("short")}
          className={`px-3 py-1 rounded-full transition-colors ${!isDeep ? "bg-short text-white" : "text-ink-soft"}`}
        >
          Short
        </button>
      </div>

      {isDeep ? (
        <RichEditor
          mode="deep"
          content={question.deepAnswer}
          placeholder="Write the full, deep explanation…"
          onChange={(html) => change({ deepAnswer: html })}
        />
      ) : (
        <RichEditor
          mode="short"
          content={question.shortAnswer}
          placeholder="Write the 15-second interview answer…"
          onChange={(html) => change({ shortAnswer: html })}
        />
      )}
    </div>
  );
}
