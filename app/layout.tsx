import "./globals.css";
import Link from "next/link";
import { tracker } from "@/lib/tracker";
import { shortDate } from "@/lib/dates";

export const metadata = {
  title: "PM Board",
  description: "Chase's Copart project tracker",
};

const NAV = [
  ["/", "Board"],
  ["/week", "This week"],
  ["/projects", "Goals"],
  ["/waiting", "Waiting on"],
  ["/people", "People"],
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="top">
          <div className="brand">PM Board</div>
          <nav>
            {NAV.map(([href, label]) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="updated muted">Updated {shortDate(tracker.meta.last_updated)}</div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
