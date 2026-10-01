"use client";

import type { AddKind } from "./QuickAdd";
import { Icon } from "./Icon";
import { useQuickAdd } from "./QuickAdd";

export default function AddButton({ kind, project, who, label }: { kind?: AddKind; project?: string; who?: string; label?: string }) {
  const open = useQuickAdd();
  return (
    <button type="button" className="s-btn primary" onClick={() => open({ kind, project, who })}>
      <Icon name="plus" size={14} /> {label ?? "Add"}
    </button>
  );
}
