import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "CAD"): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format(amount / 100);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function generateId(): string {
  return crypto.randomUUID();
}

export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const imageSizePresets = {
  instagram: { width: 1080, height: 1080, label: "Instagram Square" },
  "4x6": { width: 1200, height: 1800, label: "4×6 Print" },
  "5x7": { width: 1500, height: 2100, label: "5×7 Print" },
  "8x10": { width: 2400, height: 3000, label: "8×10 Print" },
  yearbook: { width: 2400, height: 3200, label: "Yearbook Portrait" },
  highRes: { width: 3600, height: 4800, label: "High-Resolution Download" },
} as const;

export type ImageSizePreset = keyof typeof imageSizePresets;

export const stylePresets = [
  { id: "cinematic", label: "Cinematic" },
  { id: "realistic", label: "Realistic" },
  { id: "studio", label: "Studio" },
  { id: "warm", label: "Warm" },
  { id: "professional", label: "Professional" },
  { id: "modern", label: "Modern" },
] as const;

export const backgroundPresets = [
  { id: "studio", label: "Studio" },
  { id: "campus", label: "Campus" },
  { id: "forest", label: "Fall Forest" },
  { id: "outdoor", label: "Outdoor" },
  { id: "elegant", label: "Elegant" },
] as const;

export const schoolColorsPresets = [
  { name: "University Red", hex: "#C41E3A" },
  { name: "Royal Blue", hex: "#4169E1" },
  { name: "Forest Green", hex: "#228B22" },
  { name: "Purple", hex: "#6A0DAD" },
  { name: "Gold", hex: "#FFD700" },
  { name: "Navy", hex: "#000080" },
  { name: "Maroon", hex: "#800000" },
  { name: "Burnt Orange", hex: "#CC5500" },
] as const;