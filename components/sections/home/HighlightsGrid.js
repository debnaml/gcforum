import Button from "../../ui/Button";

const memberBenefits = [
  {
    title: "Networking",
    description: "Connect with fellow GCs and legal leaders",
  },
  {
    title: "Resources",
    description: "Access exclusive legal updates and training",
  },
  {
    title: "Events",
    description: "Participate in roundtables and seminars",
  },
  {
    title: "Support",
    description: "Expert guidance from Birketts partners",
  },
];

export default function HighlightsGrid({ highlights }) {
  return (
    <section id="about" className="bg-white scroll-mt-[140px]">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-6 text-primary-ink">
            <h2 className="heading-2 font-medium leading-tight">About the GC Forum</h2>
            <div className="space-y-4 text-lg text-neutral-700">
              <p>
                The Birketts GC Forum is a members-only peer-to-peer network created to bring together a community of like-minded general counsel leaders.
              </p>
              <p>
                A space to share insights and challenges, forge meaningful connections, and access expert guidance on emerging legal trends, the GC Forum has been created for senior in-house legal leaders working in medium to large organisations across the private, public, and third sectors.
              </p>
              <p>
                Being a member of the GC Forum will give you access to a range of informative roundtables, thought-provoking dinners, a flagship annual summit, and practical training opportunities.
              </p>
            </div>
            <Button as="a" href="/join#apply" variant="secondary" className="text-[18px]">
              Apply to Join
            </Button>
          </div>
          <div className="space-y-6">
            {memberBenefits.map((benefit, index) => (
              <article key={benefit.title} className="border-b border-neutral-200 pb-6 last:border-b-0">
                <h3 className="text-2xl font-hero-serif text-primary-ink">{benefit.title}</h3>
                <p className="mt-1 text-neutral-700">{benefit.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
