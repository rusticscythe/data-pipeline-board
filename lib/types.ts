export type Mode = "paper" | "manual" | "semi-auto" | "auto";
export type SystemTag = "ทำเอง" | "DCC" | "ODOO" | "CHAMP" | "Others";
export type BusinessActivity =
  | "Demand Forecasting"
  | "Inventory Planning"
  | "Pricing Strategy"
  | "Customer Segmentation"
  | "Marketing Campaign"
  | "Operations"
  | "Finance";

export interface PipelineSource {
  id: number;
  source_key: string;
  source_name: string;
  entry_point: string;
  entry_person: string;
  data_structure: string;
  business_activities: BusinessActivity[];
  mode: Mode;
  system_tags: SystemTag[];
  updated_at: string;
  updated_by: string;
  pos_x: number;
  pos_y: number;
}

export interface PipelineNote {
  id: number;
  note_id: string;
  content: string;
  color: string;
  parent_key: string;
  pos_x: number;
  pos_y: number;
  updated_at: string;
  updated_by: string;
}

export const PRESET_SOURCES: { key: string; name: string }[] = [
  { key: "pos", name: "Point of Sale (POS)" },
  { key: "ecommerce", name: "E-commerce" },
  { key: "inventory", name: "Inventory Systems" },
  { key: "cdp", name: "Customer Data Platforms (CDP)" },
  { key: "external", name: "External Factors" },
];

export const BUSINESS_ACTIVITIES: BusinessActivity[] = [
  "Demand Forecasting",
  "Inventory Planning",
  "Pricing Strategy",
  "Customer Segmentation",
  "Marketing Campaign",
  "Operations",
  "Finance",
];

export const MODES: { value: Mode; label: string }[] = [
  { value: "paper", label: "Paper" },
  { value: "manual", label: "Manual" },
  { value: "semi-auto", label: "Semi-Auto" },
  { value: "auto", label: "Auto" },
];

export const SYSTEM_TAGS: SystemTag[] = ["ทำเอง", "DCC", "ODOO", "CHAMP", "Others"];

export const MODE_ACCENT: Record<Mode, { border: string; badge: string; header: string }> = {
  paper:     { border: "border-gray-300",  badge: "bg-gray-100 text-gray-600",    header: "bg-gray-50" },
  manual:    { border: "border-amber-300", badge: "bg-amber-100 text-amber-700",  header: "bg-amber-50" },
  "semi-auto": { border: "border-blue-300",  badge: "bg-blue-100 text-blue-700",    header: "bg-blue-50" },
  auto:      { border: "border-emerald-300", badge: "bg-emerald-100 text-emerald-700", header: "bg-emerald-50" },
};

export const NOTE_COLORS: { value: string; bg: string; border: string }[] = [
  { value: "yellow", bg: "bg-yellow-100", border: "border-yellow-300" },
  { value: "blue",   bg: "bg-blue-100",   border: "border-blue-300" },
  { value: "green",  bg: "bg-green-100",  border: "border-green-300" },
  { value: "pink",   bg: "bg-pink-100",   border: "border-pink-300" },
  { value: "purple", bg: "bg-purple-100", border: "border-purple-300" },
];

export interface UserCard {
  id: number;
  card_id: string;
  source_key: string;
  entry_point: string;
  entry_person: string;
  data_structure: string;
  business_activities: BusinessActivity[];
  mode: Mode;
  system_tags: SystemTag[];
  sort_order: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}
