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

  const [exporting, setExporting] = useState(false);
  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const user = encodeURIComponent(userName ?? "");
      const res = await fetch(`/api/export?user=${user}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `data-pipeline-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {showModal && <NameModal onConfirm={handleNameConfirm} />}

      {/* ── Top bar ── */}
      <header className="bg-gray-900 px-6 py-4 flex items-center justify-between shrink-0 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Data Pipeline Board</h1>
          <p className="text-gray-400 text-sm mt-0.5">แผนที่ข้อมูลและกระบวนการสำหรับทีม</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Export PDF button */}
          <button
            onClick={handleExportPDF}
            disabled={exporting || loading}
            className="flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-100 disabled:opacity-50 px-4 py-2.5 rounded-xl text-sm font-bold transition shadow"
          >
            {exporting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                กำลัง Export…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                </svg>
                Export PDF
              </>
            )}
          </button>

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
        </div>
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
