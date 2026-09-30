import PageHead from "@/components/shell/PageHead";
import Groups from "@/components/shell/Groups";
import { getTracker } from "@/lib/store";
import { projectNames } from "@/lib/tracker";
import { decideView } from "@/lib/views";

export default async function DecidePage() {
  const t = await getTracker();
  return (
    <>
      <PageHead icon="decision" title="Decide" sub="Open decisions. Open one and pick an option." add={false} />
      <Groups groups={decideView(t, projectNames(t))} showProject={false} empty="No open decisions." />
    </>
  );
}
