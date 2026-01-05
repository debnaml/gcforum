export default function Badge({ children, tone = "muted" }) {
  const palette = {
    muted: "bg-neutral-100 text-neutral-700",
    accent: "bg-accent/10 text-accent",
    primary: "bg-primary/10 text-primary",
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${palette[tone]}`}>
      {children}
    </span>
  );
}
