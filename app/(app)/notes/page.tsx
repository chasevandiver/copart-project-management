import PageHead from "@/components/shell/PageHead";
import Groups from "@/components/shell/Groups";
import { getTracker } from "@/lib/store";
import { notesView } from "@/lib/views";

export default async function NotesPage() {
  const t = await getTracker();
  return (
    <>
      <PageHead icon="note" title="Notes" sub="Meeting notes and thoughts, newest first." add={{ kind: "note", label: "New note" }} />
      <Groups groups={notesView(t)} empty="No notes yet." />
    </>
  );
}
