"use client";

import { useEffect, useState, type ReactNode } from "react";

export function MSWProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function enableMocking() {
      const { startWorker } = await import("../../mocks/browser");
      await startWorker();
      if (!isCancelled) {
        setIsReady(true);
      }
    }

    enableMocking();

    return () => {
      isCancelled = true;
    };
  }, []);

  if (!isReady) return null;

  return <>{children}</>;
}
