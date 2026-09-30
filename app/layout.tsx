import "./globals.css";
import Link from "next/link";
import Nav from "@/components/Nav";
import { AppProvider } from "@/components/App";
import { canEdit, getTracker, storeMode } from "@/lib/store";
import { owners } from "@/lib/tracker";
import { shortDate } from "@/lib/dates";

export const metadata = {
  title: "PM Board",
  description: "Chase's Copart project tracker",
};

// Pages read tracker.json live on every request, so edits show up right away.
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const t = await getTracker();
  const projects = [
    ...t.projects.map((p) => ({ id: p.id, name: p.name, category: p.category as string | null })),
    { id: "general", name: "General", category: null },
  ];
  return (
    <html lang="en">
      <body>
        <AppProvider projects={projects} owners={owners(t)} canEdit={canEdit()}>
          <header className="top">
            <Link href="/" className="brand" style={{ textDecoration: "none" }}>
              <span className="mark" aria-hidden /> PM Board
            </Link>
            <Nav />
            <div className="updated">Updated {shortDate(t.meta.last_updated)}</div>
          </header>
          {storeMode() === "readonly" && (
            <div className="banner">Read-only. Add GITHUB_TOKEN in Vercel to check off and add items here.</div>
          )}
          <main>{children}</main>
        </AppProvider>
      </body>
    </html>
  );
}
