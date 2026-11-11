// Typed shapes of the content files (SPEC section 7). Content = files in /content/{en,fr}; no runtime LLM.

export type Locale = "fr" | "en";

export type Source = {
  id: string;
  /** Publisher, e.g. "ameli". */
  name: string;
  /** Page cited. Its domain must be on the allowlist in content/sources.yaml. */
  url: string;
  title: string;
  /** ISO date the page was read when the content was written. */
  accessed: string;
};

export type SourcesFile = {
  /** Domains allowed without Div's approval (SPEC section 7). Subdomains match. */
  allowed_domains: string[];
  sources: Source[];
};

export type WeekFile = {
  week_sa: number;
  size_compare: string;
  length_mm: number;
  illustration: string;
  baby: string[];
  mother: string[];
  todo: string[];
  tip_of_day: string[];
  sources: string[];
  reviewed: string;
  /** Markdown body after the frontmatter. */
  body: string;
};

export type FoodStatus = "eat" | "limit" | "avoid";

export type FoodItem = {
  id: string;
  status: FoodStatus;
  /** e.g. ["toxo_non_immune"]. Empty or absent = applies to everyone. */
  conditions?: string[];
  why_fr: string;
  why_en: string;
  sources: string[];
};

export class ContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentError";
  }
}
