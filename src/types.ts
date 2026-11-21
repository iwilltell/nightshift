export type Season = "winter" | "spring" | "summer" | "monsoon" | "autumn";
export type DayPhase = "day" | "dusk" | "night" | "dawn";
export type ActivityLevel = "thriving" | "steady" | "quiet" | "fading" | "abandoned";

export interface SeasonRange {
  season: Season;
  /** Inclusive start, format MM-DD. */
  start: string;
  /** Inclusive end, format MM-DD. Supports ranges crossing New Year. */
  end: string;
}

export interface NightshiftConfig {
  username: string;
  timezone: string;
  /** Shared calendar: same dates apply to every user, regardless of location. */
  seasonCalendar: SeasonRange[];
  /** Commit activity used by the renderer until GitHub API integration is added. */
  commitsLast30Days: number;
  daysSinceLastCommit: number;
  repositoriesCreatedLast90Days: number;
  daysSinceLastRepositoryCreated: number;
  output: string;
}

export interface Environment {
  localTime: string;
  dayPhase: DayPhase;
  season: Season;
  activityLevel: ActivityLevel;
}
