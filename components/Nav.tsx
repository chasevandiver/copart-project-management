"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  ["/classic", "Home"],
  ["/classic/schedule", "Schedule"],
  ["/classic/projects", "Projects"],
  ["/classic/people", "People"],
  ["/classic/items", "Everything"],
  ["/classic/progress", "Progress"],
];

export default function Nav() {
  const path = usePathname();
  return (
    <nav>
      {NAV.map(([href, label]) => {
        const active =
          href === "/classic" ? path === "/classic" : path.startsWith(href) || (href === "/projects" && path.startsWith("/classic/board")) || (href === "/people" && path.startsWith("/classic/waiting"));
        return (
          <Link key={href} href={href} className={active ? "active" : undefined}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
