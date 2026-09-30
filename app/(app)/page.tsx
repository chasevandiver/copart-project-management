import Link from "next/link";
import PageHead from "@/components/shell/PageHead";
import Groups from "@/components/shell/Groups";
import { getTracker, todayServer } from "@/lib/store";
import { sidebarCounts, todayView } from "@/lib/views";
import { longDate } from "@/lib/dates";

export default async function TodayPage() {
  const t = await getTracker();
  const today = todayServer();
  const c = sidebarCounts(t, today);
  const loops: [string, string, number][] = [
    ["/ask", "to ask", c.ask],
    ["/waiting", "waiting on others", c.waiting],
    ["/decide", "to decide", c.decide],
    ["/inbox", "in the inbox", c.inbox],
  ];
  return (
    <>
      <PageHead icon="today" title="Today" sub={longDate(today)}>
        <div className="s-loops">
          {loops
            .filter(([, , n]) => n)
            .map(([href, label, n]) => (
              <Link key={href} href={href} className="s-loop">
                <b>{n}</b> {label}
              </Link>
            ))}
        </div>
      </PageHead>
      <Groups groups={todayView(t, today)} empty="Nothing due. Check Upcoming or add something." />
    </>
  );
}
