import PageHead from "@/components/shell/PageHead";
import Groups from "@/components/shell/Groups";
import { getTracker } from "@/lib/store";
import { inboxView } from "@/lib/views";

export default async function InboxPage() {
  const t = await getTracker();
  return (
    <>
      <PageHead icon="inbox" title="Inbox" sub="Things not filed to a project. Open one and pick a project in Where to file it." add={{ project: "general" }} />
      <Groups groups={inboxView(t)} showProject={false} empty="Inbox is empty." />
    </>
  );
}
