import Schedule from "@/components/Schedule";
import QuickAdd from "@/components/QuickAdd";
import { getTracker } from "@/lib/store";

export default async function SchedulePage() {
  const t = await getTracker();
  return (
    <div className="page">
      <h1>Schedule</h1>
      <QuickAdd />
      <Schedule tasks={t.tasks} />
    </div>
  );
}
