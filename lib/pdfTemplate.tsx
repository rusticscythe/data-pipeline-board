import React from "react";
import {
  Document, Page, Text, View, StyleSheet, Font,
} from "@react-pdf/renderer";
import path from "path";
import { PipelineSource, UserCard, MODES } from "./types";

// ── Register Sarabun (Thai-compatible font) ──
const fontsDir = path.join(process.cwd(), "public", "fonts");
Font.register({
  family: "Sarabun",
  fonts: [
    { src: path.join(fontsDir, "Sarabun-Regular.ttf"), fontWeight: "normal" },
    { src: path.join(fontsDir, "Sarabun-Bold.ttf"),    fontWeight: "bold" },
  ],
});

// ── Styles ──
const S = StyleSheet.create({
  page: {
    fontFamily: "Sarabun",
    fontWeight: "normal",
    fontSize: 11,
    paddingTop: 40,
    paddingBottom: 52,
    paddingHorizontal: 40,
    backgroundColor: "#f8f9fa",
  },

  // Header
  header: {
    backgroundColor: "#111827",
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: "Sarabun",
    fontWeight: "bold",
    fontSize: 22,
    color: "#ffffff",
    marginBottom: 4,
  },
  headerSub: {
    fontFamily: "Sarabun",
    fontSize: 12,
    color: "#9ca3af",
  },
  headerMeta: {
    fontFamily: "Sarabun",
    fontSize: 10,
    color: "#6b7280",
    marginTop: 4,
  },

  // Source block
  sourceBlock: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    border: "1pt solid #e5e7eb",
    marginBottom: 16,
    overflow: "hidden",
  },
  sourceHeader: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottom: "1pt solid #e5e7eb",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sourceName: {
    fontFamily: "Sarabun",
    fontWeight: "bold",
    fontSize: 14,
    color: "#111827",
  },
  modeBadge: {
    fontFamily: "Sarabun",
    fontWeight: "bold",
    fontSize: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  sourceBody: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  // Fields
  fieldRow: {
    flexDirection: "row",
    marginBottom: 7,
    gap: 8,
  },
  fieldLabel: {
    fontFamily: "Sarabun",
    fontWeight: "bold",
    fontSize: 10,
    color: "#6b7280",
    width: 110,
    paddingTop: 1,
  },
  fieldValue: {
    fontFamily: "Sarabun",
    fontSize: 11,
    color: "#374151",
    flex: 1,
    lineHeight: 1.5,
  },
  fieldEmpty: {
    fontFamily: "Sarabun",
    fontSize: 11,
    color: "#d1d5db",
    flex: 1,
  },

  // Chips
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    flex: 1,
  },
  actChip: {
    backgroundColor: "#dbeafe",
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  actChipText: {
    fontFamily: "Sarabun",
    fontSize: 9,
    color: "#1d4ed8",
  },
  tagChip: {
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    border: "1pt solid #d1d5db",
  },
  tagChipText: {
    fontFamily: "Sarabun",
    fontSize: 9,
    color: "#6b7280",
  },

  // Divider
  divider: {
    borderBottom: "1pt solid #f0f0f0",
    marginVertical: 10,
  },

  // Cards section
  cardsSectionTitle: {
    fontFamily: "Sarabun",
    fontWeight: "bold",
    fontSize: 10,
    color: "#9ca3af",
    marginBottom: 7,
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: "#f9fafb",
    border: "1pt solid #e5e7eb",
    borderRadius: 6,
    padding: 10,
    marginBottom: 6,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 5,
  },
  cardNum: {
    fontFamily: "Sarabun",
    fontSize: 9,
    color: "#9ca3af",
  },
  cardPerson: {
    fontFamily: "Sarabun",
    fontSize: 9,
    color: "#6b7280",
  },
  cardEntryPoint: {
    fontFamily: "Sarabun",
    fontWeight: "bold",
    fontSize: 12,
    color: "#1f2937",
    marginBottom: 4,
  },
  cardDataStruct: {
    fontFamily: "Sarabun",
    fontSize: 10,
    color: "#4b5563",
    marginBottom: 5,
    lineHeight: 1.5,
  },
  noData: {
    fontFamily: "Sarabun",
    fontSize: 10,
    color: "#d1d5db",
    paddingVertical: 4,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "1pt solid #e5e7eb",
    paddingTop: 6,
  },
  footerText: {
    fontFamily: "Sarabun",
    fontSize: 9,
    color: "#9ca3af",
  },
});

const MODE_STYLE: Record<string, { bg: string; text: string }> = {
  paper:       { bg: "#f3f4f6", text: "#6b7280" },
  manual:      { bg: "#fef3c7", text: "#92400e" },
  "semi-auto": { bg: "#dbeafe", text: "#1e40af" },
  auto:        { bg: "#d1fae5", text: "#065f46" },
};

