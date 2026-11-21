import type { Environment, NightshiftConfig } from "./types.js";
import { summarizeActivity } from "./activity.js";

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;"
}[c]!));

const palettes = {
  day: { sky: "#83c9ed", far: "#6c9fbd", near: "#365d78", window: "#ffe7a3", ground: "#263e4b" },
  dawn: { sky: "#e99a83", far: "#a96f82", near: "#594c70", window: "#ffe3a0", ground: "#292f49" },
  dusk: { sky: "#65577e", far: "#514a70", near: "#303b5c", window: "#ffd27a", ground: "#202b42" },
  night: { sky: "#101a35", far: "#1c2b4b", near: "#263653", window: "#ffdc8a", ground: "#111c30" }
};

export function renderCity(config: NightshiftConfig, env: Environment): string {
  const p = palettes[env.dayPhase];
  const activity = summarizeActivity(config);
  const snow = env.season === "winter";
  const rain = env.season === "monsoon";
  const leaves = env.season === "autumn";
  const stars = env.dayPhase === "night" || env.dayPhase === "dusk";
  const buildings = [
    { x: 45, y: 190, w: 85, h: 170 }, { x: 145, y: 145, w: 100, h: 215 },
    { x: 260, y: 205, w: 75, h: 155 }, { x: 350, y: 125, w: 115, h: 235 },
    { x: 480, y: 180, w: 95, h: 180 }, { x: 590, y: 155, w: 110, h: 205 },
    { x: 715, y: 210, w: 75, h: 150 }
  ];
  let buildingSvg = "";
  for (const b of buildings) {
    buildingSvg += `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="${p.near}" stroke="#101a2a" stroke-width="3"/>`;
    if (snow) buildingSvg += `<path d="M${b.x-3} ${b.y+4} h${b.w+6} l-7 9 h-${b.w-8}z" fill="#e8f3fa"/>`;
    for (let row = 0; row < Math.floor((b.h - 25) / 27); row++) {
      for (let col = 0; col < Math.floor((b.w - 18) / 20); col++) {
        const index = (row * 3 + col + Math.round(b.x / 20)) % 24;
        const lit = index < activity.lightsOn && env.dayPhase !== "day";
        const fill = env.dayPhase === "day" ? "#b7d7df" : (lit ? p.window : "#17263d");
        buildingSvg += `<rect x="${b.x+10+col*20}" y="${b.y+17+row*27}" width="9" height="13" fill="${fill}"/>`;
      }
    }
  }
  const starSvg = stars ? Array.from({length: 34}, (_, i) =>
    `<rect x="${(i*73+31)%850}" y="${(i*37+13)%115}" width="2" height="2" fill="#f6edc8" opacity="${0.45+(i%4)*0.12}"/>`
  ).join("") : "";
  const weather = snow
    ? `<g fill="#f3f8ff" opacity=".8">${Array.from({length:18},(_,i)=>`<rect x="${(i*47+19)%900}" y="${(i*31+20)%260}" width="3" height="5"/>`).join("")}</g>`
    : rain
      ? `<g stroke="#b9d9ee" stroke-width="2" opacity=".6">${Array.from({length:45},(_,i)=>`<path d="M${(i*29)%900} ${(i*17)%250} l-5 13"/>`).join("")}</g>`
      : leaves
        ? `<g fill="#e8a45f">${Array.from({length:18},(_,i)=>`<rect x="${(i*53+10)%900}" y="${(i*23+40)%290}" width="5" height="4"/>`).join("")}</g>`
        : "";
  const train = activity.trainVisible
    ? `<g><rect x="0" y="326" width="900" height="5" fill="#172638"/><g>
        <rect x="390" y="298" width="115" height="28" rx="3" fill="#d46c55"/>
        <rect x="402" y="304" width="19" height="11" fill="#f7d89a"/>
        <rect x="429" y="304" width="19" height="11" fill="#f7d89a"/>
        <rect x="456" y="304" width="19" height="11" fill="#f7d89a"/>
        <rect x="483" y="304" width="12" height="11" fill="#f7d89a"/>
        <circle cx="410" cy="328" r="5" fill="#101a2a"/><circle cx="486" cy="328" r="5" fill="#101a2a"/>
      </g></g>` : "";
  const ghost = activity.deterioration > .5
    ? `<g opacity=".75"><rect x="805" y="274" width="18" height="23" rx="8" fill="#c4d2e2"/><rect x="809" y="281" width="3" height="3" fill="#263653"/><rect x="817" y="281" width="3" height="3" fill="#263653"/></g>`
    : "";
  const title = `${config.username}'s Nightshift city`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 390" role="img" aria-labelledby="title desc">
<title id="title">${esc(title)}</title><desc id="desc">A pixel-art city showing ${env.dayPhase}, ${env.season}, and ${env.activityLevel} GitHub activity.</desc>
<defs><pattern id="grain" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 7h1M4 3h1" stroke="#fff" opacity=".035"/></pattern></defs>
<rect width="900" height="390" fill="${p.sky}"/>
<circle cx="760" cy="${env.dayPhase === "day" ? 70 : 115}" r="27" fill="${env.dayPhase === "night" ? "#e5e8f2" : "#ffe7a1"}" opacity=".9"/>
${starSvg}
<path d="M0 240 Q120 180 240 230 T480 220 T720 225 T900 205 V390 H0Z" fill="${p.far}"/>
${buildingSvg}
<rect x="0" y="330" width="900" height="60" fill="${p.ground}"/>
${train}${weather}${ghost}
<rect width="900" height="390" fill="url(#grain)"/>
<text x="24" y="32" fill="#fff" font-family="monospace" font-size="15" opacity=".95">${esc(config.username.toUpperCase())} / NIGHTSHIFT</text>
<text x="24" y="55" fill="#fff" font-family="monospace" font-size="11" opacity=".8">${env.localTime} · ${env.dayPhase.toUpperCase()} · ${env.season.toUpperCase()}</text>
<text x="876" y="32" text-anchor="end" fill="#fff" font-family="monospace" font-size="12" opacity=".9">${env.activityLevel.toUpperCase()}</text>
</svg>`;
}
