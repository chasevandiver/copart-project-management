import PageHead from "@/components/shell/PageHead";
import Groups from "@/components/shell/Groups";
import { getTracker, todayServer } from "@/lib/store";
import { projectNames } from "@/lib/tracker";
import { upcomingView } from "@/lib/views";

export default async function UpcomingPage() {
  const t = await getTracker();
  return (
    <>
      <PageHead icon="upcoming" title="Upcoming" sub="Your dated to-dos for the next two weeks, then everything without a date by project." />
      <Groups groups={upcomingView(t, todayServer(), projectNames(t))} />
    </>
  );
}
