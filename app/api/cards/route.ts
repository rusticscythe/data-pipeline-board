import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

export const dynamic = "force-dynamic";

async function ensureTable() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS pipeline_cards (
      id SERIAL PRIMARY KEY,
      card_id VARCHAR(100) UNIQUE NOT NULL,
      source_key VARCHAR(50) NOT NULL,
      entry_point TEXT DEFAULT '',
      entry_person TEXT DEFAULT '',
      data_structure TEXT DEFAULT '',
      business_activities JSONB DEFAULT '[]',
      mode VARCHAR(20) DEFAULT 'paper',
      system_tags JSONB DEFAULT '[]',
      sort_order INT DEFAULT 0,
      created_by VARCHAR(100) DEFAULT '',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
  // migrate old schema if needed
  await sql`ALTER TABLE pipeline_cards ADD COLUMN IF NOT EXISTS entry_point TEXT DEFAULT ''`;
  await sql`ALTER TABLE pipeline_cards ADD COLUMN IF NOT EXISTS entry_person TEXT DEFAULT ''`;
  await sql`ALTER TABLE pipeline_cards ADD COLUMN IF NOT EXISTS data_structure TEXT DEFAULT ''`;
  await sql`ALTER TABLE pipeline_cards ADD COLUMN IF NOT EXISTS business_activities JSONB DEFAULT '[]'`;
  await sql`ALTER TABLE pipeline_cards ADD COLUMN IF NOT EXISTS mode VARCHAR(20) DEFAULT 'paper'`;
  await sql`ALTER TABLE pipeline_cards ADD COLUMN IF NOT EXISTS system_tags JSONB DEFAULT '[]'`;
}

export async function GET(req: NextRequest) {
  const sql = getDb();
  await ensureTable();
  const source = req.nextUrl.searchParams.get("source");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = source
    ? (await sql`SELECT * FROM pipeline_cards WHERE source_key = ${source} ORDER BY sort_order, id`) as any[]
    : (await sql`SELECT * FROM pipeline_cards ORDER BY source_key, sort_order, id`) as any[];
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const sql = getDb();
  await ensureTable();
  const {
    card_id, source_key,
    entry_point, entry_person, data_structure,
    business_activities, mode, system_tags,
    sort_order, created_by,
  } = await req.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (await sql`
    INSERT INTO pipeline_cards
      (card_id, source_key, entry_point, entry_person, data_structure, business_activities, mode, system_tags, sort_order, created_by)
    VALUES
      (${card_id}, ${source_key},
       ${entry_point ?? ""}, ${entry_person ?? ""}, ${data_structure ?? ""},
       ${JSON.stringify(business_activities ?? [])}::jsonb,
       ${mode ?? "paper"},
       ${JSON.stringify(system_tags ?? [])}::jsonb,
       ${sort_order ?? 0}, ${created_by ?? ""})
    RETURNING *
  `) as any[];
  return NextResponse.json(rows[0]);
}
