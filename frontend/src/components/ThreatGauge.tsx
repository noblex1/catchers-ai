import { motion } from "framer-motion";
import { categoryFromScore, riskMeta } from "@/lib/risk";

interface Props {
  score: number;
  size?: number;
}

export const ThreatGauge = ({ score, size = 220 }: Props) => {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const category = categoryFromScore(clamped);
  const meta = riskMeta[category];
  const radius = size / 2 - 14;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-40"
        style={{ background: meta.color }}
      />
      <svg width={size} height={size} className="-rotate-90 relative">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={12}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={meta.color}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 12px ${meta.color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="text-5xl font-bold tabular-nums"
          style={{ color: meta.color }}
        >
          {clamped}
        </motion.span>
        <span className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
          Threat score
        </span>
      </div>
    </div>
  );
};
