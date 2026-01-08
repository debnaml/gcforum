import PartnersCarousel from "../../components/sections/home/PartnersCarousel";
import MemberApplicationForm from "../../components/forms/MemberApplicationForm";
import SectionHeading from "../../components/ui/SectionHeading";
import { getHomepageContent } from "../../lib/content";

export const metadata = {
  title: "Join the GC Forum | GC Forum",
};

const HIGHLIGHT_POINTS = [
  "Exclusive peer network for sitting GCs and senior legal leaders",
  "Roundtables, private dinners, and flagship annual summit",
  "Curated resource library with horizon scanning and templates",
  "Direct access to Birketts partners across key practices",
];

export default async function JoinPage() {
  const homepageContent = await getHomepageContent();
  const partners = Array.isArray(homepageContent?.partners) ? homepageContent.partners : [];

  return (
    <div>
      <section className="bg-primary-ink py-24 text-white">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="flex max-w-3xl flex-col items-start gap-6">
            <h1 className="font-hero-serif text-4xl leading-tight text-white md:text-[52px]">Join the Birketts GC Forum</h1>
            <p className="text-lg text-white/80">
              An exclusive community for general counsel and senior legal professionals, providing a platform for knowledge sharing, professional development, and meaningful connections.
            </p>
          </div>
        </div>
      </section>
      <section id="apply" className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6 space-y-10">
          <SectionHeading
            title="Tell us about you"
            description="We review every submission manually and respond within two working days."
          />
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 bg-[#F9F7FB] p-6">
              <MemberApplicationForm />
            </div>
            <aside className="space-y-4 bg-white p-6 text-primary-ink">
              <div>
                <h3 className="text-2xl font-hero-serif">Why apply?</h3>
                <p className="mt-2 text-sm text-neutral-600">Membership is curated for sitting general counsel and senior in-house leaders.</p>
              </div>
              <ul className="space-y-3 text-sm text-neutral-700">
                {HIGHLIGHT_POINTS.map((point) => (
                  <li key={point} className="flex gap-2">
                    <span className="mt-1 inline-block h-2 w-2 flex-none rounded-full bg-primary" aria-hidden />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <div className="border border-dashed border-primary/30 bg-white/70 p-4 text-sm text-neutral-700">
                <p className="font-semibold text-primary-ink">Need help?</p>
                <p className="mt-1">
                  Email <a className="text-primary underline" href="mailto:gcforum@birketts.co.uk">gcforum@birketts.co.uk</a> and the team will assist.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
      <PartnersCarousel partners={partners} />
    </div>
  );
}
