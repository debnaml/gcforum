const alignClass = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export default function SectionHeading({ eyebrow, title, description, align = "left" }) {
  return (
    <div className={`flex flex-col gap-2 ${alignClass[align] ?? "text-left"}`}>
      {eyebrow && <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">{eyebrow}</p>}
      <h2 className="heading-2 text-primary-ink">{title}</h2>
      {description && <p className="text-lg text-neutral-600">{description}</p>}
    </div>
  );
}
