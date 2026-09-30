"use client";

// Shared client state: project list, owners, today's date, edit permission,
// a save helper and toasts.
import { createContext, useCallback, useContext, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Op } from "@/lib/ops";
import type { Tracker } from "@/lib/tracker";
import { todayISO } from "@/lib/dates";

type ProjectRef = { id: string; name: string; category: string | null };

type AppState = {
  tracker: Tracker;
  projects: ProjectRef[];
  owners: string[];
  canEdit: boolean;
  today: string | undefined;
  save: (op: Op, done?: string) => Promise<boolean>;
  pending: boolean;
};

const Ctx = createContext<AppState | null>(null);

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp outside AppProvider");
  return v;
}

type Toast = { id: number; text: string; bad?: boolean };

export function AppProvider({
  tracker,
  projects,
  owners,
  canEdit,
  initialToday,
  children,
}: {
  tracker: Tracker;
  projects: ProjectRef[];
  owners: string[];
  canEdit: boolean;
  /** Server's date (Chase's time zone) so the first render matches the server HTML. */
  initialToday?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [today, setToday] = useState<string | undefined>(initialToday);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pending, startTransition] = useTransition();

  useEffect(() => setToday(todayISO()), []);

  const toast = useCallback((text: string, bad = false) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, bad }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), bad ? 6000 : 2500);
  }, []);

  const save = useCallback(
    async (op: Op, done?: string) => {
      if (!canEdit) {
        toast("Editing is off. Set GITHUB_TOKEN in Vercel to turn it on.", true);
        return false;
      }
      try {
        const res = await fetch("/api/tracker", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(op),
        });
        const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
        if (!res.ok || !body.ok) {
          toast(body.error ?? "Save failed", true);
          return false;
        }
        if (done) toast(done);
        startTransition(() => router.refresh());
        return true;
      } catch {
        toast("Couldn't reach the server. Check your connection.", true);
        return false;
      }
    },
    [canEdit, router, toast]
  );

  return (
    <Ctx.Provider value={{ tracker, projects, owners, canEdit, today, save, pending }}>
      {children}
      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast${t.bad ? " bad" : ""}`}>
            {t.text}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
