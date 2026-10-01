import Link from "next/link";
import PageHead from "@/components/shell/PageHead";
import { getTracker } from "@/lib/store";
import { personNotes, personOpenCount, personSlug } from "@/lib/views";

export default async function PeoplePage() {
  const t = await getTracker();
  return (
    <>
      <PageHead icon="person" title="People" sub="Everyone you work with. Open a person for what to ask them, what they owe you, what they own, and every note that mentions them." add={{ kind: "person", label: "Add person" }} />
      {t.people.length ? (
        <div className="s-cards">
          {t.people.map((p) => {
            const open = personOpenCount(t, p.name);
            const notes = personNotes(t, p.name).length;
            const about = [p.title, p.department].filter(Boolean).join(" · ");
            return (
              <Link key={p.name} href={`/people/${personSlug(p.name)}`} className="s-card">
                <div className="s-card-head">
                  <span className="s-card-title">{p.name}</span>
                </div>
                <p className="s-card-text">{[about, p.relationship].filter(Boolean).join(". ") || "No details yet."}</p>
                <div className="s-card-stats">
                  <span>{open} open</span>
                  <span>
                    {notes} note{notes === 1 ? "" : "s"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="s-empty">No people yet. Press Add person.</p>
      )}
    </>
  );
}
