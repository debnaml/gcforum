import Button from "../../../components/ui/Button";

export const metadata = {
  title: "Request access | GC Forum",
};

export default function SignupPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto flex max-w-4xl flex-col gap-10 px-6 py-16 lg:flex-row">
        <div className="flex-1">
          <p className="text-sm uppercase tracking-[0.3em] text-primary/60">Apply to join</p>
          <h1 className="mt-4 text-4xl font-serif text-primary-ink">Create a GC Forum account</h1>
          <p className="mt-4 text-lg text-neutral-600">
            Please complete the membership application first. Once approved, we&apos;ll send a welcome email with a secure link to finish creating your account.
          </p>
          <div className="mt-8 space-y-4 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
            <p className="text-sm text-neutral-600">
              If you&apos;ve already been approved, check your inbox for the Birketts GC Forum invite email and follow the link inside to set your password.
            </p>
            <Button as="a" href="/join#apply" variant="secondary">
              Start the application
            </Button>
          </div>
        </div>
        <div className="flex-1 rounded-3xl bg-soft p-8">
          <h2 className="heading-2 text-primary-ink">What&apos;s included</h2>
          <ul className="mt-4 space-y-3 text-sm text-neutral-700">
            <li>Monthly roundtables with Birketts partners.</li>
            <li>Access to the full resource library and saved favourites.</li>
            <li>Priority booking for training and live events.</li>
            <li>Member-only articles and benchmarking data.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
