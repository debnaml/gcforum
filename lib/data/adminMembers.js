import { hasServiceRoleAccess } from "../env";
import { getServerClient, getServiceRoleClient } from "../supabase/serverClient";
import { mapProfileToMember } from "../content";

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;
const DEFAULT_FILTERS = {
  status: "approved",
  visibility: "all",
  sector: "all",
  location: "all",
  search: "",
};

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
  { value: "suspended", label: "Suspended" },
  { value: "closed", label: "Closed" },
];

const VISIBILITY_OPTIONS = [
  { value: "all", label: "Directory visibility" },
  { value: "visible", label: "Visible in directory" },
  { value: "hidden", label: "Hidden from directory" },
];

function clampPageSize(value) {
  if (!Number.isFinite(value) || value <= 0) {
    return DEFAULT_PAGE_SIZE;
  }
  return Math.min(Math.max(5, Math.floor(value)), MAX_PAGE_SIZE);
}

async function getPrivilegedClient() {
  if (hasServiceRoleAccess) {
    const serviceClient = getServiceRoleClient();
    if (serviceClient) {
      return serviceClient;
    }
  }
  return getServerClient();
}

function sanitizeSearchTerm(rawSearch) {
  if (typeof rawSearch !== "string") {
    return "";
  }
  return rawSearch.trim().replace(/[%]/g, "\\%").replace(/,/g, " ");
}

function normalizeFilters(filters = {}) {
  return {
    status: filters.status && typeof filters.status === "string" ? filters.status : DEFAULT_FILTERS.status,
    visibility: filters.visibility && typeof filters.visibility === "string" ? filters.visibility : DEFAULT_FILTERS.visibility,
    sector: filters.sector && typeof filters.sector === "string" ? filters.sector : DEFAULT_FILTERS.sector,
    location: filters.location && typeof filters.location === "string" ? filters.location : DEFAULT_FILTERS.location,
    search: typeof filters.search === "string" ? filters.search.trim() : DEFAULT_FILTERS.search,
  };
}

function buildPagination(page, pageSize, totalItems) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(totalItems, currentPage * pageSize);
  return {
    page: currentPage,
    pageSize,
    totalItems,
    totalPages,
    from,
    to,
  };
}

function toFilterOptions(values = []) {
  return values
    .filter(Boolean)
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .filter((value, index, arr) => arr.indexOf(value) === index)
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ value, label: value }));
}

async function getFacetOptions(client) {
  if (!client) {
    return { sectors: [], locations: [] };
  }

  try {
    const [{ data: sectorRows }, { data: locationRows }] = await Promise.all([
      client.from("profiles").select("sector").not("sector", "is", null).limit(1000),
      client.from("profiles").select("location").not("location", "is", null).limit(1000),
    ]);

    const sectors = toFilterOptions((sectorRows ?? []).map((row) => row.sector ?? ""));
    const locations = toFilterOptions((locationRows ?? []).map((row) => row.location ?? ""));
    return { sectors, locations };
  } catch (error) {
    console.warn("Failed to fetch member facet options", error?.message);
    return { sectors: [], locations: [] };
  }
}

function emptyResult(filters) {
  return {
    items: [],
    pagination: buildPagination(1, DEFAULT_PAGE_SIZE, 0),
    filters,
    filterOptions: {
      statuses: STATUS_OPTIONS,
      visibility: VISIBILITY_OPTIONS,
      sectors: [],
      locations: [],
    },
  };
}

export async function getAdminMembers({ page = 1, pageSize: pageSizeInput, filters: rawFilters = {} } = {}) {
  const filters = normalizeFilters(rawFilters);
  const pageSize = clampPageSize(Number(pageSizeInput) || DEFAULT_PAGE_SIZE);
  const client = await getPrivilegedClient();

  if (!client) {
    return emptyResult(filters);
  }

  const currentPage = Math.max(1, Number(page) || 1);
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = client
    .from("profiles")
    .select(
      "id, full_name, title, organisation, email, phone, linkedin, location, sector, job_level, status, show_in_directory, avatar_url, created_at",
      { count: "exact" },
    );

  if (filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.visibility === "visible") {
    query = query.eq("show_in_directory", true);
  } else if (filters.visibility === "hidden") {
    query = query.eq("show_in_directory", false);
  }

  if (filters.sector !== "all") {
    query = query.eq("sector", filters.sector);
  }

  if (filters.location !== "all") {
    query = query.eq("location", filters.location);
  }

  const sanitizedSearch = sanitizeSearchTerm(filters.search);
  if (sanitizedSearch) {
    const term = sanitizedSearch;
    const orFilters = ["full_name", "organisation", "email"].map((column) => `${column}.ilike.%${term}%`).join(",");
    query = query.or(orFilters);
  }

  const { data, error, count } = await query.order("full_name", { ascending: true }).range(from, to);

  if (error) {
    console.error("Failed to load admin members", error.message);
    return emptyResult(filters);
  }

  const items = Array.isArray(data) ? data.map((row) => mapProfileToMember(row)).filter(Boolean) : [];
  const totalItems = typeof count === "number" ? count : items.length;
  const pagination = buildPagination(currentPage, pageSize, totalItems);

  const { sectors, locations } = await getFacetOptions(client);

  return {
    items,
    pagination,
    filters,
    filterOptions: {
      statuses: STATUS_OPTIONS,
      visibility: VISIBILITY_OPTIONS,
      sectors,
      locations,
    },
  };
}

export const ADMIN_MEMBER_STATUS_OPTIONS = STATUS_OPTIONS;
