"use server";

import { checksOrFallback } from "@/lib/content/safe";
import { searchHits } from "@/lib/check-search";
import { sourcesFor, type ClientSource } from "@/lib/check-sources";
import type { CheckItem, CheckKind } from "@/lib/content/check-types";
import type { Locale } from "@/lib/content/types";

const KINDS: CheckKind[] = ["foods", "drinks", "exercise", "medicines"];

export type SearchHit = { item: CheckItem; matched: string };
export type SearchResult = { hits: SearchHit[]; sources: Record<string, ClientSource> };

/**
 * Server-side search: the full lists stay on the server (they hold thousands of items); the phone only receives
 * the few best matches, each with the name that matched. No query is stored or logged.
 */
export async function searchChecks(locale: string, kind: string, query: string): Promise<SearchResult> {
  if (!KINDS.includes(kind as CheckKind) || (locale !== "fr" && locale !== "en")) return { hits: [], sources: {} };
  const q = query.slice(0, 60);
  const { data } = checksOrFallback(locale as Locale, kind as CheckKind);
  const hits = searchHits(data, q, 8).map((h) => ({ item: h.item, matched: h.matched }));
  return { hits, sources: sourcesFor(hits.map((h) => h.item)) };
}
