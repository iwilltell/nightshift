import { describe, expect, it } from "vitest";
import { defaultConfig } from "../src/config.js";
import { getActivityLevel, getDayPhase, getSeason } from "../src/environment.js";

describe("Nightshift environment", () => {
  it("uses the configured timezone for day/night", () => {
    const middayUtc = new Date("2026-11-21T06:30:00.000Z");
    expect(getDayPhase(middayUtc, "Asia/Kolkata")).toBe("day");
    expect(getDayPhase(middayUtc, "America/Los_Angeles")).toBe("night");
  });

  it("uses the shared configured calendar for seasons", () => {
    expect(getSeason(new Date("2026-12-15T12:00:00Z"), defaultConfig)).toBe("winter");
    expect(getSeason(new Date("2026-08-10T12:00:00Z"), defaultConfig)).toBe("monsoon");
  });

  it("maps long inactivity to a deteriorated city state", () => {
    expect(getActivityLevel({ ...defaultConfig, daysSinceLastCommit: 45 })).toBe("fading");
    expect(getActivityLevel({ ...defaultConfig, daysSinceLastCommit: 2 })).toBe("thriving");
  });
});
