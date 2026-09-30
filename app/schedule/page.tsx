import Schedule from "@/components/Schedule";
import Capture from "@/components/Capture";
import { getTracker } from "@/lib/store";

export default async function SchedulePage() {
  const t = await getTracker();
  return (
    <div className="page">
      <h1>Schedule</h1>
      <div className="panel pad capture-panel">
        <Capture kinds={["task"]} />
      </div>
      <Schedule tasks={t.tasks} />
    </div>
  );
}
