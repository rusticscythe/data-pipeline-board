"use client";
import { useState, useCallback } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import {
  PipelineSource, Mode, SystemTag, BusinessActivity,
  BUSINESS_ACTIVITIES, MODES, SYSTEM_TAGS, MODE_ACCENT,
} from "@/lib/types";

type SourceNodeData = PipelineSource & { userName: string; onDataUpdate: (key: string, d: PipelineSource) => void };

function fmt(iso: string) {
  if (!iso) return "-";
  return new Intl.DateTimeFormat("th-TH", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
}

export default function SourceNode({ data }: NodeProps) {
  const d = data as unknown as SourceNodeData;
  const [local, setLocal] = useState<PipelineSource>(d);
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);

  const patch = useCallback(async (update: Partial<PipelineSource>) => {
    const next = { ...local, ...update };
    setLocal(next);
    setSaving(true);
    try {
      const res = await fetch(`/api/sources/${local.source_key}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...update, updated_by: d.userName }),
      });
      const saved = await res.json();
      setLocal(saved);
      d.onDataUpdate(local.source_key, saved);
    } finally {
      setSaving(false);
    }
  }, [local, d]);

  const toggleAct = (act: BusinessActivity) => {
    const cur = local.business_activities ?? [];
    patch({ business_activities: cur.includes(act) ? cur.filter(a => a !== act) : [...cur, act] });
  };
  const toggleTag = (tag: SystemTag) => {
    const cur = local.system_tags ?? [];
    patch({ system_tags: cur.includes(tag) ? cur.filter(t => t !== tag) : [...cur, tag] });
  };

  const accent = MODE_ACCENT[local.mode] ?? MODE_ACCENT.paper;

  return (
    <div
      className={`bg-white rounded-xl border-2 ${accent.border} shadow-lg w-80 select-none transition-shadow hover:shadow-xl`}
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      {/* Handles */}
      <Handle type="target" position={Position.Top}    className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white" />
      <Handle type="source" position={Position.Right}  id="right" className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white" />
      <Handle type="target" position={Position.Left}   id="left"  className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white" />

      {/* Header */}
      <div className={`${accent.header} rounded-t-xl px-4 py-3 flex items-center justify-between cursor-pointer`}
           onClick={() => setExpanded(e => !e)}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base font-bold text-gray-800 truncate">{local.source_name}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {saving && <span className="text-[10px] text-gray-400 animate-pulse">saving…</span>}
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${accent.badge}`}>
            {MODES.find(m => m.value === local.mode)?.label}
          </span>
          <svg className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Compact summary (always visible) */}
      {!expanded && (
        <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-gray-100">
          {(local.business_activities ?? []).map(a => (
            <span key={a} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">{a}</span>
          ))}
          {(local.system_tags ?? []).map(t => (
            <span key={t} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{t}</span>
          ))}
          {local.entry_person && (
            <span className="text-[10px] text-gray-400 ml-auto">👤 {local.entry_person}</span>
          )}
        </div>
      )}

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 py-3 flex flex-col gap-3 border-t border-gray-100">

          {/* Entry Point & Person */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Entry Point & Person</p>
            <textarea
              className="nodrag w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 mb-1.5"
              rows={2} placeholder="Entry point..."
              defaultValue={local.entry_point}
              onBlur={e => patch({ entry_point: e.target.value })}
            />
            <input
              className="nodrag w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
              placeholder="ผู้รับผิดชอบ..."
              defaultValue={local.entry_person}
              onBlur={e => patch({ entry_person: e.target.value })}
            />
          </div>

          {/* Data Structure */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Data Structure</p>
            <textarea
              className="nodrag w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
              rows={3} placeholder="โครงสร้างข้อมูล..."
              defaultValue={local.data_structure}
              onBlur={e => patch({ data_structure: e.target.value })}
            />
          </div>

          {/* Business Activities */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Business Activities</p>
            <div className="grid grid-cols-2 gap-1">
              {BUSINESS_ACTIVITIES.map(act => {
                const on = (local.business_activities ?? []).includes(act);
                return (
                  <label key={act} className="nodrag flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={on} onChange={() => toggleAct(act)} className="accent-blue-600 w-3 h-3" />
                    <span className={`text-[11px] ${on ? "text-blue-700 font-semibold" : "text-gray-500"}`}>{act}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Mode */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Mode</p>
            <div className="flex flex-wrap gap-2">
              {MODES.map(m => (
                <label key={m.value} className="nodrag flex items-center gap-1 cursor-pointer">
                  <input type="radio" name={`mode-${local.source_key}`} value={m.value}
                    checked={local.mode === m.value}
                    onChange={() => patch({ mode: m.value as Mode })}
                    className="accent-blue-600" />
                  <span className="text-xs text-gray-700">{m.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* System Tags */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">System Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {SYSTEM_TAGS.map(tag => {
                const on = (local.system_tags ?? []).includes(tag);
                return (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    className={`nodrag text-[11px] px-2.5 py-0.5 rounded-full border font-medium transition-colors ${on ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-500 border-gray-300 hover:border-blue-300"}`}>
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <p className="text-[10px] text-gray-300 pt-1 border-t border-gray-100">
            อัปเดตโดย <span className="text-gray-400">{local.updated_by || "-"}</span> · {fmt(local.updated_at)}
          </p>
        </div>
      )}
    </div>
  );
}
