import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);

/**
 * Next.js dev-режим обгортає компоненти в React.StrictMode, який
 * НАВМИСНО двічі викликає кожен useEffect (mount -> unmount -> mount) —
 * так React ловить side-effect баги. Без захисту тут worker.start()
 * викликався б двічі поспіль, і другий виклик падав би з помилкою
 * "cannot configure an already enabled network" (MSW патчить fetch/XHR
 * на рівні браузера, і повторний патч на вже "увімкненій" мережі
 * MSW відхиляє).
 *
 * startPromise — module-level стан, тому переживає React-перемонтування
 * (модуль не перевиконується при unmount/remount у межах того самого
 * завантаження сторінки) — гарантує рівно ОДИН реальний виклик start().
 */
let startPromise: ReturnType<typeof worker.start> | null = null;

export function startWorker(): ReturnType<typeof worker.start> {
  if (!startPromise) {
    startPromise = worker.start({
      onUnhandledRequest: "bypass",
      quiet: process.env.NODE_ENV === "production",
    });
  }
  return startPromise;
}
