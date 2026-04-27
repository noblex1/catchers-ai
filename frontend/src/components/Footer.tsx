export const Footer = () => (
  <footer className="border-t border-border/50 mt-24">
    <div className="container py-10 flex flex-col md:flex-row items-center justify-between gap-6">
      <p className="text-sm text-muted-foreground">
        © {new Date().getFullYear()} Catchers AI. Built for safer browsing.
      </p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="w-2 h-2 rounded-full bg-risk-low animate-pulse" />
        Detection engine online
      </div>
    </div>
  </footer>
);
