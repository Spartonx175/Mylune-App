// Content loader: reads Markdown (YAML frontmatter) and YAML files from /content and returns typed, validated objects.
// Server-side only (uses fs). Validation enforces CLAUDE.md health rules:
//  - every statement cites at least one source id that exists in content/sources.yaml,
//  - food "avoid" / "limit" items need at least 2 sources,
//  - every source URL is on the domain allowlist.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { FOOD_CATEGORIES, FOOD_STATES, type CheckItem, type CheckKind } from "./check-types";
import { ContentError, type CalendarEntry, type FoodItem, type Locale, type SourcesFile, type SymptomFile, type WeekFile } from "./types";

const DEFAULT_ROOT = path.join(process.cwd(), "content");

const read = (file: string): string => {
  if (!existsSync(file)) throw new ContentError(`Missing content file: ${file}`);
  return readFileSync(file, "utf8");
};

const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string");

/** Split "---\nyaml\n---\nbody". Throws if there is no frontmatter. */
export function parseFrontmatter(text: string, label: string): { data: Record<string, unknown>; body: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text);
  if (!m) throw new ContentError(`${label}: missing frontmatter`);
  const data = parse(m[1]);
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new ContentError(`${label}: frontmatter is not a mapping`);
  return { data: data as Record<string, unknown>, body: m[2].trim() };
}

const hostOf = (url: string): string | null => {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
};

export function loadSources(root = DEFAULT_ROOT): SourcesFile {
  const raw = parse(read(path.join(root, "sources.yaml"))) as Partial<SourcesFile> | null;
  if (!raw || !isStringArray(raw.allowed_domains) || !Array.isArray(raw.sources)) {
    throw new ContentError("sources.yaml: needs allowed_domains[] and sources[]");
  }
  const ids = new Set<string>();
  for (const s of raw.sources) {
    if (!s.id || !s.name || !s.url || !s.title || !s.accessed) throw new ContentError(`sources.yaml: incomplete source ${s.id ?? "?"}`);
    if (ids.has(s.id)) throw new ContentError(`sources.yaml: duplicate id ${s.id}`);
    ids.add(s.id);
    const host = hostOf(s.url);
    const allowed = host !== null && raw.allowed_domains.some((d) => host === d || host.endsWith(`.${d}`));
    if (!allowed) throw new ContentError(`sources.yaml: ${s.id} is not on the allowed domain list (${s.url})`);
  }
  return { allowed_domains: raw.allowed_domains, sources: raw.sources };
}

function checkSources(ids: unknown, known: Set<string>, label: string, min = 1): string[] {
  if (!isStringArray(ids) || ids.length < min) throw new ContentError(`${label}: needs at least ${min} source id(s)`);
  for (const id of ids) if (!known.has(id)) throw new ContentError(`${label}: unknown source id "${id}"`);
  return ids;
}

export function loadWeek(locale: Locale, sa: number, root = DEFAULT_ROOT): WeekFile {
  const name = `w${String(sa).padStart(2, "0")}`;
  const label = `${locale}/weeks/${name}.md`;
  const { data, body } = parseFrontmatter(read(path.join(root, locale, "weeks", `${name}.md`)), label);
  const known = new Set(loadSources(root).sources.map((s) => s.id));

  if (data.week_sa !== sa) throw new ContentError(`${label}: week_sa must be ${sa}`);
  for (const k of ["baby", "mother", "todo", "tip_of_day"] as const) {
    if (!isStringArray(data[k])) throw new ContentError(`${label}: ${k} must be a list of strings`);
  }
  if ((data.tip_of_day as string[]).length !== 7) throw new ContentError(`${label}: tip_of_day needs exactly 7 tips`);
  if (typeof data.size_compare !== "string" || typeof data.illustration !== "string" || typeof data.reviewed !== "string" || typeof data.length_mm !== "number") {
    throw new ContentError(`${label}: size_compare, length_mm, illustration and reviewed are required`);
  }
  return {
    week_sa: sa,
    size_compare: data.size_compare,
    length_mm: data.length_mm,
    illustration: data.illustration,
    baby: data.baby as string[],
    mother: data.mother as string[],
    todo: data.todo as string[],
    tip_of_day: data.tip_of_day as string[],
    sources: checkSources(data.sources, known, label),
    reviewed: data.reviewed,
    body,
  };
}

