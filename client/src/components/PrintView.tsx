import type { Topic } from "../types";

interface Props {
  topic: Topic;
  techName: string;
  mode: "deep" | "short";
  onClose: () => void;
}

export default function PrintView({ topic, techName, mode, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-paper z-50 overflow-y-auto">
      <div className="no-print sticky top-0 bg-surface border-b border-border p-4 flex justify-between items-center">
        <span className="text-sm text-ink-soft">
          Print preview — {mode === "deep" ? "Deep notes" : "Short answers"}
        </span>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="text-sm px-4 py-1.5 rounded-full bg-deep text-white">
            Print / Save PDF
          </button>
          <button onClick={onClose} className="text-sm px-4 py-1.5 rounded-full border border-border">
            Close
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-10">
        <p className="text-sm text-ink-soft mb-1">{techName}</p>
        <h1 className="font-serif text-3xl font-semibold mb-8">{topic.name}</h1>

        {topic.questions.map((q, i) => (
          <div key={q.id} className="mb-8 break-inside-avoid">
            <h2 className="font-sans font-semibold text-lg mb-2">
              {i + 1}. {q.question}
            </h2>
            <div
              className={mode === "deep" ? "editor-deep" : "editor-short"}
              dangerouslySetInnerHTML={{
                __html: (mode === "deep" ? q.deepAnswer : q.shortAnswer) || "<p class='text-ink-soft'>—</p>",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
