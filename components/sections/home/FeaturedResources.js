import ResourceCard from "../../cards/ResourceCard";
import SectionHeading from "../../ui/SectionHeading";

export default function FeaturedResources({ resources }) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Latest Resources"
          title="Insights created for the community"
          description="Save favourites, share with colleagues, and return to the resource centre for the full library."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </div>
    </section>
  );
}
