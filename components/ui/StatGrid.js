export default function StatGrid({ stats }) {
  return (
    <div className="grid gap-6 rounded-3xl bg-ivory px-8 py-10 text-primary-ink sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.id} className="flex flex-col gap-2 border-primary/10">
          <p className="text-4xl font-serif">{stat.value}</p>
          <p className="text-sm text-neutral-600">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
