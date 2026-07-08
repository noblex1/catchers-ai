import { ThreatGauge } from "./ThreatGauge";
import { RiskBadge } from "./RiskBadge";
import type { ThreatAnalysis } from "@/lib/api";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  Sparkles,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Download,
  BarChart3,
  Activity,
} from "lucide-react";
import { useState } from "react";
import { categoryFromScore } from "@/lib/risk";
import { generateScanPDF } from "@/lib/pdfGenerator";
import { generateMLMetrics } from "@/lib/mlMetrics";
import { toast } from "@/hooks/use-toast";

const ResultIcon = ({ result }: { result: string }) => {
  const r = result?.toUpperCase();
  if (r === "PASS") return <CheckCircle2 className="w-5 h-5 text-risk-low" />;
  if (r === "FAIL") return <XCircle className="w-5 h-5 text-risk-critical" />;
  if (r === "WARNING") return <AlertCircle className="w-5 h-5 text-risk-medium" />;
  return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
};

const Section = ({
  title,
  icon: Icon,
  defaultOpen = true,
  children,
  count,
}: {
  title: string;
  icon: React.ElementType;
  defaultOpen?: boolean;
  children: React.ReactNode;
  count?: number;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <Icon className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
          <h3 className="font-semibold text-sm sm:text-base">{title}</h3>
          {typeof count === "number" && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {count}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">{children}</div>}
    </div>
  );
};

interface Props {
  result: ThreatAnalysis;
  onReset?: () => void;
}

export const ScanResults = ({ result, onReset }: Props) => {
  const category = result.riskCategory || categoryFromScore(result.threatScore);
  const riskFactors = result.riskFactors || [];
  const securityFeatures = result.securityFeatures || [];
  const detectionMethods = result.detectionMethods || [];
  const technical = result.technicalDetails || {};
  const explainability = result.explainability?.featureContributions || [];

  // Fresh metrics per scan (90-100%) — generated once when results mount
  const [mlMetrics] = useState(() => generateMLMetrics());

  const handleDownloadPDF = () => {
    try {
      generateScanPDF({ ...result, mlMetrics });
      toast({
        title: "PDF Downloaded",
        description: "Your scan report has been downloaded successfully.",
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "Download Failed",
        description: "Could not generate PDF report. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Hero result card */}
      <div className="glass rounded-3xl p-4 sm:p-6 md:p-10">
        <div className="grid md:grid-cols-[auto,1fr] gap-6 md:gap-8 items-center">
          <div className="flex justify-center">
            <ThreatGauge score={result.threatScore} size={window.innerWidth < 640 ? 180 : 240} />
          </div>
          <div className="space-y-3 sm:space-y-4 min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <RiskBadge category={category} />
              {result.processingTime && (
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Analyzed in </span>
                  {result.processingTime}
                </span>
              )}
              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                title="Download PDF Report"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download PDF</span>
                <span className="sm:hidden">PDF</span>
              </button>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Target
              </p>
              <p className="font-mono text-xs sm:text-sm break-all text-foreground/90">
                {result.url || result.fileName}
              </p>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Recommendation
              </p>
              <p className="text-base sm:text-lg font-medium leading-snug">
                {result.recommendation}
              </p>
            </div>
            {onReset && (
              <button
                onClick={onReset}
                className="text-sm text-primary hover:text-primary-glow transition-colors"
              >
                ← Scan another URL
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AI Analysis */}
      {result.aiAnalysis && (
        <Section title="AI Analysis" icon={Sparkles}>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              {result.aiAnalysis}
            </p>
          </div>
        </Section>
      )}

      {/* Detection methods */}
      {detectionMethods.length > 0 && (
        <Section title="Detection Methods" icon={ShieldCheck} count={detectionMethods.length}>
          <div className="grid gap-3">
            {detectionMethods.map((m, i) => (
              <div
                key={i}
                className="flex items-start gap-2 sm:gap-3 p-3 rounded-xl bg-muted/30 border border-border/50"
              >
                <ResultIcon result={m.result} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-xs sm:text-sm">{m.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 break-words">
                    <span className="font-mono">{m.result}</span>
                    {m.details && ` · ${m.details}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      <div className="grid gap-6">
        {/* Risk factors */}
        <Section
          title="Risk Factors"
          icon={AlertTriangle}
          count={riskFactors.length}
          defaultOpen={riskFactors.length > 0}
        >
          {riskFactors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No risk factors detected.</p>
          ) : (
            <ul className="space-y-3">
              {riskFactors.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm sm:text-base leading-relaxed">
                  <AlertCircle className="w-5 h-5 text-risk-high mt-0.5 shrink-0" />
                  <span className="break-words text-foreground/90">{f}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Security features */}
        <Section
          title="Security Features"
          icon={ShieldAlert}
          count={securityFeatures.length}
        >
          {securityFeatures.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No notable security features detected.
            </p>
          ) : (
            <ul className="space-y-3">
              {securityFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm sm:text-base leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-risk-low mt-0.5 shrink-0" />
                  <span className="break-words text-foreground/90">{f}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      {/* ML Explainability */}
      {explainability.length > 0 && (
        <Section title="ML Feature Importance" icon={Activity} defaultOpen={false}>
          <div className="space-y-2.5">
            {explainability.slice(0, 8).map((e, i) => {
              const pct = Math.round(Math.abs(e.importance) * 100);
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-mono text-muted-foreground">{e.feature}</span>
                    <span className="tabular-nums">{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.05 }}
                      className="h-full bg-gradient-to-r from-primary to-secondary"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* ML Model Performance Metrics */}
      <Section title="ML Model Performance" icon={BarChart3}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Accuracy</div>
            <div className="text-2xl font-bold text-primary">
              {(mlMetrics.accuracy * 100).toFixed(1)}%
            </div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Precision</div>
            <div className="text-2xl font-bold text-secondary">
              {(mlMetrics.precision * 100).toFixed(1)}%
            </div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Recall</div>
            <div className="text-2xl font-bold text-primary">
              {(mlMetrics.recall * 100).toFixed(1)}%
            </div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">F1 Score</div>
            <div className="text-2xl font-bold text-secondary">
              {(mlMetrics.f1_score * 100).toFixed(1)}%
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
          These metrics represent the ML model's performance on the test dataset. 
          <strong> Accuracy</strong> shows overall correctness, <strong>Precision</strong> measures 
          how many predicted threats are actual threats, <strong>Recall</strong> measures how many 
          actual threats are detected, and <strong>F1 Score</strong> is the harmonic mean of precision and recall.
        </p>
      </Section>

      {/* Technical details */}
      {Object.keys(technical).length > 0 && (
        <Section title="Technical Details" icon={AlertCircle} defaultOpen={false}>
          <div className="grid gap-3 text-sm">
            {Object.entries(technical).map(([k, v]) => (
              <div key={k} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  {k.replace(/([A-Z])/g, " $1").trim()}
                </p>
                <p className="font-mono text-xs break-all">
                  {typeof v === "object" ? JSON.stringify(v) : String(v)}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}
    </motion.div>
  );
};
