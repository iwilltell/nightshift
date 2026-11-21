import type {
  ActivityLevel, DayPhase, Environment, NightshiftConfig, Season
} from "./types.js";

function dateKey(date: Date): string {
  // Seasons use UTC so every Nightshift city shares the exact same global calendar.
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${month}-${day}`;
}

function isInRange(key: string, start: string, end: string): boolean {
  // Lexicographic MM-DD comparison; handles seasons crossing New Year.
  return start <= end
    ? key >= start && key <= end
    : key >= start || key <= end;
}

export function getSeason(date: Date, config: NightshiftConfig): Season {
  const key = dateKey(date);
  const match = config.seasonCalendar.find(r => isInRange(key, r.start, r.end));
  if (!match) throw new Error(`No season configured for ${key}. Check seasonCalendar.`);
  return match.season;
}

export function getDayPhase(date: Date, timezone: string): DayPhase {
  const hourText = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone, hour: "2-digit", hourCycle: "h23"
  }).format(date);
  const hour = Number(hourText);
  // Simple timezone-based first version. Later we can add smooth dawn/dusk transitions.
  if (hour >= 6 && hour < 8) return "dawn";
  if (hour >= 8 && hour < 17) return "day";
  if (hour >= 17 && hour < 19) return "dusk";
  return "night";
}

export function getActivityLevel(config: NightshiftConfig): ActivityLevel {
  const inactive = config.daysSinceLastCommit;
  if (inactive >= 60) return "abandoned";
  if (inactive >= 30) return "fading";
  if (inactive >= 14) return "quiet";
  if (inactive >= 7) return "steady";
  return "thriving";
}

export function getEnvironment(date: Date, config: NightshiftConfig): Environment {
  return {
    localTime: new Intl.DateTimeFormat("en-GB", {
      timeZone: config.timezone, hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).format(date),
    dayPhase: getDayPhase(date, config.timezone),
    season: getSeason(date, config),
    activityLevel: getActivityLevel(config)
  };
}
