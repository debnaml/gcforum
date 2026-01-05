-- Capture inbound member applications and link approved users to the member directory.

create table if not exists member_applications (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  linkedin_url text,
  location text,
  "current_role" text,
  organisation text,
  sector text,
  team_size text,
  responsibility text,
  topics text[] not null default '{}'::text[],
  consent_show_directory boolean not null default true,
  privacy_accepted boolean not null default false,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewer_id uuid references auth.users(id),
  reviewer_notes text,
  reviewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table member_applications is 'Prospective member applications with eligibility responses and admin decisions.';
comment on column member_applications.topics is 'Array of selected areas of interest.';
comment on column member_applications.consent_show_directory is 'Whether the applicant consents to appearing in the public directory.';
comment on column member_applications.privacy_accepted is 'Applicant confirmed agreement to the privacy policy.';

create index if not exists member_applications_status_idx on member_applications(status);
create index if not exists member_applications_created_at_idx on member_applications(created_at desc);

create or replace function public.set_member_applications_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists member_applications_touch_updated_at on member_applications;
create trigger member_applications_touch_updated_at
before update on member_applications
for each row execute function public.set_member_applications_updated_at();

alter table member_applications enable row level security;

drop policy if exists "public_insert_member_applications" on member_applications;
create policy "public_insert_member_applications"
  on member_applications
  for insert
  to anon, authenticated
  with check (true);

-- Allow authenticated users (such as admins) to read their own applications if needed.
drop policy if exists "applicants_can_read_their_application" on member_applications;
create policy "applicants_can_read_their_application"
  on member_applications
  for select
  to authenticated
  using (
    auth.uid() = reviewer_id
    or lower(auth.jwt()->>'email') = lower(email)
  );

-- Extend members table with privacy controls and profile linkage when present.
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'members'
  ) then
    alter table members
      add column if not exists show_in_directory boolean not null default true,
      add column if not exists profile_id uuid references profiles(id);

    comment on column members.show_in_directory is 'Controls whether the member is listed in the public directory.';
    comment on column members.profile_id is 'Links the member record to the authenticated profile so they can self-manage preferences.';

    perform 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'members_profile_id_key';

    if not found then
      create unique index members_profile_id_key on members(profile_id) where profile_id is not null;
    end if;

    update members
      set show_in_directory = true
      where show_in_directory is null;

    drop policy if exists "members_update_visibility" on members;
    create policy "members_update_visibility"
      on members
      for update
      to authenticated
      using (auth.uid() = profile_id)
      with check (auth.uid() = profile_id);
  end if;
end $$;
