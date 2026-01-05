import { getArticles, getResources } from "../../../lib/content";
import RoleGate from "../../../components/auth/RoleGate";
import { ROLES } from "../../../lib/auth/roles";
import { formatDate } from "../../../lib/utils";

export const metadata = {
  title: "Editor Workspace | GC Forum",
};

export default async function EditorPage() {
  const [articles, resourcesPayload] = await Promise.all([getArticles(), getResources()]);
  const resources = resourcesPayload.items ?? [];

  return (
    <RoleGate role={ROLES.editor}>
      <div className="space-y-8">
      <section className="rounded-3xl border border-neutral-200 bg-white p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-primary/60">Articles</p>
        <h2 className="mt-2 heading-2 text-primary-ink">Draft queue</h2>
        <ul className="mt-4 space-y-3">
          {articles.map((article) => (
            <li key={article.id} className="rounded-2xl border border-neutral-100 p-4">
              <p className="font-semibold text-primary-ink">{article.title}</p>
              <p className="text-sm text-neutral-600">{article.author}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-3xl border border-neutral-200 bg-white p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-primary/60">Resources</p>
        <h2 className="mt-2 heading-2 text-primary-ink">Recently published</h2>
        <ul className="mt-4 space-y-3">
          {resources.slice(0, 6).map((resource) => (
            <li key={resource.id} className="flex items-center justify-between rounded-2xl border border-neutral-100 p-4">
              <div>
                <p className="font-semibold text-primary-ink">{resource.title}</p>
                <p className="text-sm text-neutral-600">
                  {resource.category} · {resource.author} · {resource.publishedOn ? formatDate(resource.publishedOn) : "Draft"}
                </p>
              </div>
              <button className="rounded-none border border-primary px-4 py-2 text-sm text-primary">Edit</button>
            </li>
          ))}
        </ul>
        </section>
      </div>
    </RoleGate>
  );
}
