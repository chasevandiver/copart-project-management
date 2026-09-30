"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export type ItemKind = "task" | "question" | "note" | "waiting" | "decision";

/** The open item lives in the URL (?item=task:cdd-03) so back and links work. */
export function useSelection() {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const current = params.get("item");

  const go = useCallback(
    (value: string | null) => {
      const p = new URLSearchParams(params.toString());
      if (value) p.set("item", value);
      else p.delete("item");
      const qs = p.toString();
      router.push(qs ? `${path}?${qs}` : path, { scroll: false });
    },
    [params, path, router]
  );

  return {
    current,
    open: (kind: ItemKind, id: string) => go(`${kind}:${id}`),
    close: () => go(null),
  };
}
