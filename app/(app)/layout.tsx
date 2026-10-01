import { Suspense } from "react";
import Sidebar from "@/components/shell/Sidebar";
import Detail from "@/components/shell/Detail";
import { QuickAddProvider } from "@/components/shell/QuickAdd";
import { AppProvider } from "@/components/App";
import { providerProps } from "@/lib/provider-props";
import { getTracker, storeMode, todayServer } from "@/lib/store";
import { personOpenCount, personSlug, sidebarCounts } from "@/lib/views";

// The main app: sidebar, one list in the middle, detail panel on the right.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const t = await getTracker();
  const counts = sidebarCounts(t, todayServer());
  const projects = t.projects.map((p) => ({ id: p.id, name: p.name, category: p.category, status: p.status }));
  const people = t.people.map((p) => ({ slug: personSlug(p.name), name: p.name, open: personOpenCount(t, p.name) }));
  return (
    <AppProvider {...providerProps(t)}>
      <Suspense>
        <QuickAddProvider>
          <div className="s-app">
            <Sidebar counts={counts} projects={projects} people={people} readonly={storeMode() === "readonly"} />
            <main className="s-main">{children}</main>
            <Detail />
          </div>
        </QuickAddProvider>
      </Suspense>
    </AppProvider>
  );
}
