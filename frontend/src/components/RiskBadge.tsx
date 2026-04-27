import { AlertTriangle, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";
import { riskMeta } from "@/lib/risk";
import type { RiskCategory } from "@/lib/api";

const icons = {
  LOW: ShieldCheck,
  MEDIUM: ShieldAlert,
  HIGH: AlertTriangle,
  CRITICAL: ShieldX,
};

export const RiskBadge = ({ category, size = "md" }: { category: RiskCategory; size?: "sm" | "md" }) => {
  const meta = riskMeta[category];
  const Icon = icons[category];
  const sizing = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${meta.bg} ${meta.tw} ${sizing}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {meta.label}
    </span>
  );
};
