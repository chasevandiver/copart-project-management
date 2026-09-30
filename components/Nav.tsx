"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  ["/", "Home"],
  ["/schedule", "Schedule"],
  ["/board", "Board"],
  ["/projects", "Goals"],
  ["/waiting", "Waiting on"],
  ["/people", "People"],
];

export default function Nav() {
  const path = usePathname();
  return (
    <nav>
      {NAV.map(([href, label]) => {
        const active = href === "/" ? path === "/" : path.startsWith(href);
        return (
          <Link key={href} href={href} className={active ? "active" : undefined}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
