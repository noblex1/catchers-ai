import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const stages = [
  "Fetching URL metadata…",
  "Querying VirusTotal & Safe Browsing…",
  "Cross-checking PhishTank database…",
  "Running ML threat model…",
  "Generating AI analysis…",
];

export const ScanLoading = () => (
  <div className="glass rounded-3xl p-8 md:p-12 relative overflow-hidden">
    <div className="absolute inset-0 pointer-events-none opacity-30 grid-pattern" />
    <div
      className="absolute left-0 right-0 h-24 bg-gradient-to-b from-primary/30 to-transparent animate-scan pointer-events-none"
      style={{ top: 0 }}
    />
    <div className="relative flex flex-col items-center text-center space-y-6">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl animate-pulse-glow" />
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <Loader2 className="w-9 h-9 text-primary-foreground animate-spin" />
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-bold">Analyzing threats…</h3>
        <p className="text-muted-foreground mt-1">This usually takes 1–6 seconds</p>
      </div>
      <div className="w-full max-w-sm space-y-2">
        {stages.map((s, i) => (
          <motion.div
            key={s}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.6 }}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            {s}
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);
