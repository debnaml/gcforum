import Image from "next/image";
import Button from "../../ui/Button";

export default function HomeHero({ hero }) {
  const heading = hero?.title?.trim() || "Join the Birketts GC Forum";
  const intro =
    hero?.copy?.trim() ||
    "An exclusive community for General Counsel and senior legal professionals, providing a platform for knowledge sharing, professional development, and meaningful connections.";
  const eyebrow = hero?.eyebrow?.trim() || "";
  const applyHref = "/join#apply";
  const applyLabel = "Apply to Join";

  return (
    <section className="relative -mt-[110px] overflow-hidden bg-primary-ink pt-[130px] text-white">
      <Image
        src="/GC Forum-1462176392-Web.jpg"
        alt="GC Forum members connecting"
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#331d4c]/95 via-[#331d4c]/80 to-[#1b0a2f]/85" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 py-24">
        <div className="max-w-2xl">
          {eyebrow && <p className="text-sm uppercase tracking-[0.3em] text-white/70">{eyebrow}</p>}
          <h1 className="text-[55px] font-hero-serif font-medium leading-tight">{heading}</h1>
          <p className="mt-4 text-lg text-white/80">{intro}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button as="a" href={applyHref} variant="secondary">
              {applyLabel}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
