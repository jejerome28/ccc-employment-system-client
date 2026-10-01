import {
  formatClock,
  formatDate,
  formatDuration,
  formatMinutes,
  manilaToUtcIso,
  thisMonthManila,
  toClockInput,
  todayManila,
} from "@/app/_lib/format";

describe("formatClock shows Manila time for a UTC instant", () => {
  it.each([
    ["2026-06-21T23:04:14Z", "7:04 AM"],
    ["2026-09-30T05:05:00Z", "1:05 PM"],
    ["2026-09-29T16:10:00Z", "12:10 AM"],
    ["2026-09-30T04:00:00Z", "12:00 PM"],
  ])("%s -> %s", (input, expected) => {
    expect(formatClock(input)).toBe(expected);
  });

  it("shows a dash for missing times", () => {
    expect(formatClock(null)).toBe("—");
    expect(formatClock(undefined)).toBe("—");
  });
});

describe("Manila <-> UTC", () => {
  it("converts a Manila date and time to UTC ISO", () => {
    expect(manilaToUtcIso("2026-06-22", "07:04")).toBe("2026-06-21T23:04:00Z");
    expect(manilaToUtcIso("2026-06-22", "23:30")).toBe("2026-06-22T15:30:00Z");
  });

  it("gives the time input value in Manila", () => {
    expect(toClockInput("2026-06-21T23:04:14Z")).toBe("07:04");
    expect(toClockInput(null)).toBe("");
  });

  it("round-trips an edit form default back to the same minute", () => {
    expect(manilaToUtcIso("2026-06-22", toClockInput("2026-06-21T23:04:00Z"))).toBe("2026-06-21T23:04:00Z");
  });
});

describe("today and this month are Manila's", () => {
  afterEach(() => jest.useRealTimers());

  it("is already tomorrow in Manila at 16:30 UTC", () => {
    jest.useFakeTimers({ now: new Date("2026-09-30T16:30:00Z") });
    expect(todayManila()).toBe("2026-10-01");
    expect(thisMonthManila()).toBe("2026-10");
  });
});

describe("formatMinutes / formatDuration", () => {
  it("pads minutes", () => {
    expect(formatMinutes(485)).toBe("8h 05m");
    expect(formatMinutes(0)).toBe("0h 00m");
  });

  it("formats worked minutes", () => {
    expect(formatDuration({ clock_in_at: "2026-09-29T14:00:00Z", worked_minutes: 480 })).toBe("8h 00m");
  });

  it("says Still in when timed in but not out", () => {
    expect(formatDuration({ clock_in_at: "2026-09-30T00:00:00Z", worked_minutes: null })).toBe("Still in");
  });

  it("shows a dash with no record", () => {
    expect(formatDuration(null)).toBe("—");
    expect(formatDuration({ clock_in_at: null, worked_minutes: null })).toBe("—");
  });
});

describe("formatDate is timezone-proof", () => {
  it("formats the three trest styles", () => {
    expect(formatDate("2026-09-30", "long")).toBe("Wednesday, 30 September 2026");
    expect(formatDate("2026-09-30", "short")).toBe("Wed, 30 Sep");
    expect(formatDate("2026-01-05", "medium")).toBe("05 Jan 2026");
  });
});
