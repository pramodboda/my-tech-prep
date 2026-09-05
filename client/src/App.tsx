import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./context/AuthContext";
import { api } from "./lib/api";
import type { Technology, Question } from "./types";
import LoginPage from "./pages/LoginPage";
import Sidebar from "./components/Sidebar";
import QnACard from "./components/QnACard";
import PrintView from "./components/PrintView";
import ThemeToggle from "./components/ThemeToggle";

function Dashboard() {
  const { user, logout } = useAuth();
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTechId, setActiveTechId] = useState<string | null>(null);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [printMode, setPrintMode] = useState<"deep" | "short" | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await api.getTechnologies();
    setTechnologies(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const activeTech = technologies.find((t) => t.id === activeTechId) ?? null;
  const activeTopic =
    activeTech?.topics.find((t) => t.id === activeTopicId) ?? null;

  async function addTechnology() {
    const name = prompt("Technology name (e.g. React, DBMS, System Design):");
    if (!name) return;
    const tech = await api.createTechnology(name);
    setTechnologies((prev) => [...prev, { ...tech, topics: [] }]);
    setActiveTechId(tech.id);
    setActiveTopicId(null);
  }

  async function addTopic(techId: string) {
    const name = prompt("Topic name (e.g. Hooks, Indexing):");
    if (!name) return;
    const topic = await api.createTopic(techId, name);
    setTechnologies((prev) =>
      prev.map((t) =>
        t.id === techId
          ? { ...t, topics: [...t.topics, { ...topic, questions: [] }] }
          : t,
      ),
    );
    setActiveTechId(techId);
    setActiveTopicId(topic.id);
  }

  async function addQuestion() {
    if (!activeTopic || !activeTechId) return;
    const question = await api.createQuestion(activeTopic.id);
    setTechnologies((prev) =>
      prev.map((t) =>
        t.id !== activeTechId
          ? t
          : {
              ...t,
              topics: t.topics.map((tp) =>
                tp.id !== activeTopic.id
                  ? tp
                  : { ...tp, questions: [...tp.questions, question] },
              ),
            },
      ),
    );
  }

  function updateQuestionLocal(updated: Question) {
    if (!activeTechId || !activeTopic) return;
    setTechnologies((prev) =>
      prev.map((t) =>
        t.id !== activeTechId
          ? t
          : {
              ...t,
              topics: t.topics.map((tp) =>
                tp.id !== activeTopic.id
                  ? tp
                  : {
                      ...tp,
                      questions: tp.questions.map((q) =>
                        q.id === updated.id ? updated : q,
                      ),
                    },
              ),
            },
      ),
    );
  }

  async function deleteQuestion(qid: string) {
    if (!activeTechId || !activeTopic) return;
    await api.deleteQuestion(qid);
    setTechnologies((prev) =>
      prev.map((t) =>
        t.id !== activeTechId
          ? t
          : {
              ...t,
              topics: t.topics.map((tp) =>
                tp.id !== activeTopic.id
                  ? tp
                  : {
                      ...tp,
                      questions: tp.questions.filter((q) => q.id !== qid),
                    },
              ),
            },
      ),
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-ink-soft">
        Loading…
      </div>
    );
  }

  return (
    <>
      <ThemeToggle />
      <div className="flex">
        <Sidebar
          technologies={technologies}
          activeTopicId={activeTopicId}
          onSelectTopic={(techId, topicId) => {
            setActiveTechId(techId);
            setActiveTopicId(topicId);
          }}
          onAddTech={addTechnology}
          onAddTopic={addTopic}
          onLogout={logout}
          userEmail={user?.email ?? ""}
        />
        <main className="flex-1 h-screen overflow-y-auto p-8 max-w-3xl">
          {activeTopic && activeTech ? (
            <>
              <div className="no-print flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-ink-soft">{activeTech.name}</p>
                  <h2 className="font-serif text-2xl font-semibold">
                    {activeTopic.name}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPrintMode("deep")}
                    className="text-sm px-3 py-1.5 rounded-full border border-border hover:border-deep hover:text-deep"
                  >
                    Export deep notes
                  </button>
                  <button
                    onClick={() => setPrintMode("short")}
                    className="text-sm px-3 py-1.5 rounded-full border border-border hover:border-short hover:text-short"
                  >
                    Export short prep
                  </button>
                </div>
              </div>

              {activeTopic.questions.map((q) => (
                <QnACard
                  key={q.id}
                  question={q}
                  onLocalUpdate={updateQuestionLocal}
                  onDelete={() => deleteQuestion(q.id)}
                />
              ))}

              <button
                onClick={addQuestion}
                className="no-print text-sm text-ink-soft hover:text-deep mt-2"
              >
                + Add question
              </button>
            </>
          ) : (
            <div className="text-ink-soft mt-20 text-center">
              <p className="font-serif text-xl mb-2">No topic selected</p>
              <p className="text-sm">
                Add a technology and topic from the sidebar to start.
              </p>
            </div>
          )}
        </main>
        {printMode && activeTopic && activeTech && (
          <PrintView
            topic={activeTopic}
            techName={activeTech.name}
            mode={printMode}
            onClose={() => setPrintMode(null)}
          />
        )}
      </div>
    </>
  );
}

export default function App() {
  const { user } = useAuth();
  return user ? <Dashboard /> : <LoginPage />;
}
