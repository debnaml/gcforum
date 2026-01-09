-- Events schema and storage for GC Forum
-- Adds events with downloadable resources stored in Supabase Storage

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text,
  description_html text default ''::text,
  agenda_html text,
  hero_image_url text,
  hero_image_alt text,
  format text not null default 'roundtable',
  focus_area text,
  location_label text,
  location_city text,
  location_region text,
  location_country text,
  venue_name text,
  is_virtual boolean not null default false,
  starts_at timestamptz not null,
  ends_at timestamptz,
  timezone text not null default 'Europe/London',
  registration_url text,
  registration_label text default 'Register',
  cta_label text default 'Add to calendar',
  cta_url text,
  external_partner text,
  status text not null default 'draft',
  featured boolean not null default false,
  capacity int not null default 0,
  attendee_count int not null default 0,
  key_takeaways text[] not null default '{}',
  seo_title text,
  seo_description text,
  seo_image_url text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  occurs_on date generated always as ((starts_at at time zone 'utc')::date) stored,
  constraint events_status_check check (status in ('draft', 'published')),
  constraint events_capacity_check check (capacity >= 0),
  constraint events_attendee_count_check check (attendee_count >= 0)
);

comment on table events is 'GC Forum programme of events (roundtables, breakfasts, summit sessions).';
comment on column events.slug is 'Stable slug powering /events/[slug].';
comment on column events.description_html is 'Rich HTML description used on the detail page.';
comment on column events.key_takeaways is 'Bullet-friendly highlights rendered near the CTA.';

create index if not exists events_slug_idx on events (slug);
create index if not exists events_starts_at_idx on events (starts_at desc);
create index if not exists events_status_idx on events (status, starts_at desc);

create or replace function touch_events_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists events_set_updated on events;
create trigger events_set_updated
before update on events
for each row
execute function touch_events_updated_at();

create table if not exists event_resources (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  title text not null,
  description text,
  file_url text not null,
  storage_path text not null,
  file_type text,
  file_size_bytes bigint,
  position int not null default 0,
  created_at timestamptz not null default now()
);

comment on table event_resources is 'Downloadable materials (agenda, slides, toolkits) attached to an event.';

create index if not exists event_resources_event_idx on event_resources (event_id, position);

create or replace view events_public as
select
  e.id,
  e.slug,
  e.title,
  e.summary,
  e.description_html,
  e.agenda_html,
  e.hero_image_url,
  e.hero_image_alt,
  e.format,
  e.focus_area,
  e.location_label,
  e.location_city,
  e.location_region,
  e.location_country,
  e.venue_name,
  e.is_virtual,
  e.starts_at,
  e.ends_at,
  e.timezone,
  e.registration_url,
  e.registration_label,
  e.cta_label,
  e.cta_url,
  e.external_partner,
  e.status,
  e.featured,
  e.capacity,
  e.attendee_count,
  e.key_takeaways,
  e.seo_title,
  e.seo_description,
  e.seo_image_url,
  e.published_at,
  e.created_at,
  e.updated_at,
  e.occurs_on,
  (case
    when e.ends_at is not null then e.ends_at < now()
    else e.starts_at < now()
  end) as is_past,
  (case when e.starts_at >= now() then true else false end) as is_upcoming,
  coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', er.id,
      'title', er.title,
      'description', er.description,
      'file_url', er.file_url,
      'file_type', er.file_type,
      'file_size_bytes', er.file_size_bytes,
      'storage_path', er.storage_path,
      'position', er.position,
      'created_at', er.created_at
    ) order by er.position, er.created_at)
    from event_resources er
    where er.event_id = e.id
  ), '[]'::jsonb) as resources,
  coalesce((
    select count(*)::int
    from event_resources er
    where er.event_id = e.id
  ), 0) as resource_count
from events e
where e.status = 'published';

comment on view events_public is 'Published events with denormalised resource metadata and computed flags.';

alter table events enable row level security;
alter table event_resources enable row level security;

drop policy if exists "published events are readable" on events;
create policy "published events are readable"
  on events
  for select
  using (status = 'published');

drop policy if exists "service role manages events" on events;
create policy "service role manages events"
  on events
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "published event resources are readable" on event_resources;
create policy "published event resources are readable"
  on event_resources
  for select
  using (
    exists (
      select 1
      from events e
      where e.id = event_resources.event_id
        and e.status = 'published'
    )
  );

drop policy if exists "service role manages event resources" on event_resources;
create policy "service role manages event resources"
  on event_resources
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

grant select on events_public to anon, authenticated;
grant select on event_resources to anon, authenticated;

grant all on events to service_role;
grant all on event_resources to service_role;

drop view if exists events_admin_view;
create view events_admin_view as
select
  e.*,
  coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', er.id,
      'title', er.title,
      'description', er.description,
      'file_url', er.file_url,
      'file_type', er.file_type,
      'file_size_bytes', er.file_size_bytes,
      'storage_path', er.storage_path,
      'position', er.position,
      'created_at', er.created_at
    ) order by er.position, er.created_at)
    from event_resources er
    where er.event_id = e.id
  ), '[]'::jsonb) as resources
from events e;

grant select on events_admin_view to service_role;

