import PageHead from "@/components/shell/PageHead";
import Groups from "@/components/shell/Groups";
import { getTracker } from "@/lib/store";
import { delegatedView } from "@/lib/views";

export default async function DelegatedPage() {
  const t = await getTracker();
  return (
    <>
      <PageHead icon="delegated" title="Delegated" sub="Work someone else owns: Claude Code, Work Claude, IT, Legal and people. Kept out of your own lists." add={false} />
      <Groups groups={delegatedView(t)} empty="Nothing delegated." />
    </>
  );
}
