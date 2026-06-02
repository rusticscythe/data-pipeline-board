import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const sql = getDb();
  const { id } = await params;
  const { entry_point, entry_person, data_structure, business_activities, mode, system_tags } = await req.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (await sql`
    UPDATE pipeline_cards SET
      entry_point         = COALESCE(${entry_point         ?? null}, entry_point),
      entry_person        = COALESCE(${entry_person        ?? null}, entry_person),
      data_structure      = COALESCE(${data_structure      ?? null}, data_structure),
      business_activities = COALESCE(${business_activities != null ? JSON.stringify(business_activities) : null}::jsonb, business_activities),
      mode                = COALESCE(${mode                ?? null}, mode),
      system_tags         = COALESCE(${system_tags        != null ? JSON.stringify(system_tags) : null}::jsonb, system_tags),
      updated_at          = NOW()
    WHERE card_id = ${id}
    RETURNING *
  `) as any[];
  if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const sql = getDb();
  const { id } = await params;
  await sql`DELETE FROM pipeline_cards WHERE card_id = ${id}`;
  return NextResponse.json({ ok: true });
}
