import type { NightshiftConfig } from "./types.js";

export interface ActivitySummary {
  windowCount: number;
  lightsOn: number;
  trainVisible: boolean;
  deterioration: number;
}

export function summarizeActivity(config: NightshiftConfig): ActivitySummary {
  const days = config.daysSinceLastCommit;
  const deterioration = Math.min(1, Math.max(0, days / 60));
  const base = Math.min(24, Math.max(3, config.commitsLast30Days));
  const lightsOn = Math.max(0, Math.round(base * (1 - deterioration * 0.9)));
  return {
    windowCount: 24,
    lightsOn,
    trainVisible: days < 30,
    deterioration
  };
}
