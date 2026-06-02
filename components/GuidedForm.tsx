"use client";
/**
 * Shared guided form used by both AddCardForm and TaskCard (edit mode).
 * Fields mirror the source detail: Entry Point, Person, Data Structure,
 * Business Activities, Mode, System Tags.
 */
import {
  Mode, SystemTag, BusinessActivity,
  BUSINESS_ACTIVITIES, MODES, SYSTEM_TAGS, MODE_ACCENT,
} from "@/lib/types";

export interface GuidedFormValues {
  entry_point: string;
  entry_person: string;
  data_structure: string;
  business_activities: BusinessActivity[];
  mode: Mode;
  system_tags: SystemTag[];
}

interface Props {
  values: GuidedFormValues;
  onChange: (next: GuidedFormValues) => void;
  sourceKey: string; // for radio name uniqueness
}

export const EMPTY_FORM: GuidedFormValues = {
  entry_point: "",
  entry_person: "",
  data_structure: "",
  business_activities: [],
  mode: "paper",
  system_tags: [],
};

export default function GuidedForm({ values, onChange, sourceKey }: Props) {
  const set = (patch: Partial<GuidedFormValues>) => onChange({ ...values, ...patch });

  const toggleAct = (act: BusinessActivity) => {
    const cur = values.business_activities ?? [];
    set({ business_activities: cur.includes(act) ? cur.filter(a => a !== act) : [...cur, act] });
  };
  const toggleTag = (tag: SystemTag) => {
    const cur = values.system_tags ?? [];
    set({ system_tags: cur.includes(tag) ? cur.filter(t => t !== tag) : [...cur, tag] });
  };

  const accent = MODE_ACCENT[values.mode] ?? MODE_ACCENT.paper;

  return (
    <div className="flex flex-col gap-5">

      {/* Entry Point */}
      <div>
        <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">
          Entry Point
        </label>
        <textarea
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base resize-none focus:outline-none focus:border-blue-400 bg-gray-50"
          rows={2}
          placeholder="ระบุ entry point..."
          value={values.entry_point}
          onChange={e => set({ entry_point: e.target.value })}
        />
      </div>

      {/* Person */}
      <div>
        <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">
          ผู้รับผิดชอบ
        </label>
        <input
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-400 bg-gray-50"
          placeholder="ชื่อผู้รับผิดชอบ..."
          value={values.entry_person}
          onChange={e => set({ entry_person: e.target.value })}
        />
      </div>

      {/* Data Structure */}
      <div>
        <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">
          โครงสร้างข้อมูล
        </label>
        <textarea
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base resize-none focus:outline-none focus:border-blue-400 bg-gray-50"
          rows={3}
          placeholder="อธิบายโครงสร้างข้อมูล..."
          value={values.data_structure}
          onChange={e => set({ data_structure: e.target.value })}
        />
      </div>

      {/* Business Activities */}
      <div>
        <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
          Business Activities
        </label>
        <div className="grid grid-cols-1 gap-2.5">
          {BUSINESS_ACTIVITIES.map(act => {
            const on = (values.business_activities ?? []).includes(act);
            return (
              <label key={act} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox" checked={on} onChange={() => toggleAct(act)}
                  className="w-5 h-5 rounded accent-blue-600 cursor-pointer shrink-0"
                />
                <span className={`text-base ${on ? "font-bold text-blue-700" : "text-gray-700"}`}>{act}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Mode */}
      <div>
        <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
          Mode
        </label>
        <div className="grid grid-cols-2 gap-2">
          {MODES.map(m => {
            const a = MODE_ACCENT[m.value];
            const selected = values.mode === m.value;
            return (
              <label key={m.value}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition ${selected ? `${a.header} ${a.border}` : "bg-white border-gray-200 hover:border-gray-300"}`}>
                <input
                  type="radio"
                  name={`card-mode-${sourceKey}`}
                  value={m.value}
                  checked={selected}
                  onChange={() => set({ mode: m.value as Mode })}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className={`text-base font-semibold ${selected ? "text-gray-800" : "text-gray-600"}`}>{m.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* System Tags */}
      <div>
        <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
          ระบบที่ใช้
        </label>
        <div className="flex flex-wrap gap-2">
          {SYSTEM_TAGS.map(tag => {
            const on = (values.system_tags ?? []).includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`text-base px-4 py-2 rounded-xl border-2 font-semibold transition ${on ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"}`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode indicator strip */}
      {values.mode !== "paper" && (
        <div className={`rounded-xl px-4 py-2.5 ${accent.header} border ${accent.border} flex items-center gap-2`}>
          <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${accent.badge}`}>
            {MODES.find(m => m.value === values.mode)?.label}
          </span>
          <span className="text-sm text-gray-600">mode ที่เลือก</span>
        </div>
      )}
    </div>
  );
}
