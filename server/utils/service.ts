import "server-only";

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function serviceCode(value: string): string {
  return slugify(value).replace(/-/g, "_").toUpperCase();
}
