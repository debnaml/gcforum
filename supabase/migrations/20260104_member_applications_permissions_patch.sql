-- Ensure all API roles can write to member_applications while RLS policies evaluate access.

grant usage on schema public to anon, authenticated, service_role;

grant select, insert on member_applications to anon, authenticated, service_role;
