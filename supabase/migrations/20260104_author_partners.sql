-- Align partners table with author requirements and switch resource article authors
-- to reference partners instead of editor profiles.

alter table partners
  add column if not exists show_on_team boolean not null default true,
  add column if not exists is_author boolean not null default false;

-- Rebuild the resource article authors relationship to target partners.
drop view if exists resource_articles_public;

alter table resource_article_authors
  drop constraint if exists resource_article_authors_profile_id_fkey;

alter table resource_article_authors
  drop constraint if exists resource_article_authors_partner_id_fkey;

alter table resource_article_authors
  drop constraint if exists resource_article_authors_pkey;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'resource_article_authors'
      and column_name = 'profile_id'
  ) then
    alter table resource_article_authors
      rename column profile_id to partner_id;
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'resource_article_authors'
      and column_name = 'partner_id'
      and data_type <> 'text'
  ) then
    alter table resource_article_authors
      alter column partner_id type text using partner_id::text;
  end if;
end $$;

alter table resource_article_authors
  add constraint resource_article_authors_partner_id_fkey
  foreign key (partner_id)
  references partners(id)
  on delete cascade;

alter table resource_article_authors
  add constraint resource_article_authors_pkey
  primary key (article_id, partner_id);

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
    select array_agg(raa.partner_id order by raa.position, raa.partner_id)
    from resource_article_authors raa
    where raa.article_id = ra.id
  ), '{}'::text[]) as author_ids,
  coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', pr.id,
      'name', pr.name,
      'full_name', pr.name,
      'role', pr.title,
      'bio', pr.bio,
      'email', pr.email,
      'phone', pr.phone,
      'avatar', pr.avatar,
      'avatar_url', pr.avatar,
      'linkedin', pr.linkedin,
      'show_on_team', pr.show_on_team,
      'is_author', pr.is_author
    ) order by raa.position, pr.name)
    from resource_article_authors raa
    join partners pr on pr.id = raa.partner_id
    where raa.article_id = ra.id
  ), '[]'::jsonb) as authors
from resource_articles ra
left join resource_categories rc on rc.id = ra.category_id;

comment on view resource_articles_public is 'Resource articles with denormalised author, tag, and category data sourced from partners.';

grant select on resource_articles_public to anon, authenticated;
