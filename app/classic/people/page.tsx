import Capture from "@/components/Capture";
import QuestionItem from "@/components/QuestionItem";
import TaskItem from "@/components/TaskItem";
import { WaitingItem } from "@/components/WaitingItem";
import { getTracker } from "@/lib/store";
import { FIXED_OWNERS, openWaiting, sortTasks } from "@/lib/tracker";

export default async function PeoplePage() {
  const t = await getTracker();
  const first = (n: string) => n.split(" ")[0];
  const same = (a: string, b: string) => a === b || a === first(b) || first(a) === b;

  // Everyone who shows up anywhere: the directory, question targets, waiting-on sources, owners.
  const names: string[] = [];
  const add = (n: string) => {
    if (n && n !== "Me" && !names.some((x) => same(x, n))) names.push(n);
  };
  t.people.forEach((p) => add(p.name));
  t.questions.forEach((q) => add(q.ask));
  openWaiting(t).forEach((w) => add(w.from_whom));
  t.tasks.filter((x) => x.status !== "Done" && !x.idea).forEach((x) => add(x.owner));

  const cards = names.map((name) => {
    const person = t.people.find((p) => same(p.name, name));
    const questions = t.questions.filter((q) => q.status === "open" && same(q.ask, name));
    const waiting = openWaiting(t).filter((w) => same(w.from_whom, name));
    const owns = sortTasks(t.tasks.filter((x) => x.status !== "Done" && !x.idea && same(x.owner, name)));
    return { name, person, questions, waiting, owns };
  });
  const isTool = (n: string) => FIXED_OWNERS.includes(n) && !t.people.some((p) => same(p.name, n));
  cards.sort(
    (a, b) =>
      b.questions.length - a.questions.length ||
      Number(isTool(a.name)) - Number(isTool(b.name)) ||
      b.waiting.length + b.owns.length - (a.waiting.length + a.owns.length) ||
      a.name.localeCompare(b.name)
  );
  const short = (n: string) => (isTool(n) ? n : first(n));
  const totalQ = cards.reduce((n, c) => n + c.questions.length, 0);

  return (
    <div className="page">
      <h1>People</h1>
      <p className="muted small">
        Who to ask what, what you are waiting on from them, and what they own. {totalQ} open question{totalQ === 1 ? "" : "s"}.
      </p>
      <div className="panel pad capture-panel">
        <Capture kinds={["question"]} defaultKind="question" />
      </div>
      <div className="people-grid">
        {cards.map((c) => (
          <section key={c.name} className="panel pad person-card">
            <header>
              <h2>{c.person?.name ?? c.name}</h2>
              <div className="small muted">
                {[c.person?.title, c.person?.department].filter(Boolean).join(" · ") ||
                  (isTool(c.name) ? "Team or tool" : c.person ? "Department not set" : "Not in directory yet")}
              </div>
              {c.person?.relationship && <div className="small">{c.person.relationship}</div>}
              {c.person?.contact && <div className="small">{c.person.contact}</div>}
            </header>
            {c.questions.length > 0 && (
              <div className="group">
                <h3>
                  Ask {short(c.name)} <span className="muted">{c.questions.length}</span>
                </h3>
                <div className="list-rows">
                  {c.questions.map((q) => (
                    <QuestionItem key={q.id} q={q} showAsk={false} />
                  ))}
                </div>
              </div>
            )}
            {c.waiting.length > 0 && (
              <div className="group">
                <h3>
                  Waiting on {short(c.name)} <span className="muted">{c.waiting.length}</span>
                </h3>
                <div className="list-rows">
                  {c.waiting.map((w) => (
                    <WaitingItem key={w.id} w={w} />
                  ))}
                </div>
              </div>
            )}
            {c.owns.length > 0 && (
              <details className="group">
                <summary>
                  {short(c.name)} owns <span className="muted">{c.owns.length}</span>
                </summary>
                <div className="list-rows">
                  {c.owns.map((x) => (
                    <TaskItem key={x.id} task={x} />
                  ))}
                </div>
              </details>
            )}
            {!c.questions.length && !c.waiting.length && !c.owns.length && <p className="section-empty">Nothing open.</p>}
          </section>
        ))}
      </div>
    </div>
  );
}
