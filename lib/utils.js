import { format } from "date-fns";

export function formatDate(date, pattern = "dd MMMM yyyy") {
  try {
    return format(new Date(date), pattern);
  } catch (error) {
    return date;
  }
}

export function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function chunkArray(items, size) {
  const result = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}
