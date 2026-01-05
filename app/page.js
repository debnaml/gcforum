import HomeHero from "../components/sections/home/HomeHero";
import HighlightsGrid from "../components/sections/home/HighlightsGrid";
import PartnersCarousel from "../components/sections/home/PartnersCarousel";
import AboutBirkettsSection from "../components/sections/home/AboutBirketts";
import { getHomepageContent } from "../lib/content";

export default async function HomePage() {
  const content = await getHomepageContent();

  return (
    <>
      <HomeHero hero={content.hero} />
      <HighlightsGrid highlights={content.highlights ?? []} />
      <PartnersCarousel partners={content.partners ?? []} />
      <AboutBirkettsSection />
    </>
  );
}
