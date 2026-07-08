import { PageLayout } from "@/components/PageLayout";
import { ScanLoading } from "@/components/ScanLoading";
import { ScanResults } from "@/components/ScanResults";
import { useMutation } from "@tanstack/react-query";
import { analyzeFile } from "@/lib/api";
import { addToLocalHistory } from "@/lib/localStorage";
import { useState, useRef, DragEvent } from "react";
import { toast } from "@/hooks/use-toast";
import { Upload, FileText, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const ACCEPTED = [".html", ".htm", ".txt", ".eml"];
const MAX_SIZE = 10 * 1024 * 1024;

const FileScan = () => {
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: (f: File) => analyzeFile(f),
    onSuccess: (data) => {
      // Save to local storage
      try {
        addToLocalHistory(data);
      } catch (error) {
        console.error("Failed to save scan to local history:", error);
      }
    },
    onError: (e: any) =>
      toast({
        title: "Scan failed",
        description: e?.response?.data?.message || e?.message || "Could not analyze file.",
        variant: "destructive",
      }),
  });

  const validate = (f: File) => {
    const ext = "." + f.name.split(".").pop()?.toLowerCase();
    if (!ACCEPTED.includes(ext)) {
      toast({ title: "Unsupported file", description: `Accepted: ${ACCEPTED.join(", ")}`, variant: "destructive" });
      return false;
    }
    if (f.size > MAX_SIZE) {
      toast({ title: "File too large", description: "Max 10 MB.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || !files[0]) return;
    if (validate(files[0])) setFile(files[0]);
  };

  const reset = () => {
    setFile(null);
    mutation.reset();
  };

  return (
    <PageLayout>
      <section className="container py-12 md:py-16 max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            File <span className="text-gradient">Scanner</span>
          </h1>
          <p className="text-muted-foreground mt-3">
            Drop suspicious HTML, EML or TXT files. Max 10&nbsp;MB.
          </p>
        </div>

        {!mutation.data && !mutation.isPending && (
          <div
            onDragOver={(e: DragEvent) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e: DragEvent) => {
              e.preventDefault();
              setDrag(false);
              handleFiles(e.dataTransfer.files);
            }}
            className={`glass rounded-3xl p-10 md:p-16 text-center border-2 border-dashed transition-all ${
              drag ? "border-primary bg-primary/5" : "border-border/50"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED.join(",")}
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center mb-5">
              <Upload className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-1">
              {file ? "File ready to scan" : "Drag & drop a file here"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {file ? file.name : "or click below to browse"}
            </p>

            {file ? (
              <div className="flex items-center justify-center gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 text-sm">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="font-mono">{file.name}</span>
                  <button onClick={() => setFile(null)} className="ml-1 text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <Button variant="hero" onClick={() => mutation.mutate(file)}>
                  Analyze file
                </Button>
              </div>
            ) : (
              <Button variant="glass" onClick={() => inputRef.current?.click()}>
                Choose file
              </Button>
            )}
            <p className="text-xs text-muted-foreground mt-6">
              Accepted: {ACCEPTED.join(", ")}
            </p>
          </div>
        )}

        <div className="mt-8">
          {mutation.isPending && <ScanLoading />}

          {mutation.isError && (
            <div className="glass rounded-2xl p-6 flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-risk-critical shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold">Unable to scan this file</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Check that the backend is running and try again.
                </p>
              </div>
            </div>
          )}

          {mutation.data && (
            <ScanResults
              key={mutation.submittedAt}
              result={{ ...mutation.data, fileName: mutation.data.fileName || file?.name }}
              onReset={reset}
            />
          )}
        </div>
      </section>
    </PageLayout>
  );
};

export default FileScan;
