import AllItems from "@/components/AllItems";
import Capture from "@/components/Capture";
import { getTracker } from "@/lib/store";

export default async function EverythingPage() {
  const t = await getTracker();
  return (
    <div className="page">
      <h1>Everything</h1>
      <p className="muted small">Every action item, idea, note, question, waiting-on and decision in one place.</p>
      <div className="panel pad capture-panel">
        <Capture />
      </div>
      <AllItems tasks={t.tasks} notes={t.notes} questions={t.questions} waiting={t.waiting_on} decisions={t.decisions} />
    </div>
  );
}
