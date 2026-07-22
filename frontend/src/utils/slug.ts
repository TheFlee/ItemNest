export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[əÉ™]/g, "e")
    .replace(/[üÜ]/g, "u")
    .replace(/[öÖ]/g, "o")
    .replace(/[ıİ]/g, "i")
    .replace(/[ğĞ]/g, "g")
    .replace(/[şŞ]/g, "s")
    .replace(/[çÇ]/g, "c")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .replace(/^-|-$/g, "");
}

export function toPostSlug(title: string, id: string): string {
  const s = slugify(title);
  return s ? `${s}-${id}` : id;
}

export function extractPostId(slug: string): string {
  const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const match = uuidRegex.exec(slug);
  return match ? match[0] : slug;
}
