import type { RiskCategory } from "./api";

export function categoryFromScore(score: number): RiskCategory {
  if (score >= 80) return "CRITICAL";
  if (score >= 50) return "HIGH";
  if (score >= 25) return "MEDIUM";
  return "LOW";
}

export const riskMeta: Record<
  RiskCategory,
  { label: string; color: string; tw: string; bg: string; ring: string }
> = {
  LOW: {
    label: "Low risk",
    color: "hsl(var(--risk-low))",
    tw: "text-risk-low",
    bg: "bg-risk-low/10 border-risk-low/30",
    ring: "ring-risk-low/40",
  },
  MEDIUM: {
    label: "Medium risk",
    color: "hsl(var(--risk-medium))",
    tw: "text-risk-medium",
    bg: "bg-risk-medium/10 border-risk-medium/30",
    ring: "ring-risk-medium/40",
  },
  HIGH: {
    label: "High risk",
    color: "hsl(var(--risk-high))",
    tw: "text-risk-high",
    bg: "bg-risk-high/10 border-risk-high/30",
    ring: "ring-risk-high/40",
  },
  CRITICAL: {
    label: "Critical risk",
    color: "hsl(var(--risk-critical))",
    tw: "text-risk-critical",
    bg: "bg-risk-critical/10 border-risk-critical/30",
    ring: "ring-risk-critical/40",
  },
};
