import Kanban from "@/components/Kanban";
import { tracker } from "@/lib/tracker";

export default function BoardPage() {
  const projects = [
    ...tracker.projects.map((p) => ({ id: p.id, name: p.name })),
    { id: "general", name: "General" },
  ];
  return (
    <>
      <h1>Board</h1>
      <Kanban tasks={tracker.tasks} projects={projects} />
    </>
  );
}
