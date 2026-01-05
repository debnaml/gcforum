-- Allow authenticated members to update their own profile record.

alter table profiles enable row level security;

create policy "members_can_update_own_profile"
  on profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