function ModeBadge({ mode }: { mode: string }) {
  const c = MODE_STYLE[mode] ?? MODE_STYLE.paper;
  const label = MODES.find(m => m.value === mode)?.label ?? mode;
  return (
    <View style={[S.modeBadge, { backgroundColor: c.bg }]}>
      <Text style={{ color: c.text, fontFamily: "Sarabun", fontWeight: "bold", fontSize: 10 }}>{label}</Text>
    </View>
  );
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
      <Page size="A4" style={S.page}>

        {/* ── Header ── */}
        <View style={S.header}>
          <Text style={S.headerTitle}>Data Pipeline Board</Text>
          <Text style={S.headerSub}>แผนที่ข้อมูลและกระบวนการสำหรับทีม</Text>
          <Text style={S.headerMeta}>
            Export วันที่ {now}{exportedBy ? `   ·   โดย ${exportedBy}` : ""}
          </Text>
        </View>

        {/* ── Source blocks ── */}
        {sources.map(src => {
          const srcCards = cards.filter(c => c.source_key === src.source_key);
          return (
            <View key={src.source_key} style={S.sourceBlock} wrap={false}>

              {/* Source header row */}
              <View style={S.sourceHeader}>
                <Text style={S.sourceName}>{src.source_name}</Text>
                <ModeBadge mode={src.mode} />
              </View>

              <View style={S.sourceBody}>

                {/* Entry Point */}
                <View style={S.fieldRow}>
                  <Text style={S.fieldLabel}>Entry Point</Text>
                  <Text style={src.entry_point ? S.fieldValue : S.fieldEmpty}>
                    {src.entry_point || "-"}
                  </Text>
                </View>

                {/* Person */}
                <View style={S.fieldRow}>
                  <Text style={S.fieldLabel}>ผู้รับผิดชอบ</Text>
                  <Text style={src.entry_person ? S.fieldValue : S.fieldEmpty}>
                    {src.entry_person || "-"}
                  </Text>
                </View>

                {/* Data Structure */}
                {src.data_structure ? (
                  <View style={S.fieldRow}>
                    <Text style={S.fieldLabel}>โครงสร้างข้อมูล</Text>
                    <Text style={S.fieldValue}>{src.data_structure}</Text>
                  </View>
                ) : null}

                {/* Business Activities */}
                {(src.business_activities ?? []).length > 0 && (
                  <View style={S.fieldRow}>
                    <Text style={S.fieldLabel}>Activities</Text>
                    <View style={S.chipsWrap}>
                      {src.business_activities.map(a => (
                        <View key={a} style={S.actChip}>
                          <Text style={S.actChipText}>{a}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* System Tags */}
                {(src.system_tags ?? []).length > 0 && (
                  <View style={S.fieldRow}>
                    <Text style={S.fieldLabel}>ระบบที่ใช้</Text>
                    <View style={S.chipsWrap}>
                      {src.system_tags.map(t => (
                        <View key={t} style={S.tagChip}>
                          <Text style={S.tagChipText}>{t}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Cards */}
                {srcCards.length > 0 ? (
                  <>
                    <View style={S.divider} />
                    <Text style={S.cardsSectionTitle}>ข้อมูลที่บันทึก ({srcCards.length} รายการ)</Text>
                    {srcCards.map((card, i) => (
                      <View key={card.card_id} style={S.card}>
                        <View style={S.cardTopRow}>
                          <Text style={S.cardNum}>#{i + 1}</Text>
                          <ModeBadge mode={card.mode} />
                          {card.entry_person ? (
                            <Text style={S.cardPerson}>👤 {card.entry_person}</Text>
                          ) : null}
                        </View>
                        {card.entry_point ? (
                          <Text style={S.cardEntryPoint}>{card.entry_point}</Text>
                        ) : null}
                        {card.data_structure ? (
                          <Text style={S.cardDataStruct}>{card.data_structure}</Text>
                        ) : null}
                        {(card.business_activities ?? []).length > 0 && (
                          <View style={[S.chipsWrap, { marginBottom: 4 }]}>
                            {card.business_activities.map(a => (
                              <View key={a} style={S.actChip}>
                                <Text style={S.actChipText}>{a}</Text>
                              </View>
                            ))}
                          </View>
                        )}
                        {(card.system_tags ?? []).length > 0 && (
                          <View style={S.chipsWrap}>
                            {card.system_tags.map(t => (
                              <View key={t} style={S.tagChip}>
                                <Text style={S.tagChipText}>{t}</Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    ))}
                  </>
                ) : (
                  <Text style={S.noData}>ยังไม่มีข้อมูลที่บันทึก</Text>
                )}
              </View>
            </View>
          );
        })}

        {/* ── Footer ── */}
        <View style={S.footer} fixed>
          <Text style={S.footerText}>Data Pipeline Board</Text>
          <Text
            style={S.footerText}
            render={({ pageNumber, totalPages }) => `หน้า ${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
