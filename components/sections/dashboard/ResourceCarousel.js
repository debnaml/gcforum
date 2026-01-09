"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ResourceCard from "../../cards/ResourceCard";

export default function ResourceCarousel({ resources = [] }) {
  const scrollRef = useRef(null);

  const scrollBy = (direction) => {
    const container = scrollRef.current;
    if (!container) return;
    const gapPx = 24;
    const firstCard = container.querySelector("[data-resource-card]");
    const cardWidth = firstCard?.getBoundingClientRect().width ?? container.clientWidth;
    container.scrollBy({ left: direction * (cardWidth + gapPx), behavior: "smooth" });
  };

  if (!resources.length) {
    return (
      <section className="rounded-3xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-600">
        No resources to show yet.
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-primary/70">Latest Resources</p>
          <h2 className="mt-2 text-2xl font-serif text-primary-ink">Fresh thinking for GC leaders</h2>
        </div>
        {resources.length > 2 && (
          <div className="flex items-center gap-3 text-primary-ink">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-primary/40 text-primary hover:bg-primary hover:text-white"
              aria-label="Previous resource"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-primary/40 text-primary hover:bg-primary hover:text-white"
              aria-label="Next resource"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {resources.map((resource) => (
            <div
              key={resource.id ?? resource.slug}
              data-resource-card
              className="flex-1 shrink-0 snap-start basis-full md:basis-[calc((100%-24px)/2)] lg:basis-[calc((100%-48px)/3)]"
            >
              <ResourceCard resource={resource} disableHover />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
