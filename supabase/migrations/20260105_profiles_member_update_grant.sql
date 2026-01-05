-- Allow authenticated users to call UPDATE on their own profile rows.

grant update on profiles to authenticated;
