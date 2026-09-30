import { formatClock, formatDate, formatDuration, formatMinutes } from "@/app/_lib/format";

describe("formatClock", () => {
  it.each([
    ["08:05:00", "8:05 AM"],
    ["13:05:00", "1:05 PM"],
    ["00:10:00", "12:10 AM"],
    ["12:00:00", "12:00 PM"],
  ])("%s -> %s", (input, expected) => {
    expect(formatClock(input)).toBe(expected);
  });

  it("shows a dash for missing times", () => {
    expect(formatClock(null)).toBe("—");
    expect(formatClock(undefined)).toBe("—");
  });
});

describe("formatMinutes / formatDuration", () => {
  it("pads minutes", () => {
    expect(formatMinutes(485)).toBe("8h 05m");
    expect(formatMinutes(0)).toBe("0h 00m");
  });

  it("formats an overnight shift", () => {
    expect(formatDuration({ time_in: "22:00:00", worked_minutes: 480 })).toBe("8h 00m");
  });

  it("says Still in when timed in but not out", () => {
    expect(formatDuration({ time_in: "08:00:00", worked_minutes: null })).toBe("Still in");
  });

  it("shows a dash with no record", () => {
    expect(formatDuration(null)).toBe("—");
    expect(formatDuration({ time_in: null, worked_minutes: null })).toBe("—");
  });
});

describe("formatDate is timezone-proof", () => {
  it("formats the three trest styles", () => {
    expect(formatDate("2026-09-30", "long")).toBe("Wednesday, 30 September 2026");
    expect(formatDate("2026-09-30", "short")).toBe("Wed, 30 Sep");
    expect(formatDate("2026-01-05", "medium")).toBe("05 Jan 2026");
  });
});
