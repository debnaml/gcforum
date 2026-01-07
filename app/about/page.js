import PageBanner from "../../components/ui/PageBanner";

export const metadata = {
  title: "About | GC Forum",
};

export default async function AboutPage() {
  return (
    <div className="bg-white">
      <PageBanner
        eyebrow="About the Birketts GC Forum"
        title="A peer-to-peer network for general counsel leaders."
        description="The Birketts GC Forum is a members-only peer network designed to bring together counsel leaders seeking insights, connections, and practical guidance on emerging legal trends."
        align="left"
      />
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        <p className="text-lg text-neutral-600">
          We are refreshing this page. Check back soon for the full story behind the Birketts GC Forum, including our mission, team, and
          upcoming programming. In the meantime, reach out to your Birketts contact if you need anything specific.
        </p>
      </div>
    </div>
  );
}
