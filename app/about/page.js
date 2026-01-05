import PartnersCarousel from "../../components/sections/home/PartnersCarousel";
import PageBanner from "../../components/ui/PageBanner";
import SectionHeading from "../../components/ui/SectionHeading";
import { getHomepageContent } from "../../lib/content";

export const metadata = {
  title: "About | GC Forum",
};

export default async function AboutPage() {
  const { stats, partners } = await getHomepageContent();

  return (
    <div className="bg-white">
      <PageBanner
        eyebrow="About the Birketts GC Forum"
        title="A peer-to-peer network for general counsel leaders."
        description="The Birketts GC Forum is a members-only peer network designed to bring together counsel leaders seeking insights, connections, and practical guidance on emerging legal trends."
        align="left"
      />
      <div className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading
          eyebrow="GC Forum in numbers"
          title="Designed for senior in-house leaders"
          description="Events, resources, and expert partners dedicated to the priorities of general counsel."
        />
        <div className="mt-10 grid gap-6 rounded-3xl bg-ivory px-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.id}>
              <p className="text-4xl font-serif text-primary-ink">{stat.value}</p>
              <p className="mt-2 text-sm text-neutral-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-soft py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <h2 className="heading-2 text-primary-ink">Why the GC Forum exists</h2>
              <p className="mt-4 text-lg text-neutral-700">
                Created following direct feedback from our general counsel clients, the GC Forum is designed to share insights, forge meaningful connections, and access expert guidance on emerging legal trends.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-primary-ink">What you can expect</h3>
              <ul className="mt-4 space-y-3 text-neutral-700">
                <li>Networking: connect with fellow GCs and legal leaders.</li>
                <li>Resources: access exclusive legal updates and training.</li>
                <li>Events: participate in roundtables, seminars, and the flagship annual summit.</li>
                <li>Support: gain guidance from Birketts partners and the wider community.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <PartnersCarousel partners={partners} />
    </div>
  );
}
