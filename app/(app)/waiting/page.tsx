import PageHead from "@/components/shell/PageHead";
import Groups from "@/components/shell/Groups";
import WaitingAddButton from "@/components/shell/WaitingAddButton";
import { getTracker } from "@/lib/store";
import { waitingView } from "@/lib/views";

export default async function WaitingPage() {
  const t = await getTracker();
  return (
    <>
      <PageHead icon="waiting" title="Waiting on" sub="Things you need from other people. Open one and press Got it when it arrives." add={false}>
        <WaitingAddButton />
      </PageHead>
      <Groups groups={waitingView(t)} empty="Not waiting on anyone." />
    </>
  );
}
