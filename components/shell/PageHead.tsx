import { Icon } from "./Icon";
import AddButton from "./AddButton";

export default function PageHead({
  icon,
  title,
  sub,
  add,
  children,
}: {
  icon?: string;
  title: string;
  sub?: string;
  add?: { kind?: "task" | "idea" | "note" | "question" | "project"; project?: string; who?: string; label?: string } | false;
  children?: React.ReactNode;
}) {
  return (
    <header className="s-head">
      <div className="s-head-main">
        <h1>
          {icon && <Icon name={icon} size={22} className="s-head-icon" />}
          {title}
        </h1>
        {sub && <p className="s-head-sub">{sub}</p>}
        {children}
      </div>
      {add !== false && <AddButton kind={add?.kind} project={add?.project} who={add?.who} label={add?.label} />}
    </header>
  );
}
