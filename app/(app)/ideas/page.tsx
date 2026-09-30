import PageHead from "@/components/shell/PageHead";
import Groups from "@/components/shell/Groups";
import { getTracker } from "@/lib/store";
import { projectNames } from "@/lib/tracker";
import { ideasView } from "@/lib/views";

export default async function IdeasPage() {
  const t = await getTracker();
  return (
    <>
      <PageHead icon="idea" title="Ideas" sub="Not committed. Open one to make it a to-do or delete it." add={{ kind: "idea", label: "Add idea" }} />
      <Groups groups={ideasView(t, projectNames(t))} showProject={false} empty="No ideas yet." />
    </>
  );
}
