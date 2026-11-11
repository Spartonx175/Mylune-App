import { describe, expect, it } from "vitest";
import { computeDating, dateAtSa, addDays } from "../lib/dating";

const ok = (r: ReturnType<typeof computeDating>) => {
  if (!r.ok) throw new Error(`expected ok, got ${r.error}`);
  return r.value;
};

describe("computeDating from DDR (SPEC section 2 reference case)", () => {
  const d = ok(computeDating({ ddr: "2026-10-06", today: "2026-11-11" }));

  it("11 Nov 2026 = 5 SA + 1 day, in the 6th week", () => {
    expect(d.sa).toEqual({ weeks: 5, days: 1 });
    expect(d.weekOrdinal).toBe(6);
    expect(d.source).toBe("ddr");
    expect(d.trimester).toBe(1);
  });
  it("40 SA = 13 Jul 2027 and 41 SA = 20 Jul 2027", () => {
    expect(d.dueDate40).toBe("2027-07-13");
    expect(d.term41).toBe("2027-07-20");
  });
  it("dating scan window = 22 Dec 2026 to 11 Jan 2027", () => {
    expect(d.datingScanWindow).toEqual({ from: "2026-12-22", to: "2027-01-11" });
  });
  it("SG = SA - 2 (never negative)", () => {
    expect(d.sg).toBe(3);
    expect(ok(computeDating({ ddr: "2026-11-05", today: "2026-11-11" })).sg).toBe(0);
  });
});

describe("due date override (dating scan or IVF clinic)", () => {
  it("overrides the DDR: due 7 Jul 2027 gives 6 SA + 0 on 11 Nov 2026", () => {
    const d = ok(computeDating({ ddr: "2026-10-06", dueDateOverride: "2027-07-07", today: "2026-11-11" }));
    expect(d.source).toBe("due_date");
    expect(d.sa).toEqual({ weeks: 6, days: 0 });
    expect(d.dueDate40).toBe("2027-07-07");
    expect(d.term41).toBe("2027-07-14");
    expect(d.ddr).toBe("2026-09-30");
  });
  it("20 Nov 2026 = 7 SA + 2 days with that due date", () => {
    const d = ok(computeDating({ ddr: "2026-10-06", dueDateOverride: "2027-07-07", today: "2026-11-20" }));
    expect(d.sa).toEqual({ weeks: 7, days: 2 });
  });
  it("empty override is ignored", () => {
    const d = ok(computeDating({ ddr: "2026-10-06", dueDateOverride: null, today: "2026-11-11" }));
    expect(d.source).toBe("ddr");
  });
});

describe("boundaries and errors", () => {
  it("day 0 and week rollover", () => {
    expect(ok(computeDating({ ddr: "2026-10-06", today: "2026-10-06" })).sa).toEqual({ weeks: 0, days: 0 });
    expect(ok(computeDating({ ddr: "2026-10-06", today: "2026-10-12" })).sa).toEqual({ weeks: 0, days: 6 });
    expect(ok(computeDating({ ddr: "2026-10-06", today: "2026-10-13" })).sa).toEqual({ weeks: 1, days: 0 });
  });
  it("trimester switches at 14 SA and 28 SA", () => {
    const at = (w: number, day = 0) => ok(computeDating({ ddr: "2026-10-06", today: dateAtSa({ ddr: "2026-10-06" }, w, day) })).trimester;
    expect(at(13, 6)).toBe(1);
    expect(at(14, 0)).toBe(2);
    expect(at(27, 6)).toBe(2);
    expect(at(28, 0)).toBe(3);
  });
  it("term day counts: 40 SA reached on the due date, daysToDue40 = 0", () => {
    const d = ok(computeDating({ ddr: "2026-10-06", today: "2027-07-13" }));
    expect(d.sa).toEqual({ weeks: 40, days: 0 });
    expect(d.daysToDue40).toBe(0);
  });
  it("rejects today before DDR, impossible dates and dates far past term", () => {
    expect(computeDating({ ddr: "2026-10-06", today: "2026-10-05" })).toEqual({ ok: false, error: "before_ddr" });
    expect(computeDating({ ddr: "2026-02-31", today: "2026-11-11" })).toEqual({ ok: false, error: "invalid_date" });
    expect(computeDating({ ddr: "2026-10-06", dueDateOverride: "nope", today: "2026-11-11" })).toEqual({ ok: false, error: "invalid_date" });
    expect(computeDating({ ddr: "2026-10-06", today: "2027-09-01" })).toEqual({ ok: false, error: "too_far" });
  });
  it("handles leap-year February", () => {
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2027-02-28", 1)).toBe("2027-03-01");
  });
  it("dateAtSa returns the calendar date of a given SA", () => {
    expect(dateAtSa({ ddr: "2026-10-06" }, 20, 0)).toBe("2027-02-23");
  });
});
