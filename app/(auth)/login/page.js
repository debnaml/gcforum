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
      <div className="relative left-1/2 right-1/2 -mt-16 w-screen -translate-x-1/2">
        <PageBanner title="Login" centerContent />
      </div>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 px-6 py-16 lg:grid-cols-[2fr_1fr]">
        <div>
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
