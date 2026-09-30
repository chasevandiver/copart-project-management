"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  ["/", "Home"],
  ["/schedule", "Schedule"],
  ["/projects", "Projects"],
  ["/people", "People"],
  ["/items", "Everything"],
  ["/progress", "Progress"],
];

export default function Nav() {
  const path = usePathname();
  return (
    <nav>
      {NAV.map(([href, label]) => {
        const active =
          href === "/" ? path === "/" : path.startsWith(href) || (href === "/projects" && path.startsWith("/board")) || (href === "/people" && path.startsWith("/waiting"));
        return (
          <Link key={href} href={href} className={active ? "active" : undefined}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