/** SA numbers that have a week file for this locale, ascending. */
export function listWeeks(locale: Locale, root = DEFAULT_ROOT): number[] {
  const dir = path.join(root, locale, "weeks");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .map((f) => /^w(\d{2})\.md$/.exec(f))
    .filter((m): m is RegExpExecArray => m !== null)
    .map((m) => Number(m[1]))
    .sort((a, b) => a - b);
}

export function loadFood(locale: Locale, root = DEFAULT_ROOT): FoodItem[] {
  const label = `${locale}/food/items.yaml`;
  const list = parse(read(path.join(root, locale, "food", "items.yaml"))) as unknown;
  if (!Array.isArray(list)) throw new ContentError(`${label}: must be a list`);
  const known = new Set(loadSources(root).sources.map((s) => s.id));
  const seen = new Set<string>();
  return (list as FoodItem[]).map((item) => {
    const l = `${label}#${item.id ?? "?"}`;
    if (!item.id || seen.has(item.id)) throw new ContentError(`${l}: missing or duplicate id`);
    seen.add(item.id);
    if (!["eat", "limit", "avoid"].includes(item.status)) throw new ContentError(`${l}: status must be eat, limit or avoid`);
    if (!item.why_fr || !item.why_en) throw new ContentError(`${l}: why_fr and why_en are required`);
    // Food-avoid content needs at least 2 sources (CLAUDE.md); "limit" is held to the same bar.
    checkSources(item.sources, known, l, item.status === "eat" ? 1 : 2);
    return item;
  });
}

/** Keep items whose conditions are all active for this user (no conditions = shown to everyone). */
export function foodFor(items: FoodItem[], activeConditions: string[]): FoodItem[] {
  return items.filter((i) => !i.conditions?.length || i.conditions.every((c) => activeConditions.includes(c)));
}

/** CLAUDE.md: no medication doses. Rejects numbers followed by a dosage unit. */
const DOSE = /\b\d+([.,]\d+)?\s?(mg|g|ml|mcg|µg|ug|iu|ui|micrograms?|milligrams?)\b/i;
const noDose = (text: string, label: string): void => {
  if (DOSE.test(text)) throw new ContentError(`${label}: contains what looks like a dose`);
};

export function loadSymptom(locale: Locale, id: string, root = DEFAULT_ROOT): SymptomFile {
  const label = `${locale}/symptoms/${id}.md`;
  const { data, body } = parseFrontmatter(read(path.join(root, locale, "symptoms", `${id}.md`)), label);
  const known = new Set(loadSources(root).sources.map((s) => s.id));
  if (data.id !== id) throw new ContentError(`${label}: id must be "${id}"`);
  if (typeof data.title !== "string" || typeof data.reviewed !== "string") throw new ContentError(`${label}: title and reviewed are required`);
  if (!isStringArray(data.see_a_professional_if) || data.see_a_professional_if.length === 0) {
    throw new ContentError(`${label}: see_a_professional_if must be a non-empty list of strings`);
  }
  if (!body) throw new ContentError(`${label}: body is empty`);
  noDose([body, ...data.see_a_professional_if].join(" "), label);
  // Symptom content is held to the 2-source bar.
  return {
    id,
    title: data.title,
    sources: checkSources(data.sources, known, label, 2),
    reviewed: data.reviewed,
    see_a_professional_if: data.see_a_professional_if,
    body,
  };
}

/** Symptom ids that have a file for this locale, alphabetical. */
export function listSymptoms(locale: Locale, root = DEFAULT_ROOT): string[] {
  const dir = path.join(root, locale, "symptoms");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.slice(0, -3))
    .sort();
}

