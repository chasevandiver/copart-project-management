import Kanban from "@/components/Kanban";
import { getTracker } from "@/lib/store";
import { workTasks } from "@/lib/tracker";

export default async function BoardPage() {
  const t = await getTracker();
  return (
    <>
      <h1>Board</h1>
      <Kanban tasks={workTasks(t)} />
    </>
  );
}
