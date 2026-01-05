"use client";

import { useMemo, useState } from "react";
import MemberCard from "../../cards/MemberCard";
import SectionHeading from "../../ui/SectionHeading";

const filterFields = [
  { key: "organisation", label: "All Organisations" },
  { key: "location", label: "All Locations" },
  { key: "sector", label: "All Sectors" },
  { key: "jobLevel", label: "All Job Levels" },
];

const valueForField = (member, key) => {
  if (key === "jobLevel") {
    return member?.jobLevel ?? member?.job_level ?? null;
  }
  return member?.[key] ?? null;
};

export default function MemberDirectory({ members }) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ organisation: "all", location: "all", sector: "all", jobLevel: "all" });

  const optionSets = useMemo(() => {
    const buildOptions = (key) =>
      Array.from(new Set(members.map((member) => valueForField(member, key)).filter(Boolean))).sort();
    return filterFields.reduce((acc, field) => {
      acc[field.key] = buildOptions(field.key);
      return acc;
    }, {});
  }, [members]);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      if (search && !member.name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      return filterFields.every(({ key }) => {
        const nextValue = filters[key];
        if (nextValue === "all") return true;
        return valueForField(member, key) === nextValue;
      });
    });
  }, [members, search, filters]);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <SectionHeading
        eyebrow="Member Directory"
        title="Search by organisation, location, and sector"
        description="Use the directory to connect with peers and explore new contacts across the GC Forum community."
      />
      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="grid items-start gap-6 md:grid-cols-2 lg:col-span-2">
          {filteredMembers.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
        <aside className="border border-neutral-300 bg-[#F5F4F6] p-6">
          <h4 className="text-lg font-semibold text-primary-ink">Directory Filter</h4>
          <label className="mt-4 flex flex-col gap-2 text-sm text-neutral-600">
            Members Name
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search members"
              className="border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:border-[#1A9AA5] focus:outline-none"
            />
          </label>
          {filterFields.map(({ key, label }) => (
            <label key={key} className="mt-4 flex flex-col gap-2 text-sm text-neutral-600">
              {label}
              <select
                value={filters[key]}
                onChange={(event) => setFilters((prev) => ({ ...prev, [key]: event.target.value }))}
                className="border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:border-[#1A9AA5] focus:outline-none"
              >
                <option value="all">All</option>
                {optionSets[key].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <button className="mt-6 w-full border border-[#1A9AA5] bg-[#1A9AA5] px-4 py-2 text-sm font-semibold text-white">
            Apply Filter
          </button>
          <div className="mt-8 border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
            <p className="font-semibold text-primary-ink">Not appearing?</p>
            <p className="mt-2">
              If your profile is not appearing in the directory, check your privacy settings in your member profile.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
