// Search over checker items: accent- and case-insensitive, matches names and synonyms, best match first. Pure.
import type { CheckItem } from "./content/check-types";

export const normalize = (s: string): string =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** 0 = no match. Higher is better: exact name > name starts with > word starts with > contains. */
export function scoreItem(item: Pick<CheckItem, "names" | "active_ingredient">, query: string): number {
  const q = normalize(query);
  if (!q) return 0;
  const names = [...item.names, ...(item.active_ingredient ? [item.active_ingredient] : [])].map(normalize);
  let best = 0;
  names.forEach((n, i) => {
    const bonus = i === 0 ? 1 : 0; // display name beats synonyms
    if (n === q) best = Math.max(best, 100 + bonus);
    else if (n.startsWith(q)) best = Math.max(best, 80 + bonus);
    else if (n.split(" ").some((w) => w.startsWith(q))) best = Math.max(best, 60 + bonus);
    else if (n.includes(q)) best = Math.max(best, 40 + bonus);
    else if (q.split(" ").every((t) => n.includes(t))) best = Math.max(best, 30 + bonus);
  });
  return best;
}

export function searchItems<T extends Pick<CheckItem, "names" | "active_ingredient">>(items: T[], query: string, limit = 8): T[] {
  return items
    .map((item) => ({ item, score: scoreItem(item, query) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.item);
}
