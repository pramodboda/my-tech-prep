import type { Technology } from "../types";

interface Props {
  technologies: Technology[];
  activeTopicId: string | null;
  onSelectTopic: (techId: string, topicId: string) => void;
  onAddTech: () => void;
  onAddTopic: (techId: string) => void;
  onLogout: () => void;
  userEmail: string;
}

export default function Sidebar({
  technologies,
  activeTopicId,
  onSelectTopic,
  onAddTech,
  onAddTopic,
  onLogout,
  userEmail,
}: Props) {
  return (
    <aside className="no-print w-64 shrink-0 border-r border-border bg-surface h-screen overflow-y-auto p-4 flex flex-col">
      <div className="flex-1">
        <h1 className="font-serif text-xl font-semibold mb-1">TechPrep</h1>
        <p className="text-xs text-ink-soft mb-5">Learn deep. Recall short.</p>

        {technologies.map((tech) => (
          <div key={tech.id} className="mb-4">
            <div className="font-sans font-semibold text-sm mb-1">{tech.name}</div>
            <div className="pl-2 border-l border-border ml-1">
              {tech.topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => onSelectTopic(tech.id, topic.id)}
                  className={`block w-full text-left text-sm px-2 py-1 rounded-md mb-0.5 transition-colors ${
                    activeTopicId === topic.id ? "bg-deep-soft text-deep font-medium" : "text-ink-soft hover:bg-paper"
                  }`}
                >
                  {topic.name}
                </button>
              ))}
              <button onClick={() => onAddTopic(tech.id)} className="text-xs text-ink-soft/70 hover:text-deep px-2 py-1">
                + Add topic
              </button>
            </div>
          </div>
        ))}

        <button onClick={onAddTech} className="text-sm text-ink-soft hover:text-deep mt-2">
          + Add technology
        </button>
      </div>

      <div className="border-t border-border pt-3 mt-3">
        <p className="text-xs text-ink-soft truncate mb-1">{userEmail}</p>
        <button onClick={onLogout} className="text-xs text-ink-soft hover:text-red-600">
          Log out
        </button>
      </div>
    </aside>
  );
}
