"use client";
import { useState } from "react";
import { UserCard, MODES, MODE_ACCENT } from "@/lib/types";
import GuidedForm, { GuidedFormValues } from "./GuidedForm";

interface Props {
  card: UserCard;
  onDelete: (id: string) => void;
  onUpdate: (id: string, patch: Partial<UserCard>) => void;
}

type CardState = "compact" | "view" | "edit";

export default function TaskCard({ card, onDelete, onUpdate }: Props) {
  const [state, setState] = useState<CardState>("compact");
  const [values, setValues] = useState<GuidedFormValues>({
    entry_point:         card.entry_point,
    entry_person:        card.entry_person,
    data_structure:      card.data_structure,
    business_activities: card.business_activities ?? [],
    mode:                card.mode,
    system_tags:         card.system_tags ?? [],
  });

  const accent    = MODE_ACCENT[values.mode] ?? MODE_ACCENT.paper;
  const modeLabel = MODES.find(m => m.value === values.mode)?.label ?? values.mode;

  const save = () => {
    onUpdate(card.card_id, values);
    setState("view");
  };

  // ── EDIT mode ──
  if (state === "edit") {
    return (
      <div className="bg-white rounded-2xl border-2 border-blue-400 shadow-xl p-5 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-700">แก้ไขข้อมูล</h3>
          <button
            onClick={() => onDelete(card.card_id)}
            className="text-sm text-red-400 hover:text-red-600 font-semibold transition px-2 py-1 rounded-lg hover:bg-red-50 flex items-center gap-1"
          >
            🗑 ลบการ์ด
          </button>
        </div>
        <GuidedForm values={values} onChange={setValues} sourceKey={card.card_id} />
        <div className="flex gap-3 pt-1 border-t border-gray-100">
          <button
            onClick={save}
            className="flex-1 bg-blue-600 text-white rounded-xl py-3.5 text-base font-bold hover:bg-blue-700 transition"
          >
            บันทึก ✓
          </button>
          <button
            onClick={() => setState("view")}
            className="px-5 bg-gray-100 text-gray-600 rounded-xl py-3.5 text-base font-semibold hover:bg-gray-200 transition"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    );
  }

  // ── VIEW mode (expanded, read-only) ──
  if (state === "view") {
    return (
      <div className={`rounded-2xl border-2 ${accent.border} bg-white shadow-md`}>
        {/* Header bar */}
        <div className={`${accent.header} rounded-t-2xl px-4 py-3 flex items-center justify-between`}>
          <span className={`text-sm font-bold px-3 py-1 rounded-full ${accent.badge}`}>{modeLabel}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setState("edit")}
              title="แก้ไข"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 font-semibold transition px-2.5 py-1.5 rounded-xl hover:bg-blue-50"
            >
              ✏️ แก้ไข
            </button>
            <button
              onClick={() => setState("compact")}
              title="ย่อ"
              className="text-gray-400 hover:text-gray-600 transition p-1.5 rounded-xl hover:bg-gray-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Read-only body */}
        <div className="px-4 py-4 flex flex-col gap-3">
          {values.entry_point && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Entry Point</p>
              <p className="text-base text-gray-800 leading-relaxed">{values.entry_point}</p>
            </div>
          )}
          {values.entry_person && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">ผู้รับผิดชอบ</p>
              <p className="text-base text-gray-700">👤 {values.entry_person}</p>
            </div>
          )}
          {values.data_structure && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">โครงสร้างข้อมูล</p>
              <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">{values.data_structure}</p>
            </div>
          )}
          {(values.business_activities ?? []).length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Business Activities</p>
              <div className="flex flex-wrap gap-1.5">
                {values.business_activities.map(a => (
                  <span key={a} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-xl font-medium">{a}</span>
                ))}
              </div>
            </div>
          )}
          {(values.system_tags ?? []).length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">ระบบที่ใช้</p>
              <div className="flex flex-wrap gap-1.5">
                {values.system_tags.map(t => (
                  <span key={t} className="text-sm bg-gray-100 text-gray-600 border border-gray-300 px-3 py-1 rounded-xl">{t}</span>
                ))}
              </div>
            </div>
          )}
          {!values.entry_point && !values.entry_person && !values.data_structure &&
            (values.business_activities ?? []).length === 0 && (
            <p className="text-sm text-gray-400 italic">ยังไม่มีข้อมูล — กด ✏️ แก้ไข เพื่อเพิ่ม</p>
          )}
        </div>
      </div>
    );
  }

  // ── COMPACT mode (default) — click to expand VIEW ──
  return (
    <div
      onClick={() => setState("view")}
      className={`rounded-2xl border-2 ${accent.header} ${accent.border} shadow-sm p-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${accent.badge}`}>{modeLabel}</span>
        <span className="text-gray-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
          แตะเพื่อดู ▾
        </span>
      </div>
      {values.entry_point && (
        <p className="text-base font-bold text-gray-800 leading-snug mb-1">{values.entry_point}</p>
      )}
      {values.entry_person && (
        <p className="text-sm text-gray-500 mb-2">👤 {values.entry_person}</p>
      )}
      {values.data_structure && (
        <p className="text-sm text-gray-500 mb-2 line-clamp-2 leading-relaxed">{values.data_structure}</p>
      )}
      {(values.business_activities ?? []).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {values.business_activities.map(a => (
            <span key={a} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-lg font-medium">{a}</span>
          ))}
        </div>
      )}
      {(values.system_tags ?? []).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {values.system_tags.map(t => (
            <span key={t} className="text-xs bg-white/80 text-gray-500 border border-gray-300 px-2 py-0.5 rounded-lg">{t}</span>
          ))}
        </div>
      )}
      {!values.entry_point && !values.entry_person && !values.data_structure &&
        (values.business_activities ?? []).length === 0 && (
        <p className="text-sm text-gray-400 italic">คลิกเพื่อดูข้อมูล</p>
      )}
    </div>
  );
}
