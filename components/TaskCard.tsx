import Link from "next/link";
import type { Task } from "@/lib/tracker";
import { shortDate } from "@/lib/dates";

export default function TaskCard({
  task,
  projectName,
  today,
  showStatus = false,
}: {
  task: Task;
  projectName?: string;
  today?: string;
  showStatus?: boolean;
}) {
  const done = task.status === "Done";
  const overdue = !done && today && task.due && task.due < today;
  const slug = task.status.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className={`task p-${task.priority}${done ? " done" : ""}`}>
      <div className="title">{task.title}</div>
      <div className="meta">
        <span className="chip">{task.id}</span>
        {showStatus && <span className={`chip status col-${slug}`}>{task.status}</span>}
        {projectName && (
          <Link className="chip" href={task.project_id === "general" ? "/projects" : `/projects/${task.project_id}`}>
            {projectName}
          </Link>
        )}
        <span className="chip">{task.owner}</span>
        {task.priority === "urgent" && <span className="chip urgent">urgent</span>}
        {task.priority === "high" && <span className="chip high">high</span>}
        {task.due && <span className={`chip${overdue ? " overdue" : ""}`}>{overdue ? "overdue " : "due "}{shortDate(task.due)}</span>}
        {task.recurring && <span className="chip">{task.recurring}</span>}
      </div>
      {task.notes && !done && <div className="notes">{task.notes}</div>}
    </div>
  );
}
