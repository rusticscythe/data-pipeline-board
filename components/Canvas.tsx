"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  ReactFlow, Background, Controls, MiniMap, addEdge,
  useNodesState, useEdgesState, BackgroundVariant,
  type Node, type Edge, type OnConnect,
  type OnEdgesDelete, MarkerType, Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import SourceNode from "./nodes/SourceNode";
import NoteNode from "./nodes/NoteNode";
import NameModal from "./NameModal";
import { PipelineSource, PipelineNote, PRESET_SOURCES } from "@/lib/types";

const NODE_TYPES = { source: SourceNode, note: NoteNode };

function sourceToNode(s: PipelineSource, userName: string, onDataUpdate: (key: string, d: PipelineSource) => void): Node {
  return {
    id: `source-${s.source_key}`,
    type: "source",
    position: { x: s.pos_x ?? 0, y: s.pos_y ?? 0 },
    data: { ...s, userName, onDataUpdate },
  };
}

function noteToNode(n: PipelineNote, userName: string, onDelete: (id: string) => void, onUpdate: (id: string, p: { content?: string; color?: string }) => void): Node {
  return {
    id: `note-${n.note_id}`,
    type: "note",
    position: { x: n.pos_x ?? 0, y: n.pos_y ?? 0 },
    data: { ...n, userName, onDelete, onUpdate },
  };
}

