import { PageLayout } from "@/components/PageLayout";
import { Brain, Database, Lock, Sparkles, Zap, ShieldCheck } from "lucide-react";

const blocks = [
  {
    icon: Database,
    title: "Multi-source threat intelligence",
    body:
      "Every scan cross-references VirusTotal, Google Safe Browsing, and PhishTank. By combining multiple authoritative feeds we minimize false negatives and catch threats faster.",
  },
  {
    icon: Brain,
    title: "Custom ML detection model",
    body:
      "Our gradient-boosted model evaluates 40+ URL and content features — from domain age and SSL posture to lexical patterns — achieving 96% accuracy on phishing benchmarks.",
  },
  {
    icon: Sparkles,
    title: "AI-generated explanations",
    body:
      "Beyond a score, Catchers AI generates a plain-language analysis of why a URL is suspicious so you can make confident decisions in seconds.",
  },
  {
    icon: Zap,
    title: "Real-time analysis",
    body:
      "Parallel querying and an optimized inference pipeline deliver complete reports in 1–6 seconds, suitable for inline use in security workflows.",
  },
  {
    icon: Lock,
    title: "Privacy by design",
    body:
      "We don't require accounts to scan a URL. Submitted content is processed for analysis and is never sold or used for advertising.",
  },
  {
    icon: ShieldCheck,
    title: "Built for analysts and end users",
    body:
      "A clean summary for non-technical users, with progressively disclosed technical details — domain WHOIS, redirects, ML feature importance — for power users.",
  },
];

const About = () => (
  <PageLayout>
    <section className="container py-16 md:py-24 max-w-4xl">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass text-xs font-medium mb-5">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          About Catchers AI
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          The technology behind <span className="text-gradient">safer browsing</span>
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
          Catchers AI fuses authoritative threat intelligence with a custom ML model to deliver fast, explainable verdicts on suspicious URLs and files.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {blocks.map((b) => (
          <div key={b.title} className="glass rounded-2xl p-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20 flex items-center justify-center mb-4">
              <b.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">{b.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{b.body}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-8 mt-10">
        <h2 className="text-xl font-semibold mb-3">Privacy</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          When you submit a URL or file, Catchers AI sends it to our analysis pipeline and to selected third-party threat intelligence providers strictly to evaluate the content. We retain anonymized scan records to power statistics and history features. We never sell your data, and we do not use it for advertising.
        </p>
      </div>
    </section>
  </PageLayout>
);

export default About;
