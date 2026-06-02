"use client";
import { useState } from "react";

export default function NameModal({ onConfirm }: { onConfirm: (name: string) => void }) {
  const [name, setName] = useState("");
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">
        <div className="text-4xl mb-4">👋</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">ยินดีต้อนรับ</h2>
        <p className="text-gray-500 text-lg mb-8">กรุณาระบุชื่อของคุณก่อนเริ่มใช้งาน</p>
        <label className="block text-base font-semibold text-gray-700 mb-2">ชื่อของคุณ</label>
        <input
          autoFocus
          className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 text-xl focus:outline-none focus:border-blue-500 mb-6 transition"
          placeholder="เช่น คุณสมชาย"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && name.trim() && onConfirm(name.trim())}
        />
        <button
          disabled={!name.trim()}
          onClick={() => onConfirm(name.trim())}
          className="w-full bg-blue-600 text-white rounded-2xl py-4 text-xl font-bold disabled:opacity-40 hover:bg-blue-700 transition"
        >
          เข้าใช้งาน →
        </button>
      </div>
    </div>
  );
}
