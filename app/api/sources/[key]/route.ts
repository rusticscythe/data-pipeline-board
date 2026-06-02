import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { PRESET_SOURCES } from "@/lib/types";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const sql = getDb();
  const { key } = await params;
  const body = await req.json();
  const { entry_point, entry_person, data_structure, business_activities, mode, system_tags, updated_by, pos_x, pos_y } = body;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await sql`
    UPDATE pipeline_sources SET
      entry_point = COALESCE(${entry_point ?? null}, entry_point),
      entry_person = COALESCE(${entry_person ?? null}, entry_person),
      data_structure = COALESCE(${data_structure ?? null}, data_structure),
      business_activities = COALESCE(${business_activities != null ? JSON.stringify(business_activities) : null}::jsonb, business_activities),
      mode = COALESCE(${mode ?? null}, mode),
      system_tags = COALESCE(${system_tags != null ? JSON.stringify(system_tags) : null}::jsonb, system_tags),
      updated_by = COALESCE(${updated_by ?? null}, updated_by),
      pos_x = COALESCE(${pos_x ?? null}, pos_x),
      pos_y = COALESCE(${pos_y ?? null}, pos_y),
      updated_at = NOW()
    WHERE source_key = ${key}
    RETURNING *
  `;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = result as any[];
  if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    ...rows[0],
    source_name: PRESET_SOURCES.find((s) => s.key === key)?.name ?? key,
    updated_at: new Date(rows[0].updated_at).toISOString(),
  });
}
