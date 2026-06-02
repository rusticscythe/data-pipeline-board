"use client";
import { useState } from "react";
import { UserCard, MODES, MODE_ACCENT } from "@/lib/types";
import GuidedForm, { GuidedFormValues } from "./GuidedForm";

interface Props {
  card: UserCard;
  onDelete: (id: string) => void;
  onUpdate: (id: string, patch: Partial<UserCard>) => void;
}

export default function TaskCard({ card, onDelete, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<GuidedFormValues>({
    entry_point:          card.entry_point,
    entry_person:         card.entry_person,
    data_structure:       card.data_structure,
    business_activities:  card.business_activities ?? [],
    mode:                 card.mode,
    system_tags:          card.system_tags ?? [],
  });

  const accent = MODE_ACCENT[values.mode] ?? MODE_ACCENT.paper;

  const save = () => {
    onUpdate(card.card_id, values);
    setEditing(false);
  };

  const label = values.entry_point || values.entry_person || values.data_structure || "(ไม่มีหัวข้อ)";

  if (editing) {
    return (
      <div className="bg-white rounded-2xl border-2 border-blue-400 shadow-xl p-5 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-700">แก้ไขข้อมูล</h3>
          <button onClick={() => onDelete(card.card_id)}
            className="text-sm text-red-400 hover:text-red-600 font-semibold transition px-2 py-1 rounded-lg hover:bg-red-50">
            🗑 ลบการ์ด
          </button>
        </div>

        <GuidedForm values={values} onChange={setValues} sourceKey={card.card_id} />

        <div className="flex gap-3 pt-1 border-t border-gray-100">
          <button onClick={save}
            className="flex-1 bg-blue-600 text-white rounded-xl py-3.5 text-base font-bold hover:bg-blue-700 transition">
            บันทึก ✓
          </button>
          <button onClick={() => setEditing(false)}
            className="px-5 bg-gray-100 text-gray-600 rounded-xl py-3.5 text-base font-semibold hover:bg-gray-200 transition">
            ยกเลิก
          </button>
        </div>
      </div>
    );
  }

  // ── Compact view ──
  return (
    <div
      onClick={() => setEditing(true)}
      className={`rounded-2xl border-2 ${accent.header} ${accent.border} shadow-sm p-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group`}
    >
      {/* Top row: mode badge + edit hint */}
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${accent.badge}`}>
          {MODES.find(m => m.value === values.mode)?.label}
        </span>
        <span className="text-gray-300 group-hover:text-gray-500 text-base">✏️</span>
      </div>

      {/* Entry point as title */}
      {values.entry_point && (
        <p className="text-base font-bold text-gray-800 leading-snug mb-1">{values.entry_point}</p>
      )}

      {/* Person */}
      {values.entry_person && (
        <p className="text-sm text-gray-500 mb-2">👤 {values.entry_person}</p>
      )}

      {/* Data structure preview */}
      {values.data_structure && (
        <p className="text-sm text-gray-500 mb-2 line-clamp-2 leading-relaxed">{values.data_structure}</p>
      )}

      {/* Activities chips */}
      {(values.business_activities ?? []).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {values.business_activities.map(a => (
            <span key={a} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-lg font-medium">{a}</span>
          ))}
        </div>
      )}

      {/* System tags */}
      {(values.system_tags ?? []).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {values.system_tags.map(t => (
            <span key={t} className="text-xs bg-white/80 text-gray-500 border border-gray-300 px-2 py-0.5 rounded-lg">{t}</span>
          ))}
        </div>
      )}

      {/* Fallback if all fields empty */}
      {!values.entry_point && !values.entry_person && !values.data_structure &&
        (values.business_activities ?? []).length === 0 && (
        <p className="text-sm text-gray-400 italic">คลิกเพื่อเพิ่มข้อมูล</p>
      )}
    </div>
  );
}
