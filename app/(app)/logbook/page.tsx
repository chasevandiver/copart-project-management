import PageHead from "@/components/shell/PageHead";
import Journal from "@/components/Journal";
import { getTracker } from "@/lib/store";
import { activity } from "@/lib/activity";

export default async function LogbookPage() {
  const t = await getTracker();
  return (
    <>
      <PageHead icon="logbook" title="Logbook" sub="What got done, decided, answered and written down, by day, week or month." add={false} />
      <div className="s-logbook">
        <Journal events={activity(t)} />
      </div>
    </>
  );
}
