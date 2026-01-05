"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitMemberApplication } from "../../app/(dashboard)/actions/memberActions";
import { memberApplicationInitialState } from "../../lib/memberState";

const TEAM_SIZE_OPTIONS = [
  { value: "sole-gc", label: "Sole GC" },
  { value: "team-1-5", label: "Lead a team of 1–5" },
  { value: "team-6-10", label: "Lead a team of 6–10" },
  { value: "team-11-20", label: "Lead a team of 11–20" },
  { value: "team-20-plus", label: "Lead a team of 20+" },
];

const AREAS_OF_INTEREST = [
  "ESG",
  "Artificial Intelligence",
  "Employment",
  "Corporate Governance",
  "Risk Management",
  "Data & Privacy",
  "Regulation & Compliance",
  "Digital Transformation",
];

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-xs text-red-600">{message}</p>;
}

export default function MemberApplicationForm() {
  const formRef = useRef(null);
  const [state, formAction] = useActionState(submitMemberApplication, memberApplicationInitialState);

  useEffect(() => {
    if (state.status === "success" && formRef.current) {
      formRef.current.reset();
    }
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} className="space-y-8">
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-[0.3em] text-primary/60">Personal details</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-primary-ink">
            First name
            <input
              name="first_name"
              type="text"
              required
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white/70 px-4 py-3"
              aria-invalid={Boolean(state.errors?.first_name)}
            />
            <FieldError message={state.errors?.first_name} />
          </label>
          <label className="text-sm font-semibold text-primary-ink">
            Last name
            <input
              name="last_name"
              type="text"
              required
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white/70 px-4 py-3"
              aria-invalid={Boolean(state.errors?.last_name)}
            />
            <FieldError message={state.errors?.last_name} />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-primary-ink">
            Email
            <input
              name="email"
              type="email"
              required
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white/70 px-4 py-3"
              aria-invalid={Boolean(state.errors?.email)}
            />
            <FieldError message={state.errors?.email} />
          </label>
          <label className="text-sm font-semibold text-primary-ink">
            Contact number
            <input name="phone" type="tel" className="mt-2 w-full rounded-xl border border-neutral-200 bg-white/70 px-4 py-3" />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-primary-ink">
            LinkedIn URL
            <input name="linkedin_url" type="url" className="mt-2 w-full rounded-xl border border-neutral-200 bg-white/70 px-4 py-3" />
          </label>
          <label className="text-sm font-semibold text-primary-ink">
            Location (City)
            <input
              name="location"
              type="text"
              required
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white/70 px-4 py-3"
              aria-invalid={Boolean(state.errors?.location)}
            />
            <FieldError message={state.errors?.location} />
          </label>
        </div>
      </div>
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-[0.3em] text-primary/60">Eligibility</p>
        <label className="text-sm font-semibold text-primary-ink">
          Current role
          <input
            name="current_role"
            type="text"
            required
            className="mt-2 w-full rounded-xl border border-neutral-200 bg-white/70 px-4 py-3"
            aria-invalid={Boolean(state.errors?.current_role)}
          />
          <FieldError message={state.errors?.current_role} />
        </label>
        <label className="text-sm font-semibold text-primary-ink">
          Organisation
          <input
            name="organisation"
            type="text"
            required
            className="mt-2 w-full rounded-xl border border-neutral-200 bg-white/70 px-4 py-3"
            aria-invalid={Boolean(state.errors?.organisation)}
          />
          <FieldError message={state.errors?.organisation} />
        </label>
        <label className="text-sm font-semibold text-primary-ink">
          Sector
          <input
            name="sector"
            type="text"
            required
            className="mt-2 w-full rounded-xl border border-neutral-200 bg-white/70 px-4 py-3"
            aria-invalid={Boolean(state.errors?.sector)}
          />
          <FieldError message={state.errors?.sector} />
        </label>
        <fieldset className="space-y-3 rounded-2xl border border-neutral-200 bg-white/60 p-4">
          <legend className="text-sm font-semibold text-primary-ink">Team structure</legend>
          {TEAM_SIZE_OPTIONS.map((option, index) => (
            <label key={option.value} className="flex items-center gap-2 text-sm text-neutral-700">
              <input type="radio" name="team_size" value={option.value} defaultChecked={index === 0} />
              {option.label}
            </label>
          ))}
        </fieldset>
      </div>
      <div className="space-y-4">
        <label className="text-sm font-semibold text-primary-ink">
          Level of responsibility
          <textarea
            name="responsibility"
            rows={5}
            required
            className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3"
            aria-invalid={Boolean(state.errors?.responsibility)}
            placeholder="Tell us about your executive responsibilities, decision-making remit, or board participation."
          />
          <FieldError message={state.errors?.responsibility} />
        </label>
        <fieldset className="space-y-3 rounded-2xl border border-neutral-200 bg-white/60 p-4">
          <legend className="text-sm font-semibold text-primary-ink">Areas of interest</legend>
          <p className="text-xs text-neutral-500">Select all topics that are most relevant to you.</p>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {AREAS_OF_INTEREST.map((topic) => (
              <label key={topic} className="flex items-center gap-2 text-sm text-neutral-700">
                <input type="checkbox" name="areas_of_interest" value={topic} />
                {topic}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="space-y-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <legend className="text-sm font-semibold text-primary-ink">Consent</legend>
          <div>
            <p className="text-sm font-medium text-primary-ink">Appear in the member directory?</p>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-neutral-700">
              <label className="flex items-center gap-2">
                <input type="radio" name="directory_consent" value="yes" defaultChecked /> Yes, show my profile
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="directory_consent" value="no" /> No, keep me hidden
              </label>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" name="privacy_accepted" required />
            I agree to the
            <a href="/privacy" className="text-primary underline">Privacy Policy</a>
            and
            <a href="/terms" className="text-primary underline">Terms of Use</a>.
          </label>
          <FieldError message={state.errors?.privacy_accepted} />
        </fieldset>
      </div>
      <div>
        <button
          type="submit"
          className="w-full rounded-full bg-primary px-6 py-3 text-base font-semibold text-white transition hover:bg-primary/90"
        >
          Submit application
        </button>
        {state.message && (
          <p className={`mt-3 text-sm ${state.status === "success" ? "text-emerald-700" : "text-red-600"}`}>
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
