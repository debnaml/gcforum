import Link from "next/link";
import { getCurrentProfile } from "../../../../lib/auth/getProfile";
import RoleGate from "../../../../components/auth/RoleGate";
import { ROLES } from "../../../../lib/auth/roles";
import { getAdminMembers, ADMIN_MEMBER_STATUS_OPTIONS } from "../../../../lib/data/adminMembers";
import { resetMemberPassword, updateMemberDetails, updateMemberStatus } from "../../actions/memberActions";

export const metadata = {
  title: "Members Admin | GC Forum",
};

const PAGE_SIZE_CHOICES = [10, 25, 50];

const STATUS_BADGES = {
  approved: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  rejected: "bg-red-100 text-red-700",
  suspended: "bg-neutral-300 text-neutral-700",
  closed: "bg-neutral-200 text-neutral-600",
};

function getParamValue(params, key) {
  const value = params?.[key];
  if (Array.isArray(value)) {
    return value[0];
  }
  if (typeof value === "string") {
    return value;
  }
  return undefined;
}

function formatDisplayDate(value) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
  } catch (_error) {
    return value;
  }
}

function buildQueryString(currentParams = {}, overrides = {}) {
  const query = new URLSearchParams();
  Object.entries(currentParams).forEach(([key, value]) => {
    if (typeof value === "undefined" || value === null) {
      return;
    }
    if (Array.isArray(value)) {
      if (value[0]) {
        query.set(key, value[0]);
      }
      return;
    }
    query.set(key, value);
  });

  Object.entries(overrides).forEach(([key, value]) => {
    if (value === null || typeof value === "undefined") {
      query.delete(key);
    } else {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

function statusBadgeClasses(status) {
  return STATUS_BADGES[status] ?? "bg-neutral-200 text-neutral-600";
}

function directoryBadgeClasses(showInDirectory) {
  return showInDirectory ? "bg-slate-100 text-slate-700" : "bg-neutral-200 text-neutral-600";
}

function PaginationButton({ href, children }) {
  const classes = `rounded-full border px-4 py-2 text-sm font-semibold ${href ? "border-primary text-primary" : "border-neutral-200 text-neutral-400"}`;
  if (!href) {
    return (
      <span className={classes} aria-disabled>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}

export default async function AdminMembersPage({ searchParams }) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const pageParam = Number(getParamValue(resolvedSearchParams, "page")) || 1;
  const pageSizeParam = Number(getParamValue(resolvedSearchParams, "pageSize")) || undefined;
  const filterInputs = {
    status: getParamValue(resolvedSearchParams, "status"),
    visibility: getParamValue(resolvedSearchParams, "visibility"),
    sector: getParamValue(resolvedSearchParams, "sector"),
    location: getParamValue(resolvedSearchParams, "location"),
    search: getParamValue(resolvedSearchParams, "search"),
  };

  const [profile, membersPayload] = await Promise.all([
    getCurrentProfile(),
    getAdminMembers({ page: pageParam, pageSize: pageSizeParam, filters: filterInputs }),
  ]);

  const { items: members, pagination, filters, filterOptions } = membersPayload;
  const hasResults = members.length > 0;
  const pageSizeOptions = Array.from(new Set([...PAGE_SIZE_CHOICES, pagination.pageSize])).sort((a, b) => a - b);
  const totalCopy = pagination.totalItems === 1 ? "member" : "members";
  const fromLabel = pagination.totalItems === 0 ? 0 : pagination.from;
  const toLabel = pagination.totalItems === 0 ? 0 : pagination.to;
  const prevHref = pagination.page > 1
    ? `/admin/members${buildQueryString(resolvedSearchParams, { page: pagination.page - 1 })}`
    : null;
  const nextHref = pagination.page < pagination.totalPages
    ? `/admin/members${buildQueryString(resolvedSearchParams, { page: pagination.page + 1 })}`
    : null;

  return (
    <RoleGate role={ROLES.admin} initialRole={profile?.role}>
      <div className="space-y-8">
        <header className="rounded-3xl border border-neutral-200 bg-white p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-primary/60">Members</p>
              <h1 className="text-3xl font-serif text-primary-ink">Manage approved and pending members</h1>
              <p className="text-sm text-neutral-600">
                Use the filters to zero in on specific teams, sectors, or account states. Pagination keeps the list responsive even with hundreds of members.
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-100 bg-soft px-6 py-4 text-sm text-primary-ink">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Total records</p>
              <p className="text-2xl font-semibold text-primary-ink">{pagination.totalItems}</p>
              <p className="text-xs text-neutral-500">{filters.status === "approved" ? "Approved" : "Filtered"} {totalCopy}</p>
            </div>
          </div>
        </header>

        <section className="rounded-3xl border border-neutral-200 bg-white p-6">
          <form method="get" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <input type="hidden" name="page" value="1" />
            <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Search
              <input
                type="search"
                name="search"
                defaultValue={filters.search}
                placeholder="Name, organisation, email"
                className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2"
              />
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Status
              <select
                name="status"
                defaultValue={filters.status}
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2"
              >
                {ADMIN_MEMBER_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Directory
              <select
                name="visibility"
                defaultValue={filters.visibility}
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2"
              >
                {filterOptions.visibility.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Sector
              <select
                name="sector"
                defaultValue={filters.sector}
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2"
              >
                <option value="all">All sectors</option>
                {filterOptions.sectors.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Location
              <select
                name="location"
                defaultValue={filters.location}
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2"
              >
                <option value="all">All locations</option>
                {filterOptions.locations.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Page size
              <select
                name="pageSize"
                defaultValue={pagination.pageSize}
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </select>
            </label>
            <div className="md:col-span-2 lg:col-span-3 xl:col-span-6 flex flex-wrap gap-3">
              <button type="submit" className="rounded-none bg-primary px-5 py-2 text-sm font-semibold text-white">
                Apply filters
              </button>
              <Link href="/admin/members" className="rounded-none border border-neutral-300 px-5 py-2 text-sm font-semibold text-neutral-700">
                Clear all
              </Link>
            </div>
          </form>
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-primary-ink">
                Showing {fromLabel} – {toLabel} of {pagination.totalItems} {totalCopy}
              </p>
              {filters.status !== "all" && (
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Filtered by status: {filters.status}</p>
              )}
            </div>
            <div className="flex gap-2">
              <PaginationButton href={prevHref}>Previous</PaginationButton>
              <PaginationButton href={nextHref}>Next</PaginationButton>
            </div>
          </div>

          {!hasResults ? (
            <div className="mt-6 rounded-2xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-600">
              No members match these filters.
            </div>
          ) : (
            <ul className="mt-6 space-y-6">
              {members.map((member) => (
                <li key={member.id} className="rounded-3xl border border-neutral-100 bg-soft p-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-primary-ink">{member.name || member.email}</p>
                      <p className="text-sm text-neutral-600">{member.title || "Role pending"}</p>
                      <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">{member.organisation || "Organisation pending"}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusBadgeClasses(member.status ?? "pending")}`}>
                        {member.status ?? "pending"}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${directoryBadgeClasses(member.show_in_directory)}`}>
                        {member.show_in_directory ? "Visible" : "Hidden"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/70 bg-white p-4 text-sm text-neutral-700">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Contact</p>
                      <p className="mt-2 font-semibold text-primary-ink">{member.email}</p>
                      {member.phone && <p className="text-xs text-neutral-500">{member.phone}</p>}
                      {member.linkedin && (
                        <p className="mt-2 text-xs text-primary">
                          <a href={member.linkedin} target="_blank" rel="noreferrer noopener" className="underline">
                            LinkedIn profile
                          </a>
                        </p>
                      )}
                    </div>
                    <div className="rounded-2xl border border-white/70 bg-white p-4 text-sm text-neutral-700">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Profile</p>
                      <p className="mt-2">{member.location || "Location unknown"}</p>
                      <p>{member.sector || "Sector pending"}</p>
                      <p>{member.job_level || "Job level pending"}</p>
                    </div>
                    <div className="rounded-2xl border border-white/70 bg-white p-4 text-sm text-neutral-700">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Timeline</p>
                      <p className="mt-2">Joined {formatDisplayDate(member.created_at) || "Date pending"}</p>
                      <p>Updated {member.updated_at ? formatDisplayDate(member.updated_at) : "No updates recorded"}</p>
                    </div>
                  </div>
                  <details className="mt-5 rounded-2xl border border-neutral-200 bg-white p-4">
                    <summary className="cursor-pointer text-sm font-semibold text-primary">Manage member</summary>
                    <div className="mt-4 space-y-6 text-sm text-neutral-700">
                      <form action={updateMemberDetails} className="grid gap-4 md:grid-cols-2">
                        <input type="hidden" name="member_id" value={member.id} />
                        <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                          Full name
                          <input name="name" defaultValue={member.name} className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2" />
                        </label>
                        <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                          Title
                          <input name="title" defaultValue={member.title ?? ""} className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2" />
                        </label>
                        <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                          Organisation
                          <input name="organisation" defaultValue={member.organisation ?? ""} className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2" />
                        </label>
                        <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                          Email
                          <input type="email" name="email" defaultValue={member.email} className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2" />
                        </label>
                        <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                          Phone
                          <input name="phone" defaultValue={member.phone ?? ""} className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2" />
                        </label>
                        <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                          Location
                          <input name="location" defaultValue={member.location ?? ""} className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2" />
                        </label>
                        <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                          Sector
                          <input name="sector" defaultValue={member.sector ?? ""} className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2" />
                        </label>
                        <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                          Job level
                          <input name="job_level" defaultValue={member.job_level ?? member.jobLevel ?? ""} className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2" />
                        </label>
                        <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                          LinkedIn URL
                          <input name="linkedin" defaultValue={member.linkedin ?? ""} className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2" />
                        </label>
                        <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                          Directory listing
                          <div className="mt-1 flex items-center gap-3 text-sm">
                            <input
                              type="checkbox"
                              name="show_in_directory"
                              value="true"
                              defaultChecked={member.show_in_directory ?? true}
                              className="h-5 w-5 rounded border border-neutral-300"
                            />
                            <input type="hidden" name="show_in_directory" value="false" />
                            Show profile in member directory
                          </div>
                        </label>
                        <button type="submit" className="md:col-span-2 rounded-none bg-primary px-4 py-2 font-semibold text-white">
                          Save profile updates
                        </button>
                      </form>

                      <div className="grid gap-4 md:grid-cols-2">
                        <form action={updateMemberStatus} className="rounded-2xl border border-neutral-200 bg-soft p-4">
                          <input type="hidden" name="member_id" value={member.id} />
                          <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                            Membership status
                            <select name="status" defaultValue={member.status ?? "pending"} className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2">
                              {ADMIN_MEMBER_STATUS_OPTIONS.filter((option) => option.value !== "all").map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </label>
                          <button type="submit" className="mt-3 w-full rounded-none border border-primary px-4 py-2 text-sm font-semibold text-primary">
                            Update status
                          </button>
                        </form>
                        <form action={resetMemberPassword} className="rounded-2xl border border-neutral-200 bg-soft p-4">
                          <input type="hidden" name="email" value={member.email} />
                          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Password reset</p>
                          <p className="mt-2 text-sm text-neutral-600">Logs a reset link to the server console.</p>
                          <button type="submit" className="mt-3 w-full rounded-none bg-primary px-4 py-2 text-sm font-semibold text-white">
                            Send reset link
                          </button>
                        </form>
                      </div>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          )}

          {hasResults && (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-100 pt-4 text-sm text-neutral-600">
              <p>
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <PaginationButton href={prevHref}>Previous</PaginationButton>
                <PaginationButton href={nextHref}>Next</PaginationButton>
              </div>
            </div>
          )}
        </section>
      </div>
    </RoleGate>
  );
}
