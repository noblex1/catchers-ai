import { PageLayout } from "@/components/PageLayout";
import { useState, useEffect } from "react";
import { RiskBadge } from "@/components/RiskBadge";
import { Search, ChevronLeft, ChevronRight, Inbox, Trash2, Download, Upload as UploadIcon, FileDown } from "lucide-react";
import { categoryFromScore } from "@/lib/risk";
import { 
  getFilteredHistory, 
  deleteLocalScan, 
  clearLocalHistory,
  exportHistory,
  importHistory,
  type LocalScanHistory 
} from "@/lib/localStorage";
import type { RiskCategory } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { generateScanPDF } from "@/lib/pdfGenerator";

const PAGE = 50;
const filters: (RiskCategory | "ALL")[] = ["ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL"];

const History = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<RiskCategory | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [history, setHistory] = useState<LocalScanHistory[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Load history from localStorage
  const loadHistory = () => {
    const result = getFilteredHistory({
      riskCategory: filter === "ALL" ? undefined : filter,
      search: search || undefined,
      limit: PAGE,
      skip: page * PAGE,
    });
    
    setHistory(result.scans);
    setTotal(result.total);
    setHasMore(result.hasMore);
  };

  // Reload when filters change
  useEffect(() => {
    loadHistory();
  }, [page, filter, search]);

  const handleDelete = (id: string) => {
    if (deleteLocalScan(id)) {
      toast({
        title: "Scan deleted",
        description: "The scan has been removed from your history.",
      });
      loadHistory();
    } else {
      toast({
        title: "Delete failed",
        description: "Could not delete the scan.",
        variant: "destructive",
      });
    }
  };

  const handleClearAll = () => {
    if (clearLocalHistory()) {
      toast({
        title: "History cleared",
        description: "All scans have been removed from your history.",
      });
      loadHistory();
    } else {
      toast({
        title: "Clear failed",
        description: "Could not clear history.",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    try {
      const data = exportHistory();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `catchers-ai-history-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "History exported",
        description: "Your scan history has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not export history.",
        variant: "destructive",
      });
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (importHistory(content)) {
          toast({
            title: "History imported",
            description: "Your scan history has been imported successfully.",
          });
          loadHistory();
        } else {
          throw new Error("Import failed");
        }
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Could not import history. Please check the file format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = "";
  };

  const handleViewDetails = (scan: LocalScanHistory) => {
    // Navigate to scan page with the URL
    if (scan.url) {
      navigate(`/scan?url=${encodeURIComponent(scan.url)}`);
    } else if (scan.fileName) {
      // For files, we can't re-scan, so just show a message
      toast({
        title: "File scan",
        description: "File scans cannot be re-analyzed. Upload the file again to scan.",
      });
    }
  };

  const handleDownloadPDF = (scan: LocalScanHistory, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      generateScanPDF(scan);
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
    <PageLayout>
      <section className="container py-12 md:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Scan history</h1>
            <p className="text-muted-foreground mt-2">
              Your local scan history ({total} {total === 1 ? 'scan' : 'scans'})
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={total === 0}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('import-file')?.click()}
              className="gap-2"
            >
              <UploadIcon className="w-4 h-4" />
              Import
            </Button>
            <input
              id="import-file"
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={total === 0}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all history?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all {total} scans from your local history. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Clear All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="relative w-full mb-6">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0); // Reset to first page on search
            }}
            placeholder="Search by URL or filename…"
            className="w-full glass rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setPage(0);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {history.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <Inbox className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              {search || filter !== "ALL" ? "No scans match your filters." : "No scans yet. Start by analyzing a URL!"}
            </p>
          </div>
        ) : (
          <div className="glass rounded-2xl overflow-hidden">
            <div className="divide-y divide-border/50">
              {history.map((item) => {
                const cat = item.riskCategory || categoryFromScore(item.threatScore);
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors group"
                  >
                    <div 
                      className="text-2xl font-bold tabular-nums w-14 text-center cursor-pointer" 
                      style={{ color: `hsl(var(--risk-${cat.toLowerCase()}))` }}
                      onClick={() => handleViewDetails(item)}
                    >
                      {Math.round(item.threatScore)}
                    </div>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleViewDetails(item)}>
                      <p className="font-mono text-sm truncate">{item.url || item.fileName}</p>
                      {item.scannedAt && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(item.scannedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <RiskBadge category={cat} size="sm" />
                    <button
                      onClick={(e) => handleDownloadPDF(item, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-primary/10 rounded-lg"
                      title="Download PDF"
                    >
                      <FileDown className="w-4 h-4 text-primary" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-destructive/10 rounded-lg"
                      title="Delete scan"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {total > PAGE && (
          <div className="flex items-center justify-between mt-6">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm disabled:opacity-40 hover:bg-muted/50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-sm text-muted-foreground">
              Page {page + 1} of {Math.ceil(total / PAGE)}
            </span>
            <button
              disabled={!hasMore}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm disabled:opacity-40 hover:bg-muted/50 transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>
    </PageLayout>
  );
};

export default History;
