import Week from "@/components/Week";
import { tracker } from "@/lib/tracker";

export default function WeekPage() {
  const names: Record<string, string> = { general: "General" };
  for (const p of tracker.projects) names[p.id] = p.name;
  return (
    <>
      <h1>This week</h1>
      <Week tasks={tracker.tasks} names={names} />
    </>
  );
}
