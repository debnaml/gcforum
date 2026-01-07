import PageBanner from "../../../components/ui/PageBanner";

export const metadata = {
  title: "My Favourites | GC Forum",
};

export default function FavouritesPage() {
  return (
    <div className="bg-white">
      <div className="relative left-1/2 right-1/2 -mt-16 w-screen -translate-x-1/2">
        <PageBanner
          title="Saved items coming soon"
          description="We are building a personalised space for your saved articles, events, and resources. Check back shortly to manage everything in one place."
          centerContent
        />
      </div>
      <div className="mx-auto max-w-3xl px-6 py-16 text-center text-neutral-600">
        <p>
          In the meantime, keep browsing the Resource Centre and members area—anything you flag as noteworthy with the Birketts team
          will still be available via your regular email recaps.
        </p>
      </div>
    </div>
  );
}
