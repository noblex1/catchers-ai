import { Shield } from "lucide-react";
import { Link } from "react-router-dom";

export const Logo = ({ className = "" }: { className?: string }) => (
  <Link to="/" className={`flex items-center gap-2.5 group ${className}`}>
    <div className="relative">
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary to-secondary blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
      <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
        <Shield className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
      </div>
    </div>
    <div className="flex flex-col leading-none">
      <span className="font-bold text-lg tracking-tight">
        Catchers<span className="text-gradient"> AI</span>
      </span>
      <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
        Threat intelligence
      </span>
    </div>
  </Link>
);
