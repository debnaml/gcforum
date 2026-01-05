-- Expand the profiles table so it can power the member directory.

alter table profiles
  add column if not exists title text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists location text,
  add column if not exists sector text,
  add column if not exists job_level text,
  add column if not exists linkedin text,
  add column if not exists status text default 'pending',
  add column if not exists show_in_directory boolean default true;
