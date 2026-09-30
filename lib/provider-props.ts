import { canEdit, todayServer } from "./store";
import { owners, type Tracker } from "./tracker";

/** Props for AppProvider, built on the server inside a signed-in layout. */
export function providerProps(t: Tracker) {
  return {
    tracker: t,
    projects: [
      ...t.projects.map((p) => ({ id: p.id, name: p.name, category: p.category as string | null })),
      { id: "general", name: "Inbox", category: null },
    ],
    owners: owners(t),
    canEdit: canEdit(),
    initialToday: todayServer(),
  };
}
