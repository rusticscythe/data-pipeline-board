"use client";
import { useEffect, useState, useCallback } from "react";
import SourceColumn from "./SourceColumn";
import NameModal from "./NameModal";
import { PipelineSource, UserCard } from "@/lib/types";

export default function Board() {
  const [userName, setUserName] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [sources, setSources] = useState<PipelineSource[]>([]);
  const [cards, setCards] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("pipeline_user");
    if (stored) setUserName(stored);
    else setShowModal(true);
  }, []);

  useEffect(() => {
    (async () => {
      // ensure tables exist
      await fetch("/api/cards");
      const [srcRes, cardRes] = await Promise.all([
        fetch("/api/sources"),
        fetch("/api/cards"),
      ]);
      setSources(await srcRes.json());
      setCards(await cardRes.json());
      setLoading(false);
    })();
  }, []);

  const handleNameConfirm = (name: string) => {
    localStorage.setItem("pipeline_user", name);
    setUserName(name);
    setShowModal(false);
  };

  const handleSourceUpdate = useCallback((key: string, updated: PipelineSource) => {
    setSources(prev => prev.map(s => s.source_key === key ? updated : s));
  }, []);

  const handleCardAdd = useCallback((card: UserCard) => {
    setCards(prev => [...prev, card]);
  }, []);

  const handleCardUpdate = useCallback((cardId: string, patch: Partial<UserCard>) => {
    setCards(prev => prev.map(c => c.card_id === cardId ? { ...c, ...patch } : c));
  }, []);

  const handleCardDelete = useCallback((cardId: string) => {
    setCards(prev => prev.filter(c => c.card_id !== cardId));
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-50" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {showModal && <NameModal onConfirm={handleNameConfirm} />}

      {/* ── Top bar ── */}
      <header className="bg-gray-900 px-6 py-4 flex items-center justify-between shrink-0 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Data Pipeline Board</h1>
          <p className="text-gray-400 text-sm mt-0.5">แผนที่ข้อมูลและกระบวนการสำหรับทีม</p>
        </div>
        {userName && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-white font-semibold text-base">{userName}</p>
              <button
                onClick={() => { localStorage.removeItem("pipeline_user"); setUserName(null); setShowModal(true); }}
                className="text-gray-400 hover:text-red-400 text-sm transition"
              >เปลี่ยนชื่อ</button>
            </div>
            <div className="w-11 h-11 rounded-full bg-blue-500 text-white text-lg font-bold flex items-center justify-center shadow">
              {userName[0].toUpperCase()}
            </div>
          </div>
        )}
      </header>

      {/* ── Columns ── */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden px-6 py-6">
        {loading ? (
          <div className="flex gap-5 h-full">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-80 shrink-0 bg-gray-200 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex gap-5 h-full items-start pb-2">
            {sources.map(source => (
              <SourceColumn
                key={source.source_key}
                source={source}
                cards={cards.filter(c => c.source_key === source.source_key)}
                userName={userName ?? "ไม่ระบุ"}
                onSourceUpdate={handleSourceUpdate}
                onCardAdd={handleCardAdd}
                onCardUpdate={handleCardUpdate}
                onCardDelete={handleCardDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
