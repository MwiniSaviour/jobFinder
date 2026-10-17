"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastItem = {
  id: number;
  title: string;
  description?: string;
  tone?: "default" | "success";
};

type ToastContextValue = {
  toast: (input: {
    title: string;
    description?: string;
    tone?: "default" | "success";
  }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((input: Omit<ToastItem, "id">) => {
    const id = Date.now() + Math.random();
    setItems((current) => [...current.slice(-2), { ...input, id }]);
  }, []);

  const dismiss = (id: number) =>
    setItems((current) => current.filter((item) => item.id !== id));

  useEffect(() => {
    if (!items.length) return;
    const timer = setTimeout(
      () => setItems((current) => current.slice(1)),
      4200,
    );
    return () => clearTimeout(timer);
  }, [items]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-5 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-6 sm:items-end"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="animate-slide-up pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-white/10 bg-ink px-4 py-3.5 text-paper shadow-panel"
          >
            <span
              className={cn(
                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                item.tone === "success"
                  ? "bg-sage/25 text-[#bcd8c4]"
                  : "bg-white/10 text-paper",
              )}
            >
              <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-medium leading-snug">
                {item.title}
              </p>
              {item.description && (
                <p className="mt-0.5 text-[12.5px] leading-snug text-paper/60">
                  {item.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              className="mt-0.5 rounded-md p-1 text-paper/50 transition hover:bg-white/10 hover:text-paper"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return { toast: () => undefined } satisfies ToastContextValue;
  }
  return context;
}
