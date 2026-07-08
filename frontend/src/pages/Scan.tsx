import { PageLayout } from "@/components/PageLayout";
import { UrlInput } from "@/components/UrlInput";
import { ScanLoading } from "@/components/ScanLoading";
import { ScanResults } from "@/components/ScanResults";
import { useMutation } from "@tanstack/react-query";
import { analyzeUrl } from "@/lib/api";
import { addToLocalHistory } from "@/lib/localStorage";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";

const Scan = () => {
  const [params, setParams] = useSearchParams();
  const initialUrl = params.get("url") || "";
  const [submittedUrl, setSubmittedUrl] = useState<string>("");

  const mutation = useMutation({
    mutationFn: (url: string) => analyzeUrl(url),
    onSuccess: (data) => {
      // Save to local storage
      try {
        addToLocalHistory(data);
      } catch (error) {
        console.error("Failed to save scan to local history:", error);
      }
    },
    onError: (e: any) => {
      toast({
        title: "Scan failed",
        description:
          e?.response?.data?.message ||
          e?.message ||
          "Could not reach the scanning engine.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (initialUrl && !mutation.isPending && !mutation.data && submittedUrl !== initialUrl) {
      setSubmittedUrl(initialUrl);
      mutation.mutate(initialUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUrl]);

  const handleSubmit = (url: string) => {
    setSubmittedUrl(url);
    setParams({ url });
    mutation.mutate(url);
  };

  const reset = () => {
    setSubmittedUrl("");
    setParams({});
    mutation.reset();
  };

  return (
    <PageLayout>
      <section className="container py-12 md:py-16 max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            URL <span className="text-gradient">Scanner</span>
          </h1>
          <p className="text-muted-foreground mt-3">
            Paste any link to get an instant threat assessment.
          </p>
        </div>

        {!mutation.data && (
          <UrlInput
            onSubmit={handleSubmit}
            loading={mutation.isPending}
            defaultValue={initialUrl}
          />
        )}

        <div className="mt-8">
          {mutation.isPending && <ScanLoading />}

          {mutation.isError && !mutation.isPending && (
            <div className="glass rounded-2xl p-6 flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-risk-critical shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold">Unable to scan this URL</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  The scan engine could not be reached after several attempts. Wait a moment and try again.
                </p>
              </div>
            </div>
          )}

          {mutation.data && (
            <ScanResults
              key={mutation.submittedAt}
              result={{ ...mutation.data, url: mutation.data.url || submittedUrl }}
              onReset={reset}
            />
          )}
        </div>
      </section>
    </PageLayout>
  );
};

export default Scan;
