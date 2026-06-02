import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const sql = getDb();
  const rows = (await sql`SELECT * FROM pipeline_edges ORDER BY id`) as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const sql = getDb();
  const { edge_id, source_node, target_node, label } = await req.json();
  const rows = (await sql`
    INSERT INTO pipeline_edges (edge_id, source_node, target_node, label)
    VALUES (${edge_id}, ${source_node}, ${target_node}, ${label ?? ''})
    ON CONFLICT (edge_id) DO UPDATE SET label = EXCLUDED.label
    RETURNING *
  `) as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  return NextResponse.json(rows[0]);
}

export async function DELETE(req: NextRequest) {
  const sql = getDb();
  const { edge_id } = await req.json();
  await sql`DELETE FROM pipeline_edges WHERE edge_id = ${edge_id}`;
  return NextResponse.json({ ok: true });
}
