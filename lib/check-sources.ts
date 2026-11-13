import { loadSources } from "./content/load";
import type { CheckItem } from "./content/check-types";

export type ClientSource = { name: string; title: string; url: string };

/** Sources cited by these items, as a small lookup for the browser. */
export function sourcesFor(items: CheckItem[]): Record<string, ClientSource> {
  const cited = new Set(items.flatMap((i) => i.answers.flatMap((a) => a.sources)));
  const out: Record<string, ClientSource> = {};
  for (const s of loadSources().sources) if (cited.has(s.id)) out[s.id] = { name: s.name, title: s.title, url: s.url };
  return out;
}
