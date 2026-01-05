"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PartnerCard from "../../cards/PartnerCard";

const getItemsPerView = () => {
  if (typeof window === "undefined") return 1;
  if (window.innerWidth >= 1440) return 4;
  if (window.innerWidth >= 1024) return 3;
  if (window.innerWidth >= 768) return 2;
  return 1;
};

export default function PartnersCarousel({ partners = [] }) {
  const [itemsPerView, setItemsPerView] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const update = () => setItemsPerView(getItemsPerView());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setCurrentIndex(0));
    return () => cancelAnimationFrame(frameId);
  }, [itemsPerView, partners.length]);

  const safePerView = Math.max(1, itemsPerView);
  const maxIndex = Math.max(0, partners.length - safePerView);
  const totalSlides = Math.max(1, partners.length - safePerView + 1);

  const handlePrev = () => setCurrentIndex((prev) => Math.max(0, prev - 1));
  const handleNext = () => setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));

  return (
    <section id="about-birketts" className="bg-[#EAF8FA] py-16 scroll-mt-[140px]">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl text-primary-ink">
            <p className="text-sm uppercase tracking-[0.3em] text-primary-ink/60">Our Team</p>
            <h2 className="mt-3 heading-2">The Birketts partners behind the GC Forum</h2>
            <p className="mt-3 text-neutral-700">
              Meet the specialists who design programmes, share expertise, and host GC Forum gatherings.
            </p>
          </div>
          {partners.length > safePerView && (
            <div className="flex items-center gap-4 text-primary-ink">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="inline-flex h-10 w-10 items-center justify-center text-primary-ink disabled:opacity-40"
                aria-label="Previous team member"
              >
                <ChevronLeft size={24} />
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={`top-dot-${index}`}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2.5 w-2.5 rounded-full ${currentIndex === index ? "bg-primary-ink" : "bg-primary-ink/30"}`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={handleNext}
                disabled={currentIndex === maxIndex}
                className="inline-flex h-10 w-10 items-center justify-center text-primary-ink disabled:opacity-40"
                aria-label="Next team member"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}
        </div>

        {partners.length === 0 ? (
          <p className="mt-10 rounded border border-dashed border-neutral-300 px-4 py-3 text-sm text-neutral-600">
            No partners found.
          </p>
        ) : (
          <div className="mt-10 -mx-3">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${(currentIndex * 100) / safePerView}%)` }}
              >
                {partners.map((partner) => (
                  <div
                    key={partner.id}
                    className="shrink-0 px-3"
                    style={{ flex: `0 0 ${100 / safePerView}%`, maxWidth: `${100 / safePerView}%` }}
                  >
                    <PartnerCard partner={partner} />
                  </div>
                ))}
              </div>
            </div>
            {totalSlides > 1 && partners.length <= safePerView && (
              <div className="mt-8 flex justify-center gap-2">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={`bottom-dot-${index}`}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2.5 w-2.5 rounded-full ${currentIndex === index ? "bg-primary-ink" : "bg-primary-ink/30"}`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
