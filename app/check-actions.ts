"use server";

import { checksOrFallback } from "@/lib/content/safe";
import { searchItems } from "@/lib/check-search";
import { sourcesFor, type ClientSource } from "@/lib/check-sources";
import type { CheckItem, CheckKind } from "@/lib/content/check-types";
import type { Locale } from "@/lib/content/types";

const KINDS: CheckKind[] = ["foods", "drinks", "exercise", "medicines"];

export type SearchResult = { items: CheckItem[]; sources: Record<string, ClientSource> };

/**
 * Server-side search: the full lists stay on the server (they hold thousands of items); the phone only receives
 * the few best matches. No query is stored or logged.
 */
export async function searchChecks(locale: string, kind: string, query: string): Promise<SearchResult> {
  if (!KINDS.includes(kind as CheckKind) || (locale !== "fr" && locale !== "en")) return { items: [], sources: {} };
  const q = query.slice(0, 60);
  const { data } = checksOrFallback(locale as Locale, kind as CheckKind);
  const items = searchItems(data, q, 8);
  return { items, sources: sourcesFor(items) };
}
