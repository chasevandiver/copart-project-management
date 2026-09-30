import PageHead from "@/components/shell/PageHead";
import Groups from "@/components/shell/Groups";
import { getTracker } from "@/lib/store";
import { askView } from "@/lib/views";

export default async function AskPage() {
  const t = await getTracker();
  return (
    <>
      <PageHead icon="question" title="Ask" sub="Questions to ask, grouped by person. Open one to record the answer." add={{ kind: "question", label: "Add question" }} />
      <Groups groups={askView(t)} empty="No open questions. Add one with New, or end any line with ?" />
    </>
  );
}
