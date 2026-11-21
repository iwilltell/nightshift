# Nightshift 🌃

**Your code builds the city. Your absence changes it.**

Nightshift is an open-source GitHub Action that turns GitHub activity into a living pixel-art city for your profile README.

## Current prototype

This first scaffold includes:
- A procedural SVG city renderer.
- Day/night determined by an IANA timezone.
- A shared global seasonal calendar (not based on the user's hemisphere).
- An initial inactivity state model.
- A starter GitHub Action and CI workflow.

> This is an early prototype. GitHub GraphQL contribution fetching, repository-creation tracking, README publishing, animation timing, and scheduled refreshes are not wired up yet.

## Run locally

Requires Node.js 22+.

```bash
npm install
npm run render
```

The generated image is written to `output/nightshift.svg`.

Configure with environment variables:

```bash
NIGHTSHIFT_USERNAME=your-github-username
NIGHTSHIFT_TIMEZONE=Asia/Kolkata
NIGHTSHIFT_OUTPUT=output/nightshift.svg
npm run render
```

## Test

```bash
npm test
npm run build
```

## Configuration decisions

- **Day/night:** uses the configured timezone only.
- **Seasons:** all users share the same UTC-based calendar, independent of their timezone and hemisphere. The initial calendar in `src/config.ts` is a proposal and can be changed.
- **Activity:** inactivity is represented separately from repository creation. The first renderer uses fixture values until the GitHub API integration is implemented.

## Roadmap

1. Connect GitHub GraphQL API and retrieve contribution/repository activity.
2. Build a richer city generator with contribution-driven buildings and windows.
3. Add animated train, clouds, stars, rain, snow, and seasonal details.
4. Implement configurable inactivity thresholds and recovery.
5. Publish SVG artifacts and provide README setup instructions.
6. Test animated SVG behavior through GitHub's image proxy/cache.

## License

MIT