export default function Canvas() {
  const [userName, setUserName] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [ready, setReady] = useState(false);
  const sourcesRef = useRef<PipelineSource[]>([]);
  const notesRef = useRef<PipelineNote[]>([]);

  // ── init user ──
  useEffect(() => {
    const stored = localStorage.getItem("pipeline_user");
    if (stored) setUserName(stored);
    else setShowModal(true);
  }, []);

  // ── data callbacks (stable refs) ──
  const handleDataUpdate = useCallback((key: string, updated: PipelineSource) => {
    sourcesRef.current = sourcesRef.current.map(s => s.source_key === key ? updated : s);
  }, []);

  const handleNoteDelete = useCallback(async (noteId: string) => {
    await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
    notesRef.current = notesRef.current.filter(n => n.note_id !== noteId);
    setNodes(nds => nds.filter(n => n.id !== `note-${noteId}`));
  }, [setNodes]);

  const handleNoteUpdate = useCallback(async (noteId: string, patch: { content?: string; color?: string }) => {
    await fetch(`/api/notes/${noteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...patch, updated_by: userName ?? "" }),
    });
  }, [userName]);

  // ── load data ──
  useEffect(() => {
    (async () => {
      await fetch("/api/init");
      const [sources, notes, dbEdges] = await Promise.all([
        fetch("/api/sources").then(r => r.json()),
        fetch("/api/notes").then(r => r.json()),
        fetch("/api/edges").then(r => r.json()),
      ]);
      sourcesRef.current = sources;
      notesRef.current = notes;

      const user = localStorage.getItem("pipeline_user") ?? "";
      const sNodes = (sources as PipelineSource[]).map(s =>
        sourceToNode(s, user, handleDataUpdate)
      );
      const nNodes = (notes as PipelineNote[]).map(n =>
        noteToNode(n, user, handleNoteDelete, handleNoteUpdate)
      );
      setNodes([...sNodes, ...nNodes]);
      setEdges((dbEdges as any[]).map(e => ({
        id: e.edge_id,
        source: e.source_node,
        target: e.target_node,
        label: e.label || undefined,
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: "#6366f1", strokeWidth: 2 },
        labelStyle: { fontSize: 11, fill: "#555" },
        labelBgStyle: { fill: "#fff", fillOpacity: 0.8 },
      })));
      setReady(true);
    })();
  }, [handleDataUpdate, handleNoteDelete, handleNoteUpdate, setNodes, setEdges]);

  // update node data when userName changes
  useEffect(() => {
    if (!userName || !ready) return;
    setNodes(nds => nds.map(n => {
      if (n.type === "source") return { ...n, data: { ...n.data, userName, onDataUpdate: handleDataUpdate } };
      if (n.type === "note") return { ...n, data: { ...n.data, userName, onDelete: handleNoteDelete, onUpdate: handleNoteUpdate } };
      return n;
    }));
  }, [userName, ready, setNodes, handleDataUpdate, handleNoteDelete, handleNoteUpdate]);

  // ── connect ──
  const onConnect: OnConnect = useCallback(async (params) => {
    const edgeId = `e-${params.source}-${params.target}-${Date.now()}`;
    const newEdge: Edge = {
      ...params,
      id: edgeId,
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#6366f1", strokeWidth: 2 },
    };
    setEdges(eds => addEdge(newEdge, eds));
    await fetch("/api/edges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ edge_id: edgeId, source_node: params.source, target_node: params.target }),
    });
  }, [setEdges]);

  // ── delete edges ──
  const onEdgesDelete: OnEdgesDelete = useCallback(async (deleted) => {
    for (const e of deleted) {
      await fetch("/api/edges", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ edge_id: e.id }),
      });
    }
  }, []);

  // ── drag end: save position ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onNodeDragStop = useCallback(async (_: any, node: Node) => {
    const { x, y } = node.position;
    if (node.type === "source") {
      const key = (node.id as string).replace("source-", "");
      await fetch(`/api/sources/${key}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pos_x: x, pos_y: y }),
      });
    } else if (node.type === "note") {
      const noteId = (node.id as string).replace("note-", "");
      await fetch(`/api/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pos_x: x, pos_y: y }),
      });
    }
  }, []);

  // ── add note ──
  const addNote = useCallback(async (parentKey?: string) => {
    const noteId = `note-${Date.now()}`;
    const parentSource = parentKey
      ? sourcesRef.current.find(s => s.source_key === parentKey)
      : null;
    const pos_x = parentSource ? (parentSource.pos_x + 340) : 100 + Math.random() * 200;
    const pos_y = parentSource ? (parentSource.pos_y + Math.random() * 100) : 100 + Math.random() * 200;

    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note_id: noteId, content: "", color: "yellow", parent_key: parentKey ?? "", pos_x, pos_y, updated_by: userName ?? "" }),
    });
    const saved: PipelineNote = await res.json();
    notesRef.current = [...notesRef.current, saved];
    const newNode = noteToNode(saved, userName ?? "", handleNoteDelete, handleNoteUpdate);
    setNodes(nds => [...nds, newNode]);

    // auto-connect to parent
    if (parentKey) {
      const edgeId = `e-source-${parentKey}-note-${noteId}`;
      const newEdge: Edge = {
        id: edgeId,
        source: `source-${parentKey}`,
        target: `note-${noteId}`,
        animated: false,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: "#94a3b8", strokeWidth: 1.5, strokeDasharray: "4 3" },
      };
      setEdges(eds => [...eds, newEdge]);
      await fetch("/api/edges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ edge_id: edgeId, source_node: `source-${parentKey}`, target_node: `note-${noteId}` }),
      });
    }
  }, [userName, setNodes, setEdges, handleNoteDelete, handleNoteUpdate]);

  const handleNameConfirm = (name: string) => {
    localStorage.setItem("pipeline_user", name);
    setUserName(name);
    setShowModal(false);
  };

  return (
    <div className="w-screen h-screen bg-[#f0f0f0]">
      {showModal && <NameModal onConfirm={handleNameConfirm} />}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgesDelete={onEdgesDelete}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={NODE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        deleteKeyCode="Backspace"
        minZoom={0.2}
        maxZoom={2}
        defaultEdgeOptions={{
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: "#6366f1", strokeWidth: 2 },
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#c8c8c8" />
        <Controls className="!shadow-lg !rounded-xl !border !border-gray-200" />
        <MiniMap
          nodeColor={n => n.type === "note" ? "#fef08a" : "#c7d2fe"}
          className="!rounded-xl !border !border-gray-200 !shadow-lg"
        />

        {/* Top bar */}
        <Panel position="top-left">
          <div className="bg-gray-900 text-white rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-4">
            <div>
              <p className="text-sm font-bold leading-tight">Data Pipeline Board</p>
              <p className="text-[10px] text-gray-400">แผนที่ข้อมูลและการเชื่อมโยง</p>
            </div>
            <div className="w-px h-8 bg-gray-700" />
            {/* Add floating note */}
            <button
              onClick={() => addNote()}
              className="flex items-center gap-1.5 text-xs bg-yellow-400 text-gray-900 font-semibold px-3 py-1.5 rounded-lg hover:bg-yellow-300 transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              โน้ต
            </button>

            {/* Add note per source */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 text-xs bg-indigo-500 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-400 transition">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                เพิ่มใต้ Source
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute left-0 top-full mt-1 bg-gray-800 rounded-xl shadow-xl py-1 z-50 hidden group-hover:block min-w-[180px]">
                {PRESET_SOURCES.map(s => (
                  <button key={s.key}
                    onClick={() => addNote(s.key)}
                    className="block w-full text-left text-xs text-gray-200 hover:bg-gray-700 px-4 py-2 transition">
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-px h-8 bg-gray-700" />

            {/* User badge */}
            {userName && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {userName[0].toUpperCase()}
                </div>
                <span className="text-xs text-gray-300">{userName}</span>
                <button
                  onClick={() => { localStorage.removeItem("pipeline_user"); setUserName(null); setShowModal(true); }}
                  className="text-[10px] text-gray-500 hover:text-red-400 transition"
                >เปลี่ยน</button>
              </div>
            )}
          </div>
        </Panel>

        {/* Hint */}
        <Panel position="bottom-center">
          <div className="bg-gray-900/70 text-white text-[11px] rounded-full px-4 py-1.5 backdrop-blur flex items-center gap-3">
            <span>🖱 ลากการ์ดเพื่อเคลื่อน</span>
            <span>·</span>
            <span>🔗 ลากจาก handle เพื่อเชื่อมโยง</span>
            <span>·</span>
            <span>⌫ เลือก + Backspace เพื่อลบเส้น</span>
            <span>·</span>
            <span>📌 คลิกการ์ดเพื่อดูรายละเอียด</span>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
