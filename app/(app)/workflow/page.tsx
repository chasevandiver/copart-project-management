import PageHead from "@/components/shell/PageHead";
import Workflow from "@/components/Workflow";
import { getTracker } from "@/lib/store";
import { buildWorkflow } from "@/lib/workflow";

// The sales workflow from the Oct 16 whiteboard, drawn live from the tracker. See docs/sales-workflow.md.
export default async function WorkflowPage() {
  const t = await getTracker();
  const data = buildWorkflow(t);
  return (
    <div className="wf-page">
      <PageHead icon="workflow" title="Workflow" sub="One approach, one record, two tools around it. Status on each box comes from the tracker." add={false} />
      <Workflow data={data} />
    </div>
  );
}
