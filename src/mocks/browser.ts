import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);

const WORKER_OPTIONS = {
  onUnhandledRequest: "bypass" as const,
  quiet: process.env.NODE_ENV === "production",
};

let startPromise: ReturnType<typeof worker.start> | null = null;

export function startWorker(): ReturnType<typeof worker.start> {
  if (!startPromise) {
    startPromise = worker.start(WORKER_OPTIONS);
  }
  return startPromise;
}

export async function forceRestartWorker(): Promise<void> {
  worker.stop();
  startPromise = worker.start(WORKER_OPTIONS);
  await startPromise;
}
