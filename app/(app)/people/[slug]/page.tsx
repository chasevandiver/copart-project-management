import { notFound } from "next/navigation";
import PageHead from "@/components/shell/PageHead";
import Groups from "@/components/shell/Groups";
import EditPerson from "@/components/shell/EditPerson";
import { getTracker } from "@/lib/store";
import { findPerson, personView } from "@/lib/views";

export default async function PersonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = await getTracker();
  const p = findPerson(t, slug);
  if (!p) notFound();
  const first = p.name.split(" ")[0];

  return (
    <>
      <PageHead icon="person" title={p.name} actions={<EditPerson person={p} />} add={{ kind: "question", who: p.name, label: `Ask ${first}` }}>
        <div className="s-proj-meta">
          {p.title && <span>{p.title}</span>}
          {p.department && <span>{p.department}</span>}
          {p.contact && <span>{p.contact}</span>}
        </div>
        {p.relationship && <p className="s-head-sub">{p.relationship}</p>}
      </PageHead>
      <Groups groups={personView(t, p.name)} empty={`Nothing mentions ${first} yet. Notes and to-dos that use their name show up here.`} />
    </>
  );
}
