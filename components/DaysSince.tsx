"use client";

import { useEffect, useState } from "react";
import { daysBetween, shortDate, todayISO } from "@/lib/dates";

export default function DaysSince({ date }: { date: string }) {
  const [days, setDays] = useState<number>();
  useEffect(() => setDays(daysBetween(date, todayISO())), [date]);
  const label = days === undefined ? "" : days <= 0 ? "today" : days === 1 ? "1 day" : `${days} days`;
  return (
    <span className={`chip${days !== undefined && days > 7 ? " high" : ""}`}>
      since {shortDate(date)}
      {label && ` · ${label}`}
    </span>
  );
}
