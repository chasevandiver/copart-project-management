import PageHead from "@/components/shell/PageHead";
import Groups from "@/components/shell/Groups";
import { getTracker } from "@/lib/store";
import { searchView } from "@/lib/views";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const t = await getTracker();
  const groups = searchView(t, q);
  const n = groups.reduce((s, g) => s + g.entries.length, 0);
  return (
    <>
      <PageHead icon="search" title={q ? `"${q}"` : "Search"} sub={q ? `${n} result${n === 1 ? "" : "s"}` : "Type in the search box on the left."} add={false} />
      <Groups groups={groups} empty={q ? "No matches." : ""} />
    </>
  );
}
