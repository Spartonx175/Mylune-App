// Search over checker items. Pure. Accent- and case-insensitive, tolerant of typos, plurals and filler words,
// matches every name and synonym, and reports WHICH name matched so the screen can show what she typed.
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

/** Words that carry no meaning for matching ("fromage de chèvre" and "chèvre" should find the same thing). */
const STOPWORDS = new Set(["de", "du", "des", "la", "le", "les", "l", "d", "au", "aux", "a", "un", "une", "en", "et", "the", "of", "and", "with", "or", "my", "some", "est", "ce", "que"]);

/** Category words that only describe the kind of thing ("feta cheese", "iron tablets"): ignored when other words remain. */
const GENERIC = new Set(["cheese", "fromage", "tablet", "tablets", "pill", "pills", "capsule", "capsules", "comprime", "comprimes", "gelule", "gelules", "medicine", "medication", "medicament", "drug", "drink", "boisson", "food", "aliment", "supplement", "complement"]);

/** Light singular form: eggs -> egg, oeufs -> oeuf, tomates -> tomate, noix stays. */
const stem = (w: string): string => (w.length > 3 && /[sx]$/.test(w) && !/(ss|us|is)$/.test(w) && w !== "noix" ? w.slice(0, -1) : w);

const tokens = (s: string): string[] => normalize(s).split(" ").filter(Boolean);

/** Query tokens after dropping filler words and singularising. Falls back to all tokens if nothing is left. */
export function queryTokens(query: string): string[] {
  const all = tokens(query);
  const kept = all.filter((t) => !STOPWORDS.has(t));
  const specific = kept.filter((t) => !GENERIC.has(t));
  return (specific.length ? specific : kept.length ? kept : all).map(stem);
}

/** Damerau-Levenshtein distance (adjacent swaps count as one edit), early exit above `max`. */
export function editDistance(a: string, b: string, max = 2): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

/** Allowed typos for a word of this length: none for short words, 1 for medium, 2 for long. */
const maxTypos = (len: number): number => (len >= 7 ? 2 : len >= 5 ? 1 : 0);

/** 0 = no match. Exact > starts with > word starts with > contains > typo. `bonus` favours the display name. */
function scoreName(name: string, qTokens: string[], qNorm: string, bonus: number): number {
  const n = normalize(name);
  if (!n) return 0;
  if (n === qNorm) return 100 + bonus;
  const nTokens = n.split(" ").map(stem);
  // Shorter, closer names win ties: "Mozzarella" beats "Mozzarella sticks" for the query "mozzarella".
  const extra = Math.min(9, Math.max(0, nTokens.length - qTokens.length));
  const raw = rawScore(nTokens, qTokens, bonus);
  if (raw === 0) return 0;
  return raw < 98 ? Math.max(1, raw - extra) : raw;
}

function rawScore(nTokens: string[], qTokens: string[], bonus: number): number {
  const nStemmed = nTokens.join(" ");
  const qStemmed = qTokens.join(" ");
  if (nStemmed === qStemmed) return 98 + bonus;
  if (nStemmed.startsWith(qStemmed)) return 80 + bonus;
  if (nTokens.some((w) => w.startsWith(qStemmed))) return 60 + bonus;
  if (nStemmed.includes(qStemmed)) return 45 + bonus;
  // Every query word appears (as a word start) somewhere in the name, in any order.
  if (qTokens.every((q) => nTokens.some((w) => w.startsWith(q)))) return 50 + bonus;
  // Typos: every query word is within the allowed edits of some word of the name.
  if (
    qTokens.every((q) =>
      nTokens.some((w) => {
        const tol = maxTypos(q.length);
        if (tol === 0 || Math.abs(q.length - w.length) > tol + 1) return false;
        // Typo anywhere in the word, or in the start of a longer word ("camamb" for "camembert").
        return editDistance(q, w, tol) <= tol || (w.length > q.length && editDistance(q, w.slice(0, q.length), tol) <= tol);
      }),
    )
  )
    return 30 + bonus;
  return 0;
}

export type Hit<T> = { item: T; matched: string; score: number };

type Searchable = Pick<CheckItem, "names" | "active_ingredient">;

/** Best score for an item and the name that earned it. */
export function matchItem(item: Searchable, query: string): { score: number; matched: string } {
  const qNorm = normalize(query);
  if (!qNorm) return { score: 0, matched: "" };
  const qTokens = queryTokens(query);
  const names = [...item.names, ...(item.active_ingredient ? [item.active_ingredient] : [])];
  let best = { score: 0, matched: item.names[0] ?? "" };
  names.forEach((name, i) => {
    const s = scoreName(name, qTokens, qNorm, i === 0 ? 1 : 0);
    if (s > best.score) best = { score: s, matched: name };
  });
  return best;
}

export const scoreItem = (item: Searchable, query: string): number => matchItem(item, query).score;

export function searchHits<T extends Searchable>(items: T[], query: string, limit = 8): Hit<T>[] {
  const all = items
    .map((item) => ({ item, ...matchItem(item, query) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
  // Typo guesses (score below 45) are only shown when nothing matches properly: "burrata" must not list "burrito".
  const real = all.filter((r) => r.score >= 45);
  return (real.length > 0 ? real : all).slice(0, limit);
}

export function searchItems<T extends Searchable>(items: T[], query: string, limit = 8): T[] {
  return searchHits(items, query, limit).map((h) => h.item);
}
