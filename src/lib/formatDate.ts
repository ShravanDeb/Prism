export function formatDate(date: string | null | undefined): string | null {
  if (!date) return null;
  const d = new Date(date);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }
  return date;
}
