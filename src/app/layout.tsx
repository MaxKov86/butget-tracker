import type { Metadata } from "next";
import { Providers } from "./providers";
import { ThemeSync } from "./providers/ThemeSync";
import { ThemeToggle } from "@/shared/components/ThemeToggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "Budget Tracker",
  description: "Personal finance dashboard with charts",
};

// Читає збережену тему з localStorage і виставляє data-theme на <html>
// ДО першого фарбування сторінки — інакше був би помітний "спалах"
// дефолтної dark-теми, який потім миттю змінюється на збережену light
// (класична проблема FOUC при theme-персистентності через клієнтський стан).
// Zustand persist зберігає стан у форматі {"state":{"theme":"..."},"version":0} —
// звідси структура парсингу нижче.
const noFlashThemeScript = `
(function () {
  try {
    var stored = localStorage.getItem('budget-tracker-theme');
    var theme = stored ? (JSON.parse(stored).state?.theme ?? 'dark') : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uk" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashThemeScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-text font-sans">
        <Providers>
          <ThemeSync />
          <header className="flex items-center justify-between border-b border-border px-6 py-4">
            <span className="font-semibold tracking-tight">Budget Tracker</span>
            <ThemeToggle />
          </header>
          {children}
        </Providers>
      </body>
    </html>
  );
}
