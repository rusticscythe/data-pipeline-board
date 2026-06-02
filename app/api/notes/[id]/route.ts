import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const sql = getDb();
  const { id } = await params;
  const body = await req.json();
  const { content, color, pos_x, pos_y, updated_by } = body;
  const rows = (await sql`
    UPDATE pipeline_notes SET
      content = COALESCE(${content ?? null}, content),
      color = COALESCE(${color ?? null}, color),
      pos_x = COALESCE(${pos_x ?? null}, pos_x),
      pos_y = COALESCE(${pos_y ?? null}, pos_y),
      updated_by = COALESCE(${updated_by ?? null}, updated_by),
      updated_at = NOW()
    WHERE note_id = ${id}
    RETURNING *
  `) as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const sql = getDb();
  const { id } = await params;
  await sql`DELETE FROM pipeline_notes WHERE note_id = ${id}`;
  return NextResponse.json({ ok: true });
}
