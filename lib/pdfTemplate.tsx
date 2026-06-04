import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import path from "path";
import { PipelineSource, UserCard, MODES } from "./types";

// ── Fonts ──
const fontsDir = path.join(process.cwd(), "public", "fonts");
Font.register({ family: "Sarabun",     src: path.join(fontsDir, "Sarabun-Regular.ttf") });
Font.register({ family: "SarabunBold", src: path.join(fontsDir, "Sarabun-Bold.ttf") });

// ── A3 Landscape dimensions (pt) ──
// A3 = 297×420 mm → landscape = 1190 × 841 pt
const PAGE_W = 1190;
const PAGE_PAD = 24;
const COL_GAP = 8;
const NUM_COLS = 5;
const COL_W = (PAGE_W - PAGE_PAD * 2 - COL_GAP * (NUM_COLS - 1)) / NUM_COLS; // ≈ 214pt

// ── Mode colors ──
const MODE_CLR: Record<string, { bg: string; text: string; border: string; colBg: string }> = {
  paper:       { bg: "#F1F5F9", text: "#64748B", border: "#CBD5E1", colBg: "#F8FAFC" },
  manual:      { bg: "#FEF3C7", text: "#92400E", border: "#FCD34D", colBg: "#FFFBEB" },
  "semi-auto": { bg: "#DBEAFE", text: "#1D4ED8", border: "#93C5FD", colBg: "#EFF6FF" },
  auto:        { bg: "#D1FAE5", text: "#065F46", border: "#6EE7B7", colBg: "#F0FDF4" },
};

const S = StyleSheet.create({
  page: {
    fontFamily: "Sarabun",
    fontSize: 9,
    backgroundColor: "#F1F5F9",
    paddingTop: PAGE_PAD,
    paddingBottom: PAGE_PAD,
    paddingHorizontal: PAGE_PAD,
  },

  // Top bar
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 10,
  },
  topBarTitle: { fontFamily: "SarabunBold", fontSize: 14, color: "#FFFFFF" },
  topBarSub:   { fontFamily: "Sarabun",     fontSize: 9,  color: "#94A3B8", marginTop: 1 },
  topBarMeta:  { fontFamily: "Sarabun",     fontSize: 8,  color: "#64748B" },

  // Columns row
  colRow: {
    flexDirection: "row",
    gap: COL_GAP,
    flex: 1,
  },

  // Single column
  col: {
    width: COL_W,
    borderRadius: 8,
    overflow: "hidden",
    flexDirection: "column",
  },

  // Column header
  colHead: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  colHeadTitle: {
    fontFamily: "SarabunBold",
    fontSize: 11,
    color: "#1E293B",
    marginBottom: 2,
  },
  colHeadSub: {
    fontFamily: "Sarabun",
    fontSize: 8,
    color: "#64748B",
  },

  // Source info section
  srcSection: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottom: "1pt solid #E2E8F0",
  },
  fieldRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  fieldLabel: {
    fontFamily: "SarabunBold",
    fontSize: 8,
    color: "#94A3B8",
    width: 72,
  },
  fieldVal: {
    fontFamily: "Sarabun",
    fontSize: 8,
    color: "#374151",
    flex: 1,
    lineHeight: 1.5,
  },
  fieldValFaint: {
    fontFamily: "Sarabun",
    fontSize: 8,
    color: "#CBD5E1",
    flex: 1,
  },

  // Cards section
  cardsSection: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 8,
    flex: 1,
  },
  cardsSectionLabel: {
    fontFamily: "SarabunBold",
    fontSize: 7,
    color: "#94A3B8",
    marginBottom: 5,
    letterSpacing: 0.3,
  },

  // Card item
  cardItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
    border: "1pt solid #E2E8F0",
    paddingHorizontal: 8,
    paddingVertical: 7,
    marginBottom: 5,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 4,
  },
  cardNum: {
    fontFamily: "Sarabun",
    fontSize: 7,
    color: "#CBD5E1",
  },
  modePill: {
    fontFamily: "SarabunBold",
    fontSize: 7,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 8,
  },
  cardPerson: {
    fontFamily: "Sarabun",
    fontSize: 7,
    color: "#64748B",
    flex: 1,
  },
  cardTitle: {
    fontFamily: "SarabunBold",
    fontSize: 9,
    color: "#1E293B",
    marginBottom: 3,
  },
  cardBody: {
    fontFamily: "Sarabun",
    fontSize: 8,
    color: "#475569",
    lineHeight: 1.5,
    marginBottom: 3,
  },
  tagsText: {
    fontFamily: "Sarabun",
    fontSize: 7.5,
    color: "#2563EB",
    marginBottom: 2,
  },
  sysText: {
    fontFamily: "Sarabun",
    fontSize: 7.5,
    color: "#64748B",
  },
  noCard: {
    fontFamily: "Sarabun",
    fontSize: 8,
    color: "#CBD5E1",
    paddingVertical: 4,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 10,
    left: PAGE_PAD,
    right: PAGE_PAD,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontFamily: "Sarabun",
    fontSize: 7,
    color: "#CBD5E1",
  },
});

function modeLabel(mode: string) {
  return MODES.find(m => m.value === mode)?.label ?? mode;
}