export function loadCalendar(locale: Locale, root = DEFAULT_ROOT): CalendarEntry[] {
  const label = `${locale}/calendar/fr-followup.yaml`;
  const list = parse(read(path.join(root, locale, "calendar", "fr-followup.yaml"))) as unknown;
  if (!Array.isArray(list)) throw new ContentError(`${label}: must be a list`);
  const known = new Set(loadSources(root).sources.map((s) => s.id));
  const seen = new Set<string>();
  const sorted = [...(list as CalendarEntry[])].sort((a, b) => a.sa_from - b.sa_from);
  return sorted.map((e) => {
    const l = `${label}#${e.id ?? "?"}`;
    if (!e.id || seen.has(e.id)) throw new ContentError(`${l}: missing or duplicate id`);
    seen.add(e.id);
    if (!Number.isInteger(e.sa_from) || !Number.isInteger(e.sa_to) || e.sa_from < 0 || e.sa_to < e.sa_from) {
      throw new ContentError(`${l}: sa_from and sa_to must be integers with sa_from <= sa_to`);
    }
    if (typeof e.title !== "string" || typeof e.description !== "string" || !e.title || !e.description) {
      throw new ContentError(`${l}: title and description are required`);
    }
    if (e.unverified !== undefined && typeof e.unverified !== "boolean") throw new ContentError(`${l}: unverified must be a boolean`);
    noDose(`${e.title} ${e.description}`, l);
    // Unverified entries may cite nothing; verified ones need at least one known source.
    if (e.unverified === true && (!e.sources || e.sources.length === 0)) return { ...e, sources: [] };
    checkSources(e.sources, known, l);
    return e;
  });
}

/** "Can I?" checker: content/{locale}/check/{kind}.yaml, a list of CheckItem (see check-types.ts). */
export function loadChecks(locale: Locale, kind: CheckKind, root = DEFAULT_ROOT): CheckItem[] {
  const label = `${locale}/check/${kind}.yaml`;
  const list = parse(read(path.join(root, locale, "check", `${kind}.yaml`))) as unknown;
  if (!Array.isArray(list)) throw new ContentError(`${label}: must be a list`);
  const known = new Set(loadSources(root).sources.map((s) => s.id));
  const seen = new Set<string>();
  const verdicts: readonly string[] = ["ok", "careful", "avoid"];
  const states: readonly string[] = FOOD_STATES;
  const categories: readonly string[] = FOOD_CATEGORIES;
  return (list as CheckItem[]).map((item) => {
    const l = `${label}#${item?.id ?? "?"}`;
    if (!item?.id || typeof item.id !== "string" || seen.has(item.id)) throw new ContentError(`${l}: missing or duplicate id`);
    seen.add(item.id);
    if (kind === "foods" && !categories.includes(item.category)) throw new ContentError(`${l}: unknown category "${item.category}"`);
    if (!item.category) throw new ContentError(`${l}: category is required`);
    if (!isStringArray(item.names) || item.names.length === 0 || item.names.some((n) => !n.trim())) throw new ContentError(`${l}: names must be a non-empty list of strings`);
    if (typeof item.reviewed !== "string" || !item.reviewed) throw new ContentError(`${l}: reviewed is required`);
    if (!Array.isArray(item.answers) || item.answers.length === 0) throw new ContentError(`${l}: needs at least one answer`);
    if (item.tips && !item.tips.every((t) => t === "best" || t === "avoid")) throw new ContentError(`${l}: tips must be best or avoid`);
    const seenStates = new Set<string>();
    for (const ans of item.answers) {
      const al = `${l}/${ans?.state ?? "?"}`;
      if (!states.includes(ans.state)) throw new ContentError(`${al}: unknown state`);
      if (seenStates.has(ans.state)) throw new ContentError(`${al}: duplicate state`);
      seenStates.add(ans.state);
      if (!verdicts.includes(ans.verdict)) throw new ContentError(`${al}: verdict must be ok, careful or avoid`);
      if (typeof ans.why !== "string" || !ans.why.trim()) throw new ContentError(`${al}: why is required`);
      noDose(ans.why, al);
      // Same bar as food: avoid and careful need 2 sources, ok needs 1.
      checkSources(ans.sources, known, al, ans.verdict === "ok" ? 1 : 2);
    }
    return item;
  });
}
