import { redirect } from "next/navigation";
import MemberDirectory from "../../components/sections/members/MemberDirectory";
import PageBanner from "../../components/ui/PageBanner";
import { getMembers } from "../../lib/content";
import { getCurrentProfile } from "../../lib/auth/getProfile";
import { ROLES } from "../../lib/auth/roles";

export const metadata = {
  title: "Members | GC Forum",
};

export default async function MembersPage() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== ROLES.admin) {
    redirect("/resources");
  }
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
