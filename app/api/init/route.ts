import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { PRESET_SOURCES } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const sql = getDb();

  await sql`
    CREATE TABLE IF NOT EXISTS pipeline_sources (
      id SERIAL PRIMARY KEY,
      source_key VARCHAR(50) UNIQUE NOT NULL,
      entry_point TEXT DEFAULT '',
      entry_person TEXT DEFAULT '',
      data_structure TEXT DEFAULT '',
      business_activities JSONB DEFAULT '[]',
      mode VARCHAR(20) DEFAULT 'paper',
      system_tags JSONB DEFAULT '[]',
      updated_at TIMESTAMP DEFAULT NOW(),
      updated_by VARCHAR(100) DEFAULT '',
      pos_x FLOAT DEFAULT 0,
      pos_y FLOAT DEFAULT 0
    )
  `;

  await sql`
    ALTER TABLE pipeline_sources
    ADD COLUMN IF NOT EXISTS pos_x FLOAT DEFAULT 0
  `;
  await sql`
    ALTER TABLE pipeline_sources
    ADD COLUMN IF NOT EXISTS pos_y FLOAT DEFAULT 0
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS pipeline_edges (
      id SERIAL PRIMARY KEY,
      edge_id VARCHAR(100) UNIQUE NOT NULL,
      source_node VARCHAR(100) NOT NULL,
      target_node VARCHAR(100) NOT NULL,
      label TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS pipeline_notes (
      id SERIAL PRIMARY KEY,
      note_id VARCHAR(100) UNIQUE NOT NULL,
      content TEXT DEFAULT '',
      color VARCHAR(20) DEFAULT 'yellow',
      parent_key VARCHAR(50) DEFAULT '',
      pos_x FLOAT DEFAULT 0,
      pos_y FLOAT DEFAULT 0,
      updated_at TIMESTAMP DEFAULT NOW(),
      updated_by VARCHAR(100) DEFAULT ''
    )
  `;

  const spacing = 420;
  for (let i = 0; i < PRESET_SOURCES.length; i++) {
    const s = PRESET_SOURCES[i];
    const col = i % 3;
    const row = Math.floor(i / 3);
    await sql`
      INSERT INTO pipeline_sources (source_key, pos_x, pos_y)
      VALUES (${s.key}, ${col * spacing}, ${row * 500})
      ON CONFLICT (source_key) DO NOTHING
    `;
  }

  return NextResponse.json({ ok: true });
}
