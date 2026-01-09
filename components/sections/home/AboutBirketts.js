export default function AboutBirkettsSection() {
  const stats = [
    { value: "700+", label: "Lawyers and legal professionals" },
    { value: "160", label: "Years of Birketts heritage" },
    { value: "8", label: "UK offices across key cities" },
    { value: "4", label: "Principal practice groups" },
  ];

  return (
    <section className="bg-white py-16 scroll-mt-[140px]" id="about-birketts">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-5 text-[#333333]">
            <p className="text-sm uppercase tracking-[0.3em] text-primary-ink/60">About Birketts</p>
            <h2 className="heading-2 font-medium leading-tight">About Birketts</h2>
            <p className="text-xl leading-relaxed text-neutral-700">
              Birketts is a full-service, UK Top 50 law firm. With a heritage spanning 160 years, we have more than 700
              lawyers and legal professionals based in Bristol, Cambridge, Chelmsford, Ipswich, London, Norwich, and Sevenoaks.
            </p>
            <p className="text-base leading-relaxed text-neutral-700">
              We advise businesses, government and public sector organisations and individuals in the UK and internationally. Our business is divided into four
              principal practice groups: real estate, corporate services, dispute resolution and private client.
            </p>
            <p className="text-base leading-relaxed text-accent">
              <a href="https://www.birketts.co.uk" target="_blank" rel="noreferrer">
                To find out more about Birketts, click here
              </a>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat) => (
              <article
                key={stat.label}
                className="flex h-full flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white p-6 text-center shadow-sm"
              >
                <h3 className="text-3xl font-hero-serif text-primary-ink">{stat.value}</h3>
                <p className="mt-2 text-sm text-neutral-600">{stat.label}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
