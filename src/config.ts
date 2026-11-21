import type { NightshiftConfig } from "./types.js";

export const defaultConfig: NightshiftConfig = {
  username: "octocat",
  timezone: "Asia/Kolkata",
  // Initial shared calendar proposal. These dates are global, not hemisphere-based.
  // We'll tune the exact boundaries as part of product design.
  seasonCalendar: [
    { season: "winter", start: "12-01", end: "02-29" },
    { season: "spring", start: "03-01", end: "04-30" },
    { season: "summer", start: "05-01", end: "06-30" },
    { season: "monsoon", start: "07-01", end: "09-15" },
    { season: "autumn", start: "09-16", end: "11-30" }
  ],
  commitsLast30Days: 18,
  daysSinceLastCommit: 1,
  repositoriesCreatedLast90Days: 1,
  daysSinceLastRepositoryCreated: 24,
  output: "output/nightshift.svg"
};

export function loadConfig(): NightshiftConfig {
  // Environment variables make the first prototype easy to try in CI.
  return {
    ...defaultConfig,
    username: process.env.NIGHTSHIFT_USERNAME ?? defaultConfig.username,
    timezone: process.env.NIGHTSHIFT_TIMEZONE ?? defaultConfig.timezone,
    output: process.env.NIGHTSHIFT_OUTPUT ?? defaultConfig.output
  };
}
