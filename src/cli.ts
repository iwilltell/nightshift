import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { loadConfig } from "./config.js";
import { getEnvironment } from "./environment.js";
import { renderCity } from "./renderer.js";

const config = loadConfig();
const now = new Date();
const environment = getEnvironment(now, config);
const svg = renderCity(config, environment);

await mkdir(dirname(config.output), { recursive: true });
await writeFile(config.output, svg, "utf8");
console.log(`Nightshift city generated: ${config.output}`);
console.log(`Environment: ${environment.dayPhase} / ${environment.season} / ${environment.activityLevel}`);
