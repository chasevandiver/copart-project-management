import Link from "next/link";
import Nav from "@/components/Nav";
import { AppProvider } from "@/components/App";
import { providerProps } from "@/lib/provider-props";
import { getTracker, storeMode } from "@/lib/store";
import { shortDate } from "@/lib/dates";

export default async function ClassicLayout({ children }: { children: React.ReactNode }) {
  const t = await getTracker();
  return (
    <AppProvider {...providerProps(t)}>
      <header className="top">
        <Link href="/classic" className="brand" style={{ textDecoration: "none" }}>
          <span className="mark" aria-hidden /> PM Board (classic)
        </Link>
        <Nav />
        <Link href="/" className="updated">
          Back to new board &rarr;
        </Link>
      </header>
      {storeMode() === "readonly" && <div className="banner">Read-only. Add GITHUB_TOKEN in Vercel to edit.</div>}
      <main>{children}</main>
      <div className="muted small" style={{ textAlign: "center", padding: 16 }}>
        Updated {shortDate(t.meta.last_updated)}
      </div>
    </AppProvider>
  );
}
