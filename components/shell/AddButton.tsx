"use client";

import type { DraftKind } from "@/lib/parse";
import { Icon } from "./Icon";
import { useQuickAdd } from "./QuickAdd";

export default function AddButton({ kind, project, label }: { kind?: DraftKind; project?: string; label?: string }) {
  const open = useQuickAdd();
  return (
    <button type="button" className="s-btn primary" onClick={() => open({ kind, project })}>
      <Icon name="plus" size={14} /> {label ?? "Add"}
    </button>
  );
}
