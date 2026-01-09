import ResourceCarousel from "../../../components/sections/dashboard/ResourceCarousel";
import PartnersCarousel from "../../../components/sections/home/PartnersCarousel";
import PageBanner from "../../../components/ui/PageBanner";
import Button from "../../../components/ui/Button";
import { getHomepageContent, getResources } from "../../../lib/content";
import { getCurrentProfile } from "../../../lib/auth/getProfile";

export const metadata = {
  title: "Dashboard | GC Forum",
};

export default async function DashboardPage() {
  const [profile, resourcesPayload, homepage] = await Promise.all([
    getCurrentProfile(),
    getResources({ pageSize: 10 }),
    getHomepageContent(),
  ]);

  const displayName = profile?.full_name ?? profile?.fullName ?? profile?.name ?? "there";
  const latestResources = (resourcesPayload?.items ?? []).slice(0, 10);
  const partners = homepage?.partners ?? [];

  return (
    <>
      <PageBanner
        eyebrow="Member dashboard"
        title={`Welcome ${displayName},
to the Birketts GC Forum.`}
        spacing="compact"
      />

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16 space-y-16">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <div className="space-y-6 text-primary-ink">
              <h2 className="heading-2 font-medium leading-tight">Your GC Forum hub</h2>
              <div className="space-y-4 text-neutral-700">
                <p className="text-[18px] leading-relaxed">
                  This is your dedicated Birketts GC Forum hub, providing access to insights, resources, and events specifically created for general counsel leaders.
                </p>
                <p className="text-base leading-relaxed">
                  Led by Birketts Partners Adrian Seagers, Sam Greenhalgh, Ian Williamson, Maria Peyman, and Josh Ripman, and Legal Directors James Green and Matthew Powell, the GC Forum has been designed following direct feedback from general counsels.
                </p>
                <p className="text-base leading-relaxed">
                  We hope that this Forum can create a community of like-minded leaders that share insights and challenges and forge meaningful connections.
                </p>
                <p className="text-base leading-relaxed">
                  We want the GC Forum to grow and expand, so please do let us know what resources you&apos;d like to see on the hub, what events you&apos;d like to attend, and the types of topics you&apos;d like to see covered.
                </p>
              </div>
            </div>
            <div className="space-y-6 bg-[#ede6f5] px-6 py-8 text-primary-ink">
              <div>
                <h3 className="text-2xl font-hero-serif text-primary-ink">Speak to us</h3>
                <p className="mt-2 text-neutral-700">Let us know how we can support you.</p>
              </div>
              <form className="space-y-4">
                <label className="block text-sm font-semibold text-primary-ink">
                  Name
                  <input
                    name="name"
                    type="text"
                    className="mt-2 w-full border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 focus:border-primary focus:outline-none rounded-none"
                    placeholder="Your name"
                  />
                </label>
                <label className="block text-sm font-semibold text-primary-ink">
                  Email
                  <input
                    name="email"
                    type="email"
                    className="mt-2 w-full border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 focus:border-primary focus:outline-none rounded-none"
                    placeholder="you@company.com"
                  />
                </label>
                <label className="block text-sm font-semibold text-primary-ink">
                  Message
                  <textarea
                    name="message"
                    rows={5}
                    className="mt-2 w-full border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 focus:border-primary focus:outline-none rounded-none"
                    placeholder="Tell us more about the support you&apos;re looking for"
                  />
                </label>
                <Button type="submit" className="w-full justify-center uppercase tracking-wide">
                  Send message
                </Button>
              </form>
            </div>
          </div>

          <ResourceCarousel resources={latestResources} />
        </div>
      </section>

      {partners.length > 0 && <PartnersCarousel partners={partners} />}
    </>
  );
}
