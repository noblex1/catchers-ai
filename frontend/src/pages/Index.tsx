import { PageLayout } from "@/components/PageLayout";
import { UrlInput } from "@/components/UrlInput";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Sparkles,
  Zap,
  Globe,
  Brain,
  ArrowRight,
  CheckCircle2,
  Database,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Database,
    title: "Multi-source intelligence",
    desc: "Cross-checks VirusTotal, Google Safe Browsing & PhishTank in real time.",
  },
  {
    icon: Brain,
    title: "AI-powered detection",
    desc: "Custom ML model with 96% accuracy detects zero-day phishing patterns.",
  },
  {
    icon: Zap,
    title: "Sub-second insights",
    desc: "Full threat report with risk score and recommendations in 1–6 seconds.",
  },
  {
    icon: Globe,
    title: "Built for everyone",
    desc: "Plain-language summaries for users, deep technicals for analysts.",
  },
];

const steps = [
  { n: "01", title: "Submit a URL or file", desc: "Paste any link or drop a suspicious file." },
  { n: "02", title: "Multi-engine analysis", desc: "We query 3 threat feeds and run our ML model in parallel." },
  { n: "03", title: "Actionable verdict", desc: "Get a color-coded score, risk factors, and clear recommendations." },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <PageLayout>
      {/* Hero */}
      <section className="relative pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />

        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              ML-powered phishing detection · 96% accuracy
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
              Catch threats <br />
              <span className="text-gradient">before they catch you.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Catchers AI scans any URL or file across multiple threat intelligence feeds and a custom ML model — delivering a clear verdict in seconds.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="max-w-2xl mx-auto mt-10"
          >
            <UrlInput
              onSubmit={(url) =>
                navigate(`/scan?url=${encodeURIComponent(url)}`)
              }
            />
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-risk-low" /> No login required
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-risk-low" /> Privacy-first
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-risk-low" /> Free to try
              </span>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-16">
            {[
              { v: "96%", l: "ML accuracy" },
              { v: "3", l: "Threat feeds" },
              { v: "<6s", l: "Avg scan time" },
              { v: "24/7", l: "Real-time" },
            ].map((s) => (
              <div key={s.l} className="glass rounded-2xl p-5 text-center">
                <div className="text-2xl md:text-3xl font-bold text-gradient">{s.v}</div>
                <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Defense in depth, made simple
          </h2>
          <p className="text-muted-foreground mt-3">
            Every scan combines battle-tested intelligence with cutting-edge AI.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <motion.div
              key={f.title}
              whileHover={{ y: -4 }}
              className="glass rounded-2xl p-6 hover:border-primary/30 transition-colors"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">How it works</h2>
          <p className="text-muted-foreground mt-3">
            From submission to verdict in three steps.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div key={s.n} className="glass rounded-2xl p-7 relative overflow-hidden">
              <div className="absolute -top-2 -right-2 text-7xl font-bold text-primary/5">
                {s.n}
              </div>
              <div className="relative">
                <div className="text-xs font-mono text-primary mb-2">STEP {s.n}</div>
                <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <div className="glass rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
          <div className="relative max-w-2xl mx-auto">
            <Shield className="w-12 h-12 text-primary mx-auto mb-5" />
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Ready to scan your first URL?
            </h2>
            <p className="text-muted-foreground mb-8">
              Free, instant, and no signup required.
            </p>
            <Button
              variant="hero"
              size="lg"
              onClick={() => navigate("/scan")}
              className="rounded-xl"
            >
              Open scanner <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Index;
