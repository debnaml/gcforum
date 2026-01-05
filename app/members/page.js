import MemberDirectory from "../../components/sections/members/MemberDirectory";
import PageBanner from "../../components/ui/PageBanner";
import { getMembers } from "../../lib/content";

export const metadata = {
  title: "Members | GC Forum",
};

export default async function MembersPage() {
  const members = await getMembers();
  return (
    <div className="bg-white">
      <PageBanner
        title="Member Directory"
        description="Search by organisation, location, sector, and job level to connect with fellow GC Forum members. Manage your visibility from the My Settings page once you're signed in."
        centerContent
      />
      <MemberDirectory members={members} />
    </div>
  );
}
