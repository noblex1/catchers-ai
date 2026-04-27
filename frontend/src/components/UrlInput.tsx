import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, FormEvent } from "react";

interface Props {
  onSubmit: (url: string) => void;
  loading?: boolean;
  defaultValue?: string;
  size?: "default" | "lg";
}

export const UrlInput = ({ onSubmit, loading, defaultValue = "", size = "lg" }: Props) => {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);

  const handle = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Please enter a URL");
      return;
    }
    let normalized = trimmed;
    if (!/^https?:\/\//i.test(normalized)) normalized = `http://${normalized}`;
    try {
      new URL(normalized);
    } catch {
      setError("Please enter a valid URL");
      return;
    }
    setError(null);
    onSubmit(normalized);
  };

  const isLg = size === "lg";

  return (
    <form onSubmit={handle} className="w-full">
      <div
        className={`group relative flex items-center glass rounded-2xl overflow-hidden transition-all ${
          isLg ? "p-1.5" : "p-1"
        } focus-within:ring-2 focus-within:ring-primary/50 focus-within:glow-primary`}
      >
        <Search className={`text-muted-foreground ml-3 ${isLg ? "w-5 h-5" : "w-4 h-4"}`} />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="https://example.com"
          maxLength={2048}
          className={`flex-1 bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground/70 px-3 ${
            isLg ? "py-4 text-base" : "py-2.5 text-sm"
          }`}
          disabled={loading}
        />
        <Button
          type="submit"
          variant="hero"
          size={isLg ? "lg" : "default"}
          disabled={loading}
          className="rounded-xl"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Scanning…
            </>
          ) : (
            <>Analyze</>
          )}
        </Button>
      </div>
      {error && <p className="mt-2 text-sm text-risk-critical px-2">{error}</p>}
    </form>
  );
};
