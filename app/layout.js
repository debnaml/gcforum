import "./globals.css";
import { Noto_Serif, Open_Sans } from "next/font/google";
import SiteHeader from "../components/layout/SiteHeader";
import SiteFooter from "../components/layout/SiteFooter";
import { AuthProvider } from "../components/auth/AuthProvider";
import { getCurrentProfile } from "../lib/auth/getProfile";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-sans-base",
});

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  weight: "500",
  variable: "--font-hero-serif",
});

export const metadata = {
  title: "GC Forum",
  description: "Birketts GC Forum hub",
};

export default async function RootLayout({ children }) {
  const profile = await getCurrentProfile();

  return (
    <html lang="en">
      <body className={`${openSans.variable} ${notoSerif.variable} bg-primary-ink text-primary-ink`}>
        <AuthProvider>
          <SiteHeader profile={profile} />
          <main className="bg-primary-ink pt-[110px]">{children}</main>
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
