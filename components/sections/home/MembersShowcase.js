import MemberCard from "../../cards/MemberCard";
import SectionHeading from "../../ui/SectionHeading";

export default function MembersShowcase({ members }) {
  return (
    <section id="team" className="bg-white py-16 scroll-mt-[140px]">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="New Members"
          title="A growing peer community"
          description="Recently joined general counsel leaders from across the UK."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}
