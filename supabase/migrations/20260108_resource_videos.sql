-- Resource video schema mirrors article structure but powers video-specific entries
-- that appear inside the Resource Centre alongside written articles.

create table if not exists resource_videos (
	id uuid primary key default gen_random_uuid(),
	slug text not null unique,
	title text not null,
	category_id uuid references resource_categories(id) on delete set null,
	summary text,
	content_html text not null default '<p></p>',
	video_url text not null,
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

comment on table resource_videos is 'YouTube or hosted video content surfaced in the Resource Centre.';
comment on column resource_videos.category_id is 'Links a video to the shared resource_categories table.';
comment on column resource_videos.content_html is 'Rich text description for the video detail page.';

create table if not exists resource_video_authors (
	video_id uuid not null references resource_videos(id) on delete cascade,
	partner_id text not null references partners(id) on delete cascade,
	position int not null default 0,
	primary key (video_id, partner_id)
);

comment on table resource_video_authors is 'Join table linking resource videos to partner authors/presenters.';

create index if not exists resource_videos_published_on_idx on resource_videos (published_on desc);
create index if not exists resource_videos_category_idx on resource_videos (category_id);
create index if not exists resource_video_authors_video_idx on resource_video_authors (video_id, position);

create or replace function touch_resource_videos_updated_at()
returns trigger as $$
begin
	new.updated_at := now();
	return new;
end;
$$ language plpgsql;

drop trigger if exists resource_videos_set_updated on resource_videos;
create trigger resource_videos_set_updated
before update on resource_videos
for each row
execute function touch_resource_videos_updated_at();

create or replace view resource_videos_public as
select
	rv.id,
	rv.slug,
	rv.title,
	rv.summary,
	rv.content_html,
	rv.hero_image_url,
	rv.seo_title,
	rv.seo_description,
	rv.seo_image_url,
	rv.published_on,
	rv.status,
	rv.featured,
	rv.created_at,
	rv.updated_at,
	rv.video_url,
	coalesce(rc.name, 'Uncategorised') as category_name,
	coalesce(rc.slug, 'uncategorised') as category_slug,
	coalesce( (
		select array_agg(rva.partner_id order by rva.position, rva.partner_id)
		from resource_video_authors rva
		where rva.video_id = rv.id
	), '{}'::text[]) as author_ids,
	coalesce( (
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
		) order by rva.position, pr.name)
		from resource_video_authors rva
		join partners pr on pr.id = rva.partner_id
		where rva.video_id = rv.id
	), '[]'::jsonb) as authors,
	'video'::text as type
from resource_videos rv
left join resource_categories rc on rc.id = rv.category_id;

comment on view resource_videos_public is 'Resource videos with denormalised author and category data for public consumption.';

alter table resource_videos enable row level security;
alter table resource_video_authors enable row level security;

drop policy if exists "published videos are readable" on resource_videos;
create policy "published videos are readable"
	on resource_videos
	for select
	using (status = 'published');

drop policy if exists "service role manages videos" on resource_videos;
create policy "service role manages videos"
	on resource_videos
	for all
	using (auth.role() = 'service_role')
	with check (auth.role() = 'service_role');

drop policy if exists "video authors readable when published" on resource_video_authors;
create policy "video authors readable when published"
	on resource_video_authors
	for select
	using (
		exists (
			select 1
			from resource_videos rv
			where rv.id = resource_video_authors.video_id
				and rv.status = 'published'
		)
	);

drop policy if exists "service role manages video authors" on resource_video_authors;
create policy "service role manages video authors"
	on resource_video_authors
	for all
	using (auth.role() = 'service_role')
	with check (auth.role() = 'service_role');

grant select on resource_videos_public to anon, authenticated;
grant select on resource_video_authors to anon, authenticated;

grant all on resource_videos to service_role;
grant all on resource_video_authors to service_role;
