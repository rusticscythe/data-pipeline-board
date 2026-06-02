"use client";
import { useState } from "react";
import GuidedForm, { GuidedFormValues, EMPTY_FORM } from "./GuidedForm";
import { UserCard } from "@/lib/types";

interface Props {
  onAdd: (values: GuidedFormValues) => void;
  onCancel: () => void;
  sourceKey: string;
}

export default function AddCardForm({ onAdd, onCancel, sourceKey }: Props) {
  const [values, setValues] = useState<GuidedFormValues>(EMPTY_FORM);

  const hasContent = values.entry_point.trim() || values.entry_person.trim() || values.data_structure.trim();

  return (
    <div className="bg-white rounded-2xl border-2 border-blue-400 shadow-xl p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">เพิ่มข้อมูลใหม่</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
      </div>

      <GuidedForm values={values} onChange={setValues} sourceKey={`new-${sourceKey}`} />

      <div className="flex gap-3 pt-1 border-t border-gray-100">
        <button
          disabled={!hasContent}
          onClick={() => onAdd(values)}
          className="flex-1 bg-blue-600 text-white rounded-xl py-3.5 text-base font-bold disabled:opacity-40 hover:bg-blue-700 transition"
        >
          เพิ่มการ์ด ✓
        </button>
        <button
          onClick={onCancel}
          className="px-5 bg-gray-100 text-gray-600 rounded-xl py-3.5 text-base font-semibold hover:bg-gray-200 transition"
        >
          ยกเลิก
        </button>
      </div>
    </div>
  );
}
