import PartnersCarousel from "../../components/sections/home/PartnersCarousel";
import MemberApplicationForm from "../../components/forms/MemberApplicationForm";
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
      <section id="apply" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.3em] text-primary/60">Membership application</p>
              <h2 className="mt-3 heading-2 text-primary-ink">Tell us about your practice</h2>
              <p className="mt-2 text-sm text-neutral-600">We review every submission manually and respond within two working days.</p>
              <div className="mt-6">
                <MemberApplicationForm />
              </div>
            </div>
            <aside className="rounded-3xl bg-soft p-6 text-primary-ink">
              <h3 className="text-2xl font-hero-serif">Why apply?</h3>
              <p className="mt-2 text-sm text-neutral-600">Membership is curated for sitting general counsel and senior in-house leaders.</p>
              <ul className="mt-4 space-y-3 text-sm text-neutral-700">
                {HIGHLIGHT_POINTS.map((point) => (
                  <li key={point} className="flex gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary" aria-hidden />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-2xl border border-dashed border-primary/30 bg-white/70 p-4 text-sm text-neutral-700">
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
