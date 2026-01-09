import PageBanner from "../../components/ui/PageBanner";
import PartnersCarousel from "../../components/sections/home/PartnersCarousel";
import AboutBirkettsSection from "../../components/sections/home/AboutBirketts";
import { memberBenefits } from "../../components/sections/home/HighlightsGrid";
import { getHomepageContent } from "../../lib/content";

export const metadata = {
  title: "About | GC Forum",
};

const aboutCopy = [
  "The Birketts GC Forum is a members-only peer-to-peer network created to bring together a community of like-minded general counsel leaders.",
  "We designed the GC Forum following feedback from general counsel clients that they wanted a community to share insights and challenges, forge meaningful connections, and access expert guidance on emerging legal trends.",
  "This Forum has been created for senior in-house legal leaders working in medium to large organisations across the private, public, and third sectors.",
  "We want the GC Forum to grow and expand, so please do let us know what resources you’d like to see on the hub, what events you’d like to attend, and the types of topics you’d like to see covered.",
];

export default async function AboutPage() {
  const { partners = [] } = await getHomepageContent();

  return (
    <div className="bg-white">
       <PageBanner
              title="About the Birketts GC Forum"
              centerContent
            />
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="space-y-6 text-primary-ink">
              <div className="space-y-4 text-neutral-700">
                {aboutCopy.map((paragraph, index) => (
                  <p key={paragraph.slice(0, 16)} className={index === 0 ? "text-lg" : "text-base"}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              {memberBenefits.map((benefit) => (
                <article key={benefit.title} className="border-b border-neutral-200 pb-6 last:border-b-0">
                  <h3 className="text-2xl font-hero-serif text-primary-ink">{benefit.title}</h3>
                  <p className="mt-1 text-neutral-700">{benefit.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <PartnersCarousel partners={partners} />
      <AboutBirkettsSection />
    </div>
  );
}
