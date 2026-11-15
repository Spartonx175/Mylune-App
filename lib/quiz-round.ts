// Picks the questions for one quiz round so she never gets a question again until the whole pool has been used. Pure.

export type RoundQuestion = { id: string };

/** Stable 32-bit hash of an id (FNV-1a), used for a repeatable "random" order and option shuffles. */
export function hashId(id: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Deterministic Fisher-Yates shuffle driven by a seed. */
export function seededShuffle<T>(items: T[], seed: number): T[] {
  const a = [...items];
  let s = seed || 1;
  const next = () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 0x100000000;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * `answered` is the ids she has answered, oldest first (repeats allowed). Returns `size` questions:
 * first the ones never asked, in a stable mixed order; if fewer than `size` remain, the rest are the ones
 * she answered longest ago.
 */
export function pickRound<T extends RoundQuestion>(pool: T[], answered: string[], size = 10): T[] {
  const lastSeen = new Map<string, number>();
  answered.forEach((id, i) => lastSeen.set(id, i));
  const unseen = pool.filter((q) => !lastSeen.has(q.id)).sort((a, b) => hashId(a.id) - hashId(b.id));
  if (unseen.length >= size) return unseen.slice(0, size);
  const seenBefore = pool.filter((q) => lastSeen.has(q.id)).sort((a, b) => lastSeen.get(a.id)! - lastSeen.get(b.id)!);
  return [...unseen, ...seenBefore.slice(0, size - unseen.length)];
}
