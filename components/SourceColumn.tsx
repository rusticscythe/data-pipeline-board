"use client";
import { useState, useCallback } from "react";
import {
  PipelineSource, UserCard, Mode, SystemTag, BusinessActivity,
  BUSINESS_ACTIVITIES, MODES, SYSTEM_TAGS, MODE_ACCENT,
} from "@/lib/types";
import { GuidedFormValues } from "./GuidedForm";
import TaskCard from "./TaskCard";
import AddCardForm from "./AddCardForm";

interface Props {
  source: PipelineSource;
  cards: UserCard[];
  userName: string;
  onSourceUpdate: (key: string, updated: PipelineSource) => void;
  onCardAdd: (card: UserCard) => void;
  onCardUpdate: (id: string, patch: Partial<UserCard>) => void;
  onCardDelete: (id: string) => void;
}

function fmt(iso: string) {
  if (!iso) return "-";
  return new Intl.DateTimeFormat("th-TH", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
}

export default function SourceColumn({ source, cards, userName, onSourceUpdate, onCardAdd, onCardUpdate, onCardDelete }: Props) {
  const [localSrc, setLocalSrc] = useState(source);
  const [expanded, setExpanded] = useState(false);
  const [addingCard, setAddingCard] = useState(false);
  const [saving, setSaving] = useState(false);

  const patchSource = useCallback(async (update: Partial<PipelineSource>) => {
    const next = { ...localSrc, ...update };
    setLocalSrc(next);
    setSaving(true);
    try {
      const res = await fetch(`/api/sources/${source.source_key}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...update, updated_by: userName }),
      });
      const saved = await res.json();
      setLocalSrc(saved);
      onSourceUpdate(source.source_key, saved);
    } finally {
      setSaving(false);
    }
  }, [localSrc, source.source_key, userName, onSourceUpdate]);

  const toggleAct = (act: BusinessActivity) => {
    const cur = localSrc.business_activities ?? [];
    patchSource({ business_activities: cur.includes(act) ? cur.filter(a => a !== act) : [...cur, act] });
  };
  const toggleTag = (tag: SystemTag) => {
    const cur = localSrc.system_tags ?? [];
    patchSource({ system_tags: cur.includes(tag) ? cur.filter(t => t !== tag) : [...cur, tag] });
  };

  const handleAddCard = async (values: GuidedFormValues) => {
    const card_id = `card-${Date.now()}`;
    const res = await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        card_id,
        source_key: source.source_key,
        ...values,
        sort_order: cards.length,
        created_by: userName,
      }),
    });
    const saved: UserCard = await res.json();
    onCardAdd(saved);
    setAddingCard(false);
  };

  const handleCardUpdate = async (cardId: string, patch: Partial<UserCard>) => {
    await fetch(`/api/cards/${cardId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    onCardUpdate(cardId, patch);
  };

  const handleCardDelete = async (cardId: string) => {
    await fetch(`/api/cards/${cardId}`, { method: "DELETE" });
    onCardDelete(cardId);
  };

  const accent = MODE_ACCENT[localSrc.mode] ?? MODE_ACCENT.paper;

  return (
    <div className="flex flex-col bg-gray-100 rounded-3xl w-80 shrink-0 max-h-full overflow-hidden shadow-sm border border-gray-200">

      {/* ── Column header — NO mode badge ── */}
      <div className={`${accent.header} rounded-t-3xl px-5 pt-5 pb-4 border-b-2 ${accent.border}`}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h2 className="text-xl font-bold text-gray-900 leading-tight">{localSrc.source_name}</h2>
          {saving && <span className="text-blue-400 animate-pulse text-xs shrink-0 mt-1">กำลังบันทึก…</span>}
        </div>

        {/* Quick stats — person + card count */}
        <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
          {localSrc.entry_person && <span className="font-medium">👤 {localSrc.entry_person}</span>}
          {localSrc.entry_person && <span className="text-gray-300">·</span>}
          <span>{cards.length} การ์ด</span>
        </div>

        {/* Toggle details */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-800 bg-white/60 hover:bg-white/90 rounded-xl py-2 transition"
        >
          <span>{expanded ? "ซ่อนรายละเอียด" : "ดูและแก้ไขรายละเอียด"}</span>
          <svg className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* ── Source detail (expandable) ── */}
      {expanded && (
        <div className="bg-white border-b-2 border-gray-200 px-5 py-5 flex flex-col gap-5">

          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Entry Point</p>
            <textarea
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base resize-none focus:outline-none focus:border-blue-400 bg-gray-50"
              rows={2} placeholder="ระบุ entry point..."
              defaultValue={localSrc.entry_point}
              onBlur={e => patchSource({ entry_point: e.target.value })}
            />
          </div>

          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">ผู้รับผิดชอบ</p>
            <input
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-400 bg-gray-50"
              placeholder="ชื่อผู้รับผิดชอบ..."
              defaultValue={localSrc.entry_person}
              onBlur={e => patchSource({ entry_person: e.target.value })}
            />
          </div>

          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">โครงสร้างข้อมูล</p>
            <textarea
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base resize-none focus:outline-none focus:border-blue-400 bg-gray-50"
              rows={3} placeholder="อธิบายโครงสร้างข้อมูล..."
              defaultValue={localSrc.data_structure}
              onBlur={e => patchSource({ data_structure: e.target.value })}
            />
          </div>

          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Business Activities</p>
            <div className="grid grid-cols-1 gap-2">
              {BUSINESS_ACTIVITIES.map(act => {
                const on = (localSrc.business_activities ?? []).includes(act);
                return (
                  <label key={act} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={on} onChange={() => toggleAct(act)}
                      className="w-5 h-5 rounded accent-blue-600 cursor-pointer" />
                    <span className={`text-base ${on ? "font-bold text-blue-700" : "text-gray-600"}`}>{act}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Mode</p>
            <div className="grid grid-cols-2 gap-2">
              {MODES.map(m => {
                const a = MODE_ACCENT[m.value];
                const selected = localSrc.mode === m.value;
                return (
                  <label key={m.value}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition ${selected ? `${a.header} ${a.border}` : "bg-white border-gray-200 hover:border-gray-300"}`}>
                    <input type="radio" name={`src-mode-${source.source_key}`} value={m.value}
                      checked={localSrc.mode === m.value}
                      onChange={() => patchSource({ mode: m.value as Mode })}
                      className="w-4 h-4 accent-blue-600" />
                    <span className={`text-base font-semibold ${selected ? "text-gray-800" : "text-gray-600"}`}>{m.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">ระบบที่ใช้</p>
            <div className="flex flex-wrap gap-2">
              {SYSTEM_TAGS.map(tag => {
                const on = (localSrc.system_tags ?? []).includes(tag);
                return (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    className={`text-base px-4 py-2 rounded-xl border-2 font-semibold transition ${on ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"}`}>
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-sm text-gray-400 pt-2 border-t border-gray-100">
            อัปเดตโดย <span className="font-semibold text-gray-500">{localSrc.updated_by || "-"}</span>
            {" · "}{fmt(localSrc.updated_at)}
          </p>
        </div>
      )}

      {/* ── Cards list ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 min-h-0">
        {cards.length === 0 && !addingCard && (
          <div className="text-center text-gray-400 text-base py-8 select-none">
            <div className="text-4xl mb-2">📋</div>
            <p className="font-medium">ยังไม่มีข้อมูล</p>
            <p className="text-sm mt-1">คลิก "เพิ่มการ์ด" ด้านล่าง</p>
          </div>
        )}
        {cards.map(card => (
          <TaskCard
            key={card.card_id}
            card={card}
            onDelete={handleCardDelete}
            onUpdate={handleCardUpdate}
          />
        ))}
        {addingCard && (
          <AddCardForm
            sourceKey={source.source_key}
            onAdd={handleAddCard}
            onCancel={() => setAddingCard(false)}
          />
        )}
      </div>

      {/* ── Add card button ── */}
      {!addingCard && (
        <div className="px-4 pb-4 pt-2">
          <button
            onClick={() => setAddingCard(true)}
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-blue-50 border-2 border-dashed border-gray-300 hover:border-blue-400 text-gray-500 hover:text-blue-600 rounded-2xl py-4 text-base font-semibold transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            เพิ่มการ์ด
          </button>
        </div>
      )}
    </div>
  );
}
