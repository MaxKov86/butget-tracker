import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

const WORKER_OPTIONS = {
  onUnhandledRequest: 'bypass' as const,
  quiet: process.env.NODE_ENV === 'production',
};

/**
 * Next.js dev-режим обгортає компоненти в React.StrictMode, який
 * НАВМИСНО двічі викликає кожен useEffect (mount -> unmount -> mount) —
 * так React ловить side-effect баги. Без захисту тут worker.start()
 * викликався б двічі поспіль, і другий виклик падав би з помилкою
 * "cannot configure an already enabled network".
 *
 * startPromise — module-level стан, тому переживає React-перемонтування —
 * гарантує рівно ОДИН реальний виклик start() при першому монтуванні.
 */
let startPromise: ReturnType<typeof worker.start> | null = null;

export function startWorker(): ReturnType<typeof worker.start> {
  if (!startPromise) {
    startPromise = worker.start(WORKER_OPTIONS);
  }
  return startPromise;
}

/**
 * ВАЖЛИВО: простий повторний виклик worker.start() тут НЕ допомагає —
 * MSW сам відстежує внутрішній прапорець "mocking вже увімкнено" (окремо
 * від нашого власного startPromise) і мовчки ІГНОРУЄ повторний start(),
 * друкуючи в консоль "Found a redundant worker.start() call [...] will
 * have no effect". Тобто навіть скинувши НАШ startPromise, реальний
 * хендшейк із Service Worker так і не повторювався б.
 *
 * worker.stop() явно скидає той внутрішній прапорець MSW — лише ПІСЛЯ
 * цього наступний start() реально повторює postMessage-хендшейк із SW.
 * Викликається з MSWProvider періодично та при поверненні фокусу на
 * вкладку — на випадок, якщо браузер "вбив" простоюючий SW-процес
 * (типово після ~30с без fetch-активності) і той забув раніше передані
 * хендлери.
 */
export async function forceRestartWorker(): Promise<void> {
  worker.stop();
  startPromise = worker.start(WORKER_OPTIONS);
  await startPromise;
}
