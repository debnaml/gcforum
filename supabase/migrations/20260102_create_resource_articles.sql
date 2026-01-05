-- Resource articles schema for GC Forum
-- Articles live under the general "resources" experience and power /resources and /resources/[slug]

create table if not exists resource_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

comment on table resource_categories is 'Lookup table for resource article categories (eg, "Disputes", "Technology").';

insert into resource_categories (name, slug, description)
values
  ('Technology', 'technology', 'Technology and digital transformation guidance for GCs.'),
  ('Planning', 'planning', 'Planning and infrastructure topics relevant to in-house teams.'),
  ('Employment', 'employment', 'Employment law updates and workforce guidance.')
on conflict (slug) do nothing;

create table if not exists resource_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category_id uuid references resource_categories(id) on delete set null,
  intro text,
  summary text,
  content_html text not null,
  tags text[] not null default '{}',
  hero_image_url text,
  seo_title text,
  seo_description text,
  seo_image_url text,
  published_on date not null default (now() at time zone 'utc')::date,
  status text not null default 'published',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table resource_articles is 'Long-form resource articles authored by editor-level members.';
comment on column resource_articles.slug is 'Stable slug for routing /resources/[slug].';
comment on column resource_articles.content_html is 'Rich HTML body (paragraphs, headings, lists, tables, images).';
comment on column resource_articles.tags is 'Simple text tags stored as a Postgres text array.';

create table if not exists resource_article_authors (
  article_id uuid not null references resource_articles(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  position int not null default 0,
  primary key (article_id, profile_id)
);

comment on table resource_article_authors is 'Join table linking articles to their editor-level authors.';

create index if not exists resource_articles_published_on_idx on resource_articles (published_on desc);
create index if not exists resource_articles_category_idx on resource_articles (category_id);
create index if not exists resource_articles_tags_gin_idx on resource_articles using gin (tags);
create index if not exists resource_article_authors_article_idx on resource_article_authors (article_id, position);

create or replace function touch_resource_articles_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists resource_articles_set_updated on resource_articles;
create trigger resource_articles_set_updated
before update on resource_articles
for each row
execute function touch_resource_articles_updated_at();

create or replace view resource_articles_public as
select
  ra.id,
  ra.slug,
  ra.title,
  ra.intro,
  ra.summary,
  ra.content_html,
  ra.tags,
  ra.hero_image_url,
  ra.seo_title,
  ra.seo_description,
  ra.seo_image_url,
  ra.published_on,
  ra.status,
  ra.featured,
  ra.created_at,
  ra.updated_at,
  coalesce(rc.name, 'Uncategorised') as category_name,
  coalesce(rc.slug, 'uncategorised') as category_slug,
  coalesce((
    select array_agg(raa.profile_id order by raa.position, raa.profile_id)
    from resource_article_authors raa
    where raa.article_id = ra.id
  ), '{}') as author_ids,
  coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', p.id,
      'full_name', p.full_name,
      'role', p.role,
      'organisation', p.organisation,
      'avatar_url', p.avatar_url
    ) order by raa.position, p.full_name)
    from resource_article_authors raa
    join profiles p on p.id = raa.profile_id
    where raa.article_id = ra.id
  ), '[]'::jsonb) as authors
from resource_articles ra
left join resource_categories rc on rc.id = ra.category_id;

comment on view resource_articles_public is 'Convenience view exposing resource articles with denormalised authors, tags, and category meta.';

-- -----------------------------------------------------------------------------
-- Access control & Row Level Security
-- -----------------------------------------------------------------------------

alter table resource_categories enable row level security;
alter table resource_articles enable row level security;
alter table resource_article_authors enable row level security;

drop policy if exists "resource categories are public" on resource_categories;
create policy "resource categories are public"
  on resource_categories
  for select
  using (true);

drop policy if exists "service role manages categories" on resource_categories;
create policy "service role manages categories"
  on resource_categories
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "published resources are readable" on resource_articles;
create policy "published resources are readable"
  on resource_articles
  for select
  using (status = 'published');

drop policy if exists "service role manages resources" on resource_articles;
create policy "service role manages resources"
  on resource_articles
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "author links readable when resource published" on resource_article_authors;
create policy "author links readable when resource published"
  on resource_article_authors
  for select
  using (
    exists (
      select 1
      from resource_articles ra
      where ra.id = resource_article_authors.article_id
        and ra.status = 'published'
    )
  );

drop policy if exists "service role manages resource authors" on resource_article_authors;
create policy "service role manages resource authors"
  on resource_article_authors
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

grant select on resource_articles_public to anon, authenticated;
grant select on resource_categories to anon, authenticated;
grant select on resource_article_authors to anon, authenticated;

grant all on resource_categories to service_role;
grant all on resource_articles to service_role;
grant all on resource_article_authors to service_role;
