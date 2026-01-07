import Link from "next/link";
import CredentialForm from "../../../components/auth/CredentialForm";
import LoginErrorReporter from "../../../components/auth/LoginErrorReporter";
import RecoveryRedirector from "../../../components/auth/RecoveryRedirector";

export const metadata = {
  title: "Sign in | GC Forum",
};

export default async function LoginPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const redirectParam = typeof resolvedParams?.redirect === "string" ? resolvedParams.redirect : null;
  const redirectTo = redirectParam && redirectParam.startsWith("/") ? redirectParam : "/profile";

  return (
    <div className="bg-white">
      <RecoveryRedirector />
      <LoginErrorReporter redirectTo={redirectTo} />
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 px-6 py-16 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-primary/60">GC Forum Access</p>
          <h1 className="mt-4 text-4xl font-serif text-primary-ink">Sign in to manage events, resources, and articles.</h1>
          <p className="mt-4 text-lg text-neutral-600">
            Members can save resources and see the latest updates. Editors manage articles and resources, while admins control the homepage experience.
          </p>
          <div className="mt-10 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
            <CredentialForm mode="signin" redirectTo={redirectTo} />
            <p className="mt-6 text-sm text-neutral-600">
              Need an account? <Link href="/signup" className="text-primary">Request access</Link>
            </p>
          </div>
        </div>
        <div className="rounded-3xl bg-primary-ink p-8 text-white">
          <h2 className="heading-2">Role-based access</h2>
          <ul className="mt-6 space-y-4 text-sm text-white/80">
            <li>Members: resource access, event booking, profile controls.</li>
            <li>Editors: article CRUD, resource publishing, event updates.</li>
            <li>Admins: everything plus homepage CMS and membership approvals.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
