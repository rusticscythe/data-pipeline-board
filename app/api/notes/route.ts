import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const sql = getDb();
  const rows = (await sql`SELECT * FROM pipeline_notes ORDER BY id`) as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const sql = getDb();
  const { note_id, content, color, parent_key, pos_x, pos_y, updated_by } = await req.json();
  const rows = (await sql`
    INSERT INTO pipeline_notes (note_id, content, color, parent_key, pos_x, pos_y, updated_by)
    VALUES (${note_id}, ${content ?? ''}, ${color ?? 'yellow'}, ${parent_key ?? ''}, ${pos_x ?? 0}, ${pos_y ?? 0}, ${updated_by ?? ''})
    RETURNING *
  `) as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  return NextResponse.json(rows[0]);
}
