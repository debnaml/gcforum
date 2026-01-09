import Link from "next/link";
import CredentialForm from "../../../components/auth/CredentialForm";
import LoginErrorReporter from "../../../components/auth/LoginErrorReporter";
import RecoveryRedirector from "../../../components/auth/RecoveryRedirector";
import PageBanner from "../../../components/ui/PageBanner";

export const metadata = {
  title: "Sign in | GC Forum",
};

export default async function LoginPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const redirectParam = typeof resolvedParams?.redirect === "string" ? resolvedParams.redirect : null;
  const redirectTo = redirectParam && redirectParam.startsWith("/") ? redirectParam : "/profile";

  return (
    <div className="bg-white min-h-screen">
      <RecoveryRedirector />
      <LoginErrorReporter redirectTo={redirectTo} />
      <PageBanner title="Login" centerContent />
      <div className="mx-auto max-w-6xl px-6 pb-16">
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <section className="border border-neutral-100 bg-white p-8">
              <h2 className="text-xl font-semibold text-primary-ink">Sign in to GC Forum</h2>
              <p className="mt-2 text-sm text-neutral-600">Access members-only resources, events, and your profile controls.</p>
              <div className="mt-6">
                <CredentialForm mode="signin" redirectTo={redirectTo} />
              </div>
              <p className="mt-6 text-sm text-neutral-600">
                Need an account? <Link href="/signup" className="text-primary">Request access</Link>
              </p>
            </section>
          </div>
          <aside className="space-y-6">
            <div className="border border-neutral-100 bg-[#F9F7FB] p-6 text-sm text-neutral-700">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70">Role-based access</p>
              <ul className="mt-4 space-y-3">
                <li><span className="font-semibold text-primary-ink">Members</span>: resource library, event booking, profile controls.</li>
                <li><span className="font-semibold text-primary-ink">Editors</span>: articles, resources, and event updates.</li>
                <li><span className="font-semibold text-primary-ink">Admins</span>: full CMS plus membership approvals.</li>
              </ul>
            </div>
            <div className="border border-dashed border-primary/30 bg-white p-6 text-sm text-neutral-700">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70">Need support?</p>
              <p className="mt-2">Contact the Birketts GC Forum team if you need help resetting access or updating your organisation.</p>
              <Link href="mailto:gcforum@birketts.co.uk" className="mt-4 inline-flex text-primary font-semibold">
                gcforum@birketts.co.uk
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
