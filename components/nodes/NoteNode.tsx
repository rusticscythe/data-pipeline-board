"use client";
import { useState } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { NOTE_COLORS } from "@/lib/types";

interface NoteData {
  note_id: string;
  content: string;
  color: string;
  userName: string;
  onDelete: (id: string) => void;
  onUpdate: (id: string, patch: { content?: string; color?: string }) => void;
}

export default function NoteNode({ data }: NodeProps) {
  const d = data as unknown as NoteData;
  const [content, setContent] = useState(d.content);
  const [color, setColor] = useState(d.color ?? "yellow");

  const colorDef = NOTE_COLORS.find(c => c.value === color) ?? NOTE_COLORS[0];

  const handleBlur = () => {
    d.onUpdate(d.note_id, { content });
  };

  const handleColor = (v: string) => {
    setColor(v);
    d.onUpdate(d.note_id, { color: v });
  };

  return (
    <div className={`rounded-xl border-2 ${colorDef.border} ${colorDef.bg} shadow-md w-52 select-none`}
         style={{ fontFamily: "system-ui, sans-serif" }}>
      <Handle type="target" position={Position.Top}    className="!w-2.5 !h-2.5 !bg-gray-400 !border-2 !border-white" />
      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-gray-400 !border-2 !border-white" />
      <Handle type="source" position={Position.Right}  id="right" className="!w-2.5 !h-2.5 !bg-gray-400 !border-2 !border-white" />
      <Handle type="target" position={Position.Left}   id="left"  className="!w-2.5 !h-2.5 !bg-gray-400 !border-2 !border-white" />

      {/* Toolbar */}
      <div className="flex items-center justify-between px-2 pt-2 pb-1 gap-1">
        <div className="flex gap-1">
          {NOTE_COLORS.map(c => (
            <button key={c.value} onClick={() => handleColor(c.value)}
              className={`w-3.5 h-3.5 rounded-full border-2 ${c.bg} ${color === c.value ? "border-gray-600" : "border-transparent"}`} />
          ))}
        </div>
        <button onClick={() => d.onDelete(d.note_id)}
          className="nodrag text-gray-400 hover:text-red-500 transition text-xs leading-none">✕</button>
      </div>

      {/* Content */}
      <textarea
        className={`nodrag w-full bg-transparent border-none outline-none resize-none text-xs text-gray-700 px-3 pb-3 min-h-[80px]`}
        placeholder="เพิ่มโน้ต..."
        value={content}
        onChange={e => setContent(e.target.value)}
        onBlur={handleBlur}
      />
    </div>
  );
}
