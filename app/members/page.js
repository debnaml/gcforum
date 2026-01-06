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
        centerContent
      />
      <MemberDirectory members={members} />
    </div>
  );
}