interface Props {
  sources: PipelineSource[];
  cards: UserCard[];
  exportedBy?: string;
}

export default function PipelinePDF({ sources, cards, exportedBy }: Props) {
  const now = new Date().toLocaleDateString("th-TH", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <Document title="Data Pipeline Board">
      <Page
        size="A3"
        orientation="landscape"
        style={S.page}
      >
        {/* ── Top bar ── */}
        <View style={S.topBar}>
          <View>
            <Text style={S.topBarTitle}>Data Pipeline Board</Text>
            <Text style={S.topBarSub}>แผนที่ข้อมูลและกระบวนการสำหรับทีม</Text>
          </View>
          <Text style={S.topBarMeta}>
            Export: {now}{exportedBy ? `   |   โดย: ${exportedBy}` : ""}
          </Text>
        </View>

        {/* ── 5 Columns ── */}
        <View style={S.colRow}>
          {sources.map(src => {
            const srcCards = cards.filter(c => c.source_key === src.source_key);
            const clr = MODE_CLR[src.mode] ?? MODE_CLR.paper;
            const acts  = (src.business_activities ?? []).join(" · ");
            const tags  = (src.system_tags ?? []).join(" · ");

            return (
              <View key={src.source_key} style={[S.col, { backgroundColor: clr.colBg, border: `1pt solid ${clr.border}` }]}>

                {/* Column header */}
                <View style={[S.colHead, { backgroundColor: clr.bg }]}>
                  <Text style={S.colHeadTitle}>{src.source_name}</Text>
                  <Text style={S.colHeadSub}>{srcCards.length} การ์ด</Text>
                </View>

                {/* Source info */}
                <View style={S.srcSection}>
                  <View style={S.fieldRow}>
                    <Text style={S.fieldLabel}>Entry Point</Text>
                    <Text style={src.entry_point ? S.fieldVal : S.fieldValFaint}>
                      {src.entry_point || "-"}
                    </Text>
                  </View>
                  <View style={S.fieldRow}>
                    <Text style={S.fieldLabel}>ผู้รับผิดชอบ</Text>
                    <Text style={src.entry_person ? S.fieldVal : S.fieldValFaint}>
                      {src.entry_person || "-"}
                    </Text>
                  </View>
                  {src.data_structure ? (
                    <View style={S.fieldRow}>
                      <Text style={S.fieldLabel}>โครงสร้าง</Text>
                      <Text style={S.fieldVal}>{src.data_structure}</Text>
                    </View>
                  ) : null}
                  {acts ? (
                    <View style={S.fieldRow}>
                      <Text style={S.fieldLabel}>Activities</Text>
                      <Text style={[S.fieldVal, { color: "#2563EB" }]}>{acts}</Text>
                    </View>
                  ) : null}
                  {tags ? (
                    <View style={S.fieldRow}>
                      <Text style={S.fieldLabel}>ระบบ</Text>
                      <Text style={[S.fieldVal, { color: "#64748B" }]}>{tags}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Cards */}
                <View style={S.cardsSection}>
                  {srcCards.length === 0 ? (
                    <Text style={S.noCard}>ยังไม่มีข้อมูล</Text>
                  ) : (
                    <>
                      <Text style={S.cardsSectionLabel}>ข้อมูลที่บันทึก</Text>
                      {srcCards.map((card, i) => {
                        const cClr = MODE_CLR[card.mode] ?? MODE_CLR.paper;
                        const cActs = (card.business_activities ?? []).join(" · ");
                        const cTags = (card.system_tags ?? []).join(" · ");
                        return (
                          <View key={card.card_id} style={S.cardItem}>
                            {/* Top row: number + mode + person */}
                            <View style={S.cardTopRow}>
                              <Text style={S.cardNum}>#{i + 1}</Text>
                              <View style={[S.modePill, { backgroundColor: cClr.bg }]}>
                                <Text style={{ color: cClr.text, fontFamily: "SarabunBold", fontSize: 7 }}>
                                  {modeLabel(card.mode)}
                                </Text>
                              </View>
                              {card.entry_person ? (
                                <Text style={S.cardPerson}>{card.entry_person}</Text>
                              ) : null}
                            </View>

                            {/* Entry point = title */}
                            {card.entry_point ? (
                              <Text style={S.cardTitle}>{card.entry_point}</Text>
                            ) : null}

                            {/* Data structure */}
                            {card.data_structure ? (
                              <Text style={S.cardBody}>{card.data_structure}</Text>
                            ) : null}

                            {/* Activities as plain text */}
                            {cActs ? (
                              <Text style={S.tagsText}>{cActs}</Text>
                            ) : null}

                            {/* System tags as plain text */}
                            {cTags ? (
                              <Text style={S.sysText}>{cTags}</Text>
                            ) : null}
                          </View>
                        );
                      })}
                    </>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* ── Footer ── */}
        <View style={S.footer} fixed>
          <Text style={S.footerText}>Data Pipeline Board</Text>
          <Text
            style={S.footerText}
            render={({ pageNumber, totalPages }) =>
              totalPages > 1 ? `หน้า ${pageNumber} / ${totalPages}` : ""}
          />
        </View>
      </Page>
    </Document>
  );
}
