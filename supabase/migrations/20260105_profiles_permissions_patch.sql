-- Ensure service-role operations during application approvals can manage profiles.

grant usage on schema public to service_role;

grant select, insert, update on profiles to service_role;
