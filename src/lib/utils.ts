// src/lib/utils.ts

export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .substring(0, 80) + "-" + Date.now().toString(36);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("mr-IN", {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const diffMs    = new Date().getTime() - new Date(date).getTime();
  const diffMins  = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays  = Math.floor(diffHours / 24);

  if (diffMins  < 1)  return "आत्ताच";
  if (diffMins  < 60) return `${diffMins} मिनिटांपूर्वी`;
  if (diffHours < 24) return `${diffHours} तासांपूर्वी`;
  if (diffDays  < 7)  return `${diffDays} दिवसांपूर्वी`;
  return formatDate(date);
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(" ");
}