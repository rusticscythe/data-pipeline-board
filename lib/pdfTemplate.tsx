import React from "react";
import {
  Document, Page, Text, View, StyleSheet, Font,
} from "@react-pdf/renderer";
import { PipelineSource, UserCard, MODES } from "./types";

// Use built-in Helvetica (no font files needed)
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 40,
    backgroundColor: "#f8f9fa",
  },
  // ── Cover header ──
  header: {
    backgroundColor: "#111827",
    borderRadius: 8,
    padding: 20,
    marginBottom: 24,
  },
  headerTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 20,
    color: "#ffffff",
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 10,
    color: "#9ca3af",
  },
  exportDate: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 3,
  },

  // ── Source block ──
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
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
    color: "#111827",
  },
  modeBadge: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  sourceBody: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  // ── Field rows ──
  fieldRow: {
    flexDirection: "row",
    marginBottom: 6,
    gap: 6,
  },
  fieldLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: "#6b7280",
    width: 100,
    textTransform: "uppercase",
  },
  fieldValue: {
    fontSize: 10,
    color: "#374151",
    flex: 1,
  },
  fieldValueEmpty: {
    fontSize: 10,
    color: "#d1d5db",
    flex: 1,
    fontStyle: "italic",
  },

  // ── Chips ──
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 2,
  },
  chip: {
    backgroundColor: "#dbeafe",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  chipText: {
    fontSize: 8,
    color: "#1d4ed8",
    fontFamily: "Helvetica-Bold",
  },
  tagChip: {
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    border: "1pt solid #d1d5db",
  },
  tagChipText: {
    fontSize: 8,
    color: "#6b7280",
  },

  // ── Divider ──
  divider: {
    borderBottom: "1pt solid #f0f0f0",
    marginVertical: 8,
  },

  // ── Cards section ──
  cardsSection: {
    marginTop: 6,
  },
  cardsSectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: "#9ca3af",
    textTransform: "uppercase",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: "#f9fafb",
    border: "1pt solid #e5e7eb",
    borderRadius: 6,
    padding: 10,
    marginBottom: 6,
  },
  cardEntryPoint: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: "#1f2937",
    marginBottom: 4,
  },
  cardModeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },

  // ── Footer ──
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "1pt solid #e5e7eb",
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
    color: "#9ca3af",
  },

  // ── No data ──
  noData: {
    fontSize: 9,
    color: "#d1d5db",
    fontStyle: "italic",
    paddingVertical: 4,
  },
});

const MODE_COLORS: Record<string, { bg: string; text: string }> = {
  paper:      { bg: "#f3f4f6", text: "#6b7280" },
  manual:     { bg: "#fef3c7", text: "#92400e" },
  "semi-auto": { bg: "#dbeafe", text: "#1e40af" },
  auto:       { bg: "#d1fae5", text: "#065f46" },
};

function ModeBadge({ mode }: { mode: string }) {
  const c = MODE_COLORS[mode] ?? MODE_COLORS.paper;
  const label = MODES.find(m => m.value === mode)?.label ?? mode;
  return (
    <View style={[styles.modeBadge, { backgroundColor: c.bg }]}>
      <Text style={{ color: c.text, fontSize: 9, fontFamily: "Helvetica-Bold" }}>{label}</Text>
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
    <Document title="Data Pipeline Board" author={exportedBy ?? "Data Pipeline Board"}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Data Pipeline Board</Text>
          <Text style={styles.headerSub}>แผนที่ข้อมูลและกระบวนการสำหรับทีม</Text>
          <Text style={styles.exportDate}>
            Export วันที่ {now}{exportedBy ? `  ·  โดย ${exportedBy}` : ""}
          </Text>
        </View>

        {/* Source blocks */}
        {sources.map(src => {
          const srcCards = cards.filter(c => c.source_key === src.source_key);
          return (
            <View key={src.source_key} style={styles.sourceBlock} wrap={false}>
              {/* Source header */}
              <View style={styles.sourceHeader}>
                <Text style={styles.sourceName}>{src.source_name}</Text>
                <ModeBadge mode={src.mode} />
              </View>

              <View style={styles.sourceBody}>
                {/* Entry Point */}
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Entry Point</Text>
                  {src.entry_point
                    ? <Text style={styles.fieldValue}>{src.entry_point}</Text>
                    : <Text style={styles.fieldValueEmpty}>-</Text>}
                </View>

                {/* Person */}
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>ผู้รับผิดชอบ</Text>
                  {src.entry_person
                    ? <Text style={styles.fieldValue}>{src.entry_person}</Text>
                    : <Text style={styles.fieldValueEmpty}>-</Text>}
                </View>

                {/* Data Structure */}
                {src.data_structure ? (
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>โครงสร้างข้อมูล</Text>
                    <Text style={styles.fieldValue}>{src.data_structure}</Text>
                  </View>
                ) : null}

                {/* Business Activities */}
                {(src.business_activities ?? []).length > 0 && (
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Activities</Text>
                    <View style={[styles.chipsRow, { flex: 1 }]}>
                      {src.business_activities.map(a => (
                        <View key={a} style={styles.chip}>
                          <Text style={styles.chipText}>{a}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* System Tags */}
                {(src.system_tags ?? []).length > 0 && (
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>ระบบที่ใช้</Text>
                    <View style={[styles.chipsRow, { flex: 1 }]}>
                      {src.system_tags.map(t => (
                        <View key={t} style={styles.tagChip}>
                          <Text style={styles.tagChipText}>{t}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Cards */}
                {srcCards.length > 0 && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.cardsSection}>
                      <Text style={styles.cardsSectionTitle}>
                        ข้อมูล / การ์ด ({srcCards.length} รายการ)
                      </Text>
                      {srcCards.map((card, i) => (
                        <View key={card.card_id} style={styles.card}>
                          {/* Card number + mode */}
                          <View style={styles.cardModeRow}>
                            <Text style={{ fontSize: 8, color: "#9ca3af" }}>#{i + 1}</Text>
                            <ModeBadge mode={card.mode} />
                            {card.entry_person ? (
                              <Text style={{ fontSize: 8, color: "#6b7280" }}>👤 {card.entry_person}</Text>
                            ) : null}
                          </View>

                          {card.entry_point ? (
                            <Text style={styles.cardEntryPoint}>{card.entry_point}</Text>
                          ) : null}

                          {card.data_structure ? (
                            <Text style={[styles.fieldValue, { marginBottom: 4 }]}>{card.data_structure}</Text>
                          ) : null}

                          {(card.business_activities ?? []).length > 0 && (
                            <View style={styles.chipsRow}>
                              {card.business_activities.map(a => (
                                <View key={a} style={styles.chip}>
                                  <Text style={styles.chipText}>{a}</Text>
                                </View>
                              ))}
                            </View>
                          )}

                          {(card.system_tags ?? []).length > 0 && (
                            <View style={[styles.chipsRow, { marginTop: 4 }]}>
                              {card.system_tags.map(t => (
                                <View key={t} style={styles.tagChip}>
                                  <Text style={styles.tagChipText}>{t}</Text>
                                </View>
                              ))}
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  </>
                )}

                {srcCards.length === 0 && (
                  <Text style={styles.noData}>ยังไม่มีการ์ด</Text>
                )}
              </View>
            </View>
          );
        })}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Data Pipeline Board</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) =>
            `หน้า ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
