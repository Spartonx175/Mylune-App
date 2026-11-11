import { describe, expect, it } from "vitest";
import { parseOnboarding, todayInParis } from "../lib/onboarding";

const base = { locale: "fr", ddr: "2026-10-06", dueDateOverride: "", maternityName: "", maternityPhone: "" };
const today = "2026-11-11";

describe("parseOnboarding", () => {
  it("accepts a valid DDR and nulls empty optionals", () => {
    expect(parseOnboarding(base, today)).toEqual({
      ok: true,
      value: { locale: "fr", ddr: "2026-10-06", dueDateOverride: null, maternityName: null, maternityPhone: null },
    });
  });
  it("accepts today as DDR", () => expect(parseOnboarding({ ...base, ddr: today }, today).ok).toBe(true));
  it("rejects a future DDR", () => {
    expect(parseOnboarding({ ...base, ddr: "2026-11-12" }, today)).toEqual({ ok: false, errors: { ddr: "future" } });
  });
  it("rejects a DDR over 300 days old", () => {
    expect(parseOnboarding({ ...base, ddr: "2025-12-01" }, today)).toEqual({ ok: false, errors: { ddr: "old" } });
  });
  it("rejects missing or impossible dates", () => {
    expect(parseOnboarding({ ...base, ddr: "" }, today)).toEqual({ ok: false, errors: { ddr: "required" } });
    expect(parseOnboarding({ ...base, ddr: "2026-02-31" }, today)).toEqual({ ok: false, errors: { ddr: "required" } });
  });
  it("validates the optional scan due date window", () => {
    expect(parseOnboarding({ ...base, dueDateOverride: "2027-07-13" }, today).ok).toBe(true);
    expect(parseOnboarding({ ...base, dueDateOverride: "2020-01-01" }, today)).toEqual({ ok: false, errors: { due: "invalid" } });
  });
  it("falls back to fr for unknown locales and trims text", () => {
    const r = parseOnboarding({ ...base, locale: "de", maternityName: "  Béclère ", maternityPhone: " " }, today);
    expect(r.ok && r.value).toMatchObject({ locale: "fr", maternityName: "Béclère", maternityPhone: null });
  });
});

describe("todayInParis", () => {
  it("uses the Paris calendar day", () => {
    expect(todayInParis(new Date("2026-11-11T23:30:00Z"))).toBe("2026-11-12");
  });
});
