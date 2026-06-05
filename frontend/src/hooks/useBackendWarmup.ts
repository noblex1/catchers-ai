import { useEffect } from "react";
import { ensureBackendWarm } from "@/lib/backendWarmup";

/** Wake the API as soon as the app loads so the first scan is less likely to fail. */
export function useBackendWarmup() {
  useEffect(() => {
    void ensureBackendWarm();
  }, []);
}
