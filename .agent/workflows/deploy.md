---
description: How to deploy the dashboard to Cloudflare Workers
---

# Deploy Dashboard to Cloudflare Workers

The dashboard is deployed as a **Cloudflare Worker with static assets** (not Cloudflare Pages).
The config lives in `dashboard/wrangler.toml`.

## Steps

// turbo
1. Build the production bundle:
```bash
cd /home/bobbybones/src/git/bobbybones/blnd-huntr/dashboard && npx vite build
```

2. Deploy to Cloudflare Workers:
```bash
cd /home/bobbybones/src/git/bobbybones/blnd-huntr/dashboard && npx wrangler deploy
```

The deploy URL is: **https://blnd-huntr.growfunkybones.workers.dev**

## Important Notes

- Do **NOT** use `wrangler pages deploy` — this is a Workers project, not Pages.
- The `wrangler.toml` points `[assets].directory` at `./dist`, so you must build first.
- The worker entry point is `src/worker.js`.
- SPA routing is handled via `not_found_handling = "single-page-application"` in wrangler.toml.
