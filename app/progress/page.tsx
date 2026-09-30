import Journal from "@/components/Journal";
import { activity } from "@/lib/activity";
import { getTracker } from "@/lib/store";

export default async function ProgressPage() {
  const t = await getTracker();
  return (
    <div className="page">
      <h1>Progress</h1>
      <p className="muted small">What got done, decided, answered and written down, by day, week or month.</p>
      <Journal events={activity(t)} />
    </div>
  );
}
