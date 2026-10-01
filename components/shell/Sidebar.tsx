"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Counts } from "@/lib/views";
import { Icon } from "./Icon";
import { useQuickAdd } from "./QuickAdd";

type P = { id: string; name: string; category: string; status: string };
type Who = { slug: string; name: string; open: number };

const MAIN: [string, string, string, keyof Counts | null][] = [
  ["/inbox", "Inbox", "inbox", "inbox"],
  ["/", "Today", "today", "today"],
  ["/upcoming", "Upcoming", "upcoming", null],
];
const LOOPS: [string, string, string, keyof Counts | null][] = [
  ["/ask", "Ask", "question", "ask"],
  ["/waiting", "Waiting on", "waiting", "waiting"],
  ["/decide", "Decide", "decision", "decide"],
  ["/delegated", "Delegated", "delegated", "delegated"],
];
const LIB: [string, string, string, keyof Counts | null][] = [
  ["/ideas", "Ideas", "idea", "ideas"],
  ["/notes", "Notes", "note", "notes"],
  ["/logbook", "Logbook", "logbook", null],
];

export default function Sidebar({ counts, projects, people, readonly }: { counts: Counts; projects: P[]; people: Who[]; readonly: boolean }) {
  const path = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const openAdd = useQuickAdd();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(params.get("q") ?? "");

  useEffect(() => setOpen(false), [path]);

  const item = (href: string, label: string, icon: string, count?: number) => {
    // List pages ("All projects", "All people") light up only on themselves, not on a project or person page.
    const exact = href === "/" || href === "/projects" || href === "/people";
    const active = exact ? path === href : path === href || path.startsWith(href + "/");
    return (
      <Link key={href} href={href} className={`s-nav${active ? " on" : ""}`}>
        <Icon name={icon} className="s-nav-icon" />
        <span className="s-nav-label">{label}</span>
        {!!count && <span className="s-nav-count">{count}</span>}
      </Link>
    );
  };
  const list = (rows: typeof MAIN) => rows.map(([h, l, i, k]) => item(h, l, i, k ? (counts[k] as number) : undefined));
  const areas = [...new Set(projects.map((p) => p.category))];

  return (
    <>
      <div className="s-mobilebar">
        <button type="button" className="s-icon-btn" onClick={() => setOpen(true)} aria-label="Open menu">
          <Icon name="menu" size={20} />
        </button>
        <Link href="/" className="s-brand">
          <span className="s-brand-mark" aria-hidden /> PM Board
        </Link>
        <button type="button" className="s-icon-btn" onClick={() => openAdd()} aria-label="Add">
          <Icon name="plus" size={20} />
        </button>
      </div>
      {open && <div className="s-drawer-back" onClick={() => setOpen(false)} />}
      <nav className={`s-side${open ? " open" : ""}`} aria-label="Main">
        <div className="s-side-top">
          <Link href="/" className="s-brand">
            <span className="s-brand-mark" aria-hidden /> PM Board
          </Link>
          <button type="button" className="s-icon-btn s-side-close" onClick={() => setOpen(false)} aria-label="Close menu">
            <Icon name="close" />
          </button>
        </div>
        <button type="button" className="s-add-big" onClick={() => openAdd()}>
          <Icon name="plus" size={15} /> New
          <kbd>N</kbd>
        </button>
        <form
          className="s-search"
          onSubmit={(e) => {
            e.preventDefault();
            router.push(`/search?q=${encodeURIComponent(q)}`);
          }}
        >
          <Icon name="search" size={14} />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search everything" />
        </form>

        <div className="s-nav-group">{list(MAIN)}</div>
        <div className="s-nav-group">
          <div className="s-nav-heading">Open loops</div>
          {list(LOOPS)}
        </div>
        <div className="s-nav-group">{list(LIB)}</div>

        <div className="s-nav-group">
          <div className="s-nav-heading">People</div>
          {people.map((p) => item(`/people/${p.slug}`, p.name, "person", p.open))}
          {item("/people", "All people", "grid")}
        </div>

        {areas.map((a) => (
          <div key={a} className="s-nav-group">
            <div className="s-nav-heading">{a}</div>
            {projects
              .filter((p) => p.category === a)
              .map((p) => {
                const href = `/projects/${p.id}`;
                const active = path === href;
                return (
                  <Link key={p.id} href={href} className={`s-nav${active ? " on" : ""}`}>
                    <span className={`s-dot st-${p.status.toLowerCase().replace(/\s+/g, "-")}`} aria-hidden />
                    <span className="s-nav-label">{p.name}</span>
                    {!!counts.projects[p.id] && <span className="s-nav-count">{counts.projects[p.id]}</span>}
                  </Link>
                );
              })}
          </div>
        ))}
        <div className="s-nav-group">{item("/projects", "All projects", "grid")}</div>

        <div className="s-side-foot">
          {readonly && <p className="s-readonly">Read-only: add GITHUB_TOKEN in Vercel to edit.</p>}
          <Link href="/classic">Classic view</Link>
          <a href="/api/logout">Sign out</a>
        </div>
      </nav>
    </>
  );
}
