import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import getDb from "@/lib/db";
import { PRESET_SOURCES, PipelineSource, UserCard } from "@/lib/types";
import PipelinePDF from "@/lib/pdfTemplate";

export const dynamic = "force-dynamic";
// Must use Node.js runtime (not edge) for @react-pdf/renderer
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const sql = getDb();
  const exportedBy = req.nextUrl.searchParams.get("user") ?? "";

  // Fetch sources
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const srcRows = (await sql`SELECT * FROM pipeline_sources ORDER BY id`) as any[];
  const sources: PipelineSource[] = srcRows.map(row => ({
    ...row,
    source_name: PRESET_SOURCES.find(s => s.key === row.source_key)?.name ?? row.source_key,
  }));

  // Fetch cards
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cardRows = (await sql`SELECT * FROM pipeline_cards ORDER BY source_key, sort_order, id`) as any[];
  const cards: UserCard[] = cardRows;

  // Generate PDF buffer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(PipelinePDF as any, { sources, cards, exportedBy }) as any;
  const buffer = await renderToBuffer(element);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="data-pipeline-${new Date().toISOString().slice(0, 10)}.pdf"`,
    },
  });
}
