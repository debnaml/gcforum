import Link from "next/link";
import { formatDate } from "../../lib/utils";
import Badge from "../ui/Badge";

export default function ArticleCard({ article }) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5">
      <Badge tone="primary">{article.category}</Badge>
      <h3 className="text-xl font-semibold text-primary-ink">{article.title}</h3>
      <p className="text-sm text-neutral-600">{article.excerpt}</p>
      <div className="flex items-center justify-between text-sm text-neutral-500">
        <span>{article.author}</span>
        <span>{formatDate(article.date)}</span>
      </div>
      <Link href={`/articles/${article.id}`} className="text-sm font-semibold text-primary">
        Read article →
      </Link>
    </article>
  );
}
