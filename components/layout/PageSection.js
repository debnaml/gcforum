export default function PageSection({ id, children, bleed = false, className = "" }) {
  return (
    <section id={id} className={`py-16 ${bleed ? "bg-soft" : ""} ${className}`}>
      <div className={`mx-auto w-full max-w-6xl px-6`}>{children}</div>
    </section>
  );
}
