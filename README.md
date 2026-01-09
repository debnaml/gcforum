## GC Forum Hub

Next.js (App Router) experience that mirrors the GC Forum mockups. The stack uses:

- **Next.js 16** with the App Router and server components
- **Tailwind CSS v4** for the design system that matches the supplied screens
- **Supabase** for authentication (email/password + optional magic link), Postgres content storage, and dashboard CRUD

Mock data is bundled so the site renders before wiring Supabase. Once environment variables are set, the UI reads and writes live data.

## Quick start

```bash
npm install
cp .env.example .env.local # add Supabase + site values
npm run dev
```

Visit `http://localhost:3000` for the marketing pages. The CMS lives under `/dashboard`, `/dashboard/admin`, and `/dashboard/editor`.

## Environment variables

| Key                             | Purpose                                                  |
| ------------------------------- | -------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                                     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (used by the browser client)             |
| `SUPABASE_SERVICE_ROLE_KEY`     | Service role key (used by server actions for CMS writes) |
| `SUPABASE_JWT_SECRET`           | Optional, required if you plan to verify JWTs manually   |
| `SITE_URL`                      | Absolute site URL for magic-link redirects               |

Without these values the site falls back to the bundled mock content and the dashboard becomes “preview only”.

### Suggested Supabase schema

Create the following tables/views (column names match the code):

- `profiles` – `id (uuid, pk)`, `full_name`, `role` (`member`, `editor`, `admin`), `organisation`, `avatar_url`
- `homepage_content` – single row storing `eyebrow`, `title`, `copy`, `cta_primary_label`, `cta_primary_href`, `cta_secondary_label`, `cta_secondary_href`
- `stats` – `label`, `value`
- `members` – directory profiles (`name`, `title`, `organisation`, `location`, `sector`, `job_level`, `email`, `linkedin`, `avatar`, `status`, `show_in_directory`, `profile_id`)
- `member_applications` – inbound submissions captured from `/join` (personal details, eligibility questions, `topics[]`, `consent_show_directory`, `status`, `reviewer_id`, timestamps)
- `resource_categories` – lookup of `name`, `slug`, `description`
- `resource_articles` – `slug`, `title`, `intro`, `summary`, `content_html`, `tags[]`, `hero_image_url`, `seo_title`, `seo_description`, `published_on`, `category_id`, `featured`
- `resource_article_authors` – join table mapping `article_id` to `partner_id` (team profiles flagged as authors) with `position`
- `events` – `slug`, `title`, `summary`, `description_html`, `format`, `focus_area`, `location_label`, `location_city`, `location_country`, `venue_name`, `is_virtual`, `starts_at`, `ends_at`, `timezone`, `registration_url`, `registration_label`, `cta_label`, `cta_url`, `status`, `featured`, `capacity`, `attendee_count`, `key_takeaways[]`, `hero_image_url`, `seo_*`
- `event_resources` – `event_id` (fk), `title`, `description`, `file_url`, `storage_path`, `file_type`, `file_size_bytes`, `position`
- Event downloads live in the public Supabase Storage bucket `event-resources`, capped at 10 MB per file via `/api/uploads/event-resources`.
- `articles` – `title`, `slug`, `category`, `author`, `date`, `excerpt`, `featured`, `content json`
- `partners` – `name`, `title`, `bio`, `avatar`, `order_index`, `show_on_team` (boolean), `is_author` (boolean)

The admin server actions (`app/(dashboard)/actions/contentActions.js`) expect these tables and will revalidate affected pages after successful writes.

## Available scripts

| Script          | Description                             |
| --------------- | --------------------------------------- |
| `npm run dev`   | Start the Next.js dev server            |
| `npm run build` | Production build                        |
| `npm run start` | Serve the production build              |
| `npm run lint`  | ESLint (Next.js core-web-vitals config) |

## Feature map

- **Marketing pages**: `/`, `/about`, `/join`, `/members`, `/resources`, `/events`, `/articles/[slug]`
- **Auth**: `/login` uses Supabase email/password or magic links, while `/signup` now directs visitors to the curated application and reminds approved members to finish onboarding via their invite email
- **Dashboard**: `/dashboard` (overview), `/dashboard/editor`, `/dashboard/admin` with role gates via Supabase profiles
- **Access control**: only `/` (homepage) plus `/login`/`/signup` are public; everything else is protected by `middleware.js`
- **Design system**: tokens and typography live in `app/globals.css`, reusable components in `components/ui`, cards in `components/cards`
- **Data layer**: `lib/content.js` fetches from Supabase and automatically falls back to `lib/data/mockContent.js` when env vars are missing

## Membership workflow

1. **Apply** – `/join#apply` hosts the full application form. Submissions land in `member_applications` via the `submitMemberApplication` server action and are writeable by anonymous visitors thanks to a scoped Supabase policy.
2. **Review** – `/dashboard/admin` now includes an “Applications” panel. Admins approve or reject entries through the `reviewMemberApplication` action, which (a) stores their decision, (b) invites approved applicants via Supabase Auth, and (c) upserts their `members` record with the proper `profile_id` and `show_in_directory` flag.
3. **Profile & visibility controls** – once approved and signed in, members can visit `/profile` to refresh their portrait and contact details, and `/settings` to toggle the public directory switch. The `updateDirectoryVisibility` action enforces that users can only update the row tied to their `profile_id`.

## Next steps

1. Connect Supabase and run the migrations in `supabase/migrations` so the `member_applications` table, policies, and grants (including anon/service-role INSERT privileges) are applied
2. Seed the tables described above
3. Secure the `/dashboard/*` routes via RLS policies that enforce `profiles.role`
4. Replace the placeholder contact form action with an API route or Supabase function for handling submissions

Feel free to adjust the mock data or add additional sections to keep pace with new design updates.
