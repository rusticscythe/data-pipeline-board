import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { PRESET_SOURCES } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const sql = getDb();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (await sql`SELECT * FROM pipeline_sources ORDER BY id`) as any[];
  const result = rows.map((row) => ({
    ...row,
    source_name: PRESET_SOURCES.find((s) => s.key === row.source_key)?.name ?? row.source_key,
    updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  }));
  return NextResponse.json(result);
}
