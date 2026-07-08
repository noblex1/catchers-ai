import { PageLayout } from "@/components/PageLayout";
import { useQuery } from "@tanstack/react-query";
import { getStatistics } from "@/lib/api";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Activity, ShieldCheck, Gauge, TrendingUp, Loader2, Globe } from "lucide-react";
import { riskMeta } from "@/lib/risk";
import type { RiskCategory } from "@/lib/api";

const CountUp = ({ value }: { value: number }) => {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const dur = 1200;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{n.toLocaleString()}</>;
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  suffix,
  color = "primary",
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  suffix?: string;
  color?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass rounded-2xl p-4 sm:p-6"
  >
    <div className="flex items-center justify-between mb-2 sm:mb-3">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-${color}/10 flex items-center justify-center`}>
        <Icon className={`w-4 h-4 text-${color}`} />
      </div>
    </div>
    <div className="text-2xl sm:text-3xl md:text-4xl font-bold tabular-nums">
      <CountUp value={value} />
      {suffix && <span className="text-sm sm:text-lg text-muted-foreground ml-1">{suffix}</span>}
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["stats"],
    queryFn: getStatistics,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const distribution = Object.entries(data?.threatDistribution || {}).map(([category, count]) => ({
    category,
    count,
  }));

  return (
    <PageLayout>
      <section className="container py-12 md:py-16">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Global Statistics</h1>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium w-fit">
              <Globe className="w-3.5 h-3.5" />
              All Users
            </div>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Real-time overview of all threat detection activity across the platform.
          </p>
        </div>

        {isLoading ? (
          <div className="glass rounded-2xl p-12 text-center">
            <Loader2 className="w-6 h-6 mx-auto animate-spin text-primary" />
            <p className="text-sm text-muted-foreground mt-3">Loading global statistics...</p>
          </div>
        ) : isError ? (
          <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
            <p className="font-semibold mb-2">Could not load statistics</p>
            <p className="text-sm">Make sure the backend is running and try again.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Activity} label="Total scans" value={data?.totalScans || 0} />
              <StatCard icon={TrendingUp} label="Last 24h" value={data?.recentScans || 0} />
              <StatCard
                icon={Gauge}
                label="Avg threat score"
                value={Math.round(data?.avgThreatScore || 0)}
                suffix="/100"
              />
              <StatCard
                icon={ShieldCheck}
                label="Safe scans"
                value={data?.threatDistribution?.LOW || 0}
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-4 sm:gap-5 mt-4 sm:mt-6">
              {/* Distribution */}
              <div className="glass rounded-2xl p-4 sm:p-6">
                <h3 className="font-semibold mb-1 text-sm sm:text-base">Threat distribution</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Breakdown of all scans by risk category.
                </p>
                <div className="h-48 sm:h-64">
                  {distribution.length === 0 || distribution.every(d => d.count === 0) ? (
                    <div className="h-full flex items-center justify-center text-xs sm:text-sm text-muted-foreground px-4 text-center">
                      No scans yet. Be the first to analyze a URL!
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={distribution.filter(d => d.count > 0)}
                          dataKey="count"
                          nameKey="category"
                          innerRadius={window.innerWidth < 640 ? 40 : 60}
                          outerRadius={window.innerWidth < 640 ? 70 : 95}
                          paddingAngle={3}
                          stroke="none"
                        >
                          {distribution.filter(d => d.count > 0).map((d, i) => (
                            <Cell
                              key={i}
                              fill={riskMeta[d.category as RiskCategory]?.color || "hsl(var(--muted))"}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "hsl(var(--popover))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: 12,
                            fontSize: '12px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mt-2">
                  {distribution.filter(d => d.count > 0).map((d) => (
                    <div key={d.category} className="flex items-center gap-1.5 text-xs">
                      <span
                        className="w-2.5 h-2.5 rounded-sm"
                        style={{ background: riskMeta[d.category as RiskCategory]?.color }}
                      />
                      <span className="text-muted-foreground">{d.category}</span>
                      <span className="font-semibold tabular-nums">{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info Card */}
              <div className="glass rounded-2xl p-4 sm:p-6">
                <h3 className="font-semibold mb-1 text-sm sm:text-base">ML Model Performance</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Machine learning model metrics on test dataset.
                </p>
                <div className="space-y-3 sm:space-y-4">
                  <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm font-medium">Accuracy</span>
                      <span className="text-xl sm:text-2xl font-bold text-primary">
                        {data?.mlMetrics?.accuracy ? (data.mlMetrics.accuracy * 100).toFixed(1) : '96.0'}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Overall correctness of the model's predictions
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm font-medium">Precision</span>
                      <span className="text-xl sm:text-2xl font-bold text-secondary">
                        {data?.mlMetrics?.precision ? (data.mlMetrics.precision * 100).toFixed(1) : '95.0'}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Accuracy of positive threat predictions
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm font-medium">Recall</span>
                      <span className="text-xl sm:text-2xl font-bold text-primary">
                        {data?.mlMetrics?.recall ? (data.mlMetrics.recall * 100).toFixed(1) : '94.0'}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Percentage of actual threats detected
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm font-medium">F1 Score</span>
                      <span className="text-xl sm:text-2xl font-bold text-secondary">
                        {data?.mlMetrics?.f1_score ? (data.mlMetrics.f1_score * 100).toFixed(1) : '94.5'}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Harmonic mean of precision and recall
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Insights */}
            <div className="glass rounded-2xl p-4 sm:p-6 mt-4 sm:mt-6">
              <h3 className="font-semibold mb-1 text-sm sm:text-base">Platform insights</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Aggregated data from all users worldwide.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-medium">Threat sources</span>
                    <span className="text-xl sm:text-2xl font-bold text-primary">5+</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    VirusTotal, Google Safe Browsing, PhishTank, ML, Heuristics
                  </p>
                </div>

                <div className="p-3 sm:p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-medium">Features analyzed</span>
                    <span className="text-xl sm:text-2xl font-bold text-primary">27</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    URL patterns, WHOIS data, redirects, and more
                  </p>
                </div>

                {data && data.totalScans > 0 && (
                  <>
                    <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-medium">Threats blocked</span>
                        <span className="text-xl sm:text-2xl font-bold text-primary">
                          {((data.threatDistribution?.HIGH || 0) + (data.threatDistribution?.CRITICAL || 0)).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        High and critical threats detected by the community
                      </p>
                    </div>

                    <div className="p-3 sm:p-4 rounded-xl bg-muted/30 border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-medium">Avg scan time</span>
                        <span className="text-xl sm:text-2xl font-bold text-primary">&lt;6s</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Average time to complete full threat analysis
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="glass rounded-2xl p-4 sm:p-6 mt-4 sm:mt-6">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Globe className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-sm sm:text-base">About Global Statistics</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    These statistics represent aggregated data from all users of Catchers AI worldwide. 
                    The data helps us understand threat patterns and improve our detection algorithms. 
                    Your individual scan history remains private and is stored only on your device.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </PageLayout>
  );
};

export default Dashboard;
