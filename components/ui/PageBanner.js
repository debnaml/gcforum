export default function PageBanner({
  title,
  eyebrow,
  description,
  align = "left",
  centerContent = false,
  spacing = "normal",
  children,
}) {
  if (!title) {
    return null;
  }

  const alignmentClasses = align === "center" ? "items-center text-center" : "items-start text-left";
  const verticalClasses = centerContent ? "justify-center" : "justify-start";
  const stackGap = spacing === "compact" ? "gap-2" : "gap-4";

  return (
    <section className="w-full bg-primary text-white">
      <div className={`mx-auto flex min-h-[250px] max-w-6xl flex-col ${stackGap} px-6 py-[75px] ${alignmentClasses} ${verticalClasses}`}>
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#CBEEF3]">{eyebrow}</p>
        )}
        <h1 className="font-hero-serif text-4xl text-white md:text-5xl whitespace-pre-line">{title}</h1>
        {description && <p className="text-lg text-white/80">{description}</p>}
        {children}
      </div>
    </section>
  );
}
