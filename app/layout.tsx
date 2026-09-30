import "./globals.css";
import Link from "next/link";
import Nav from "@/components/Nav";
import { tracker } from "@/lib/tracker";
import { shortDate } from "@/lib/dates";

export const metadata = {
  title: "PM Board",
  description: "Chase's Copart project tracker",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="top">
          <Link href="/" className="brand" style={{ textDecoration: "none" }}>
            <span className="mark" aria-hidden /> PM Board
          </Link>
          <Nav />
          <div className="updated">Updated {shortDate(tracker.meta.last_updated)}</div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
