# Ops Control Tower — Daily Planning Workspace

A high-fidelity, fully interactive prototype of an **Operations Decision Intelligence
Platform** for Operations Managers, Team Leads and Delivery Owners. It is a
decision-support workspace — not a dashboard — built to answer five questions:

1. What requires attention today?
2. Can today's workload be completed?
3. Which articles are at risk?
4. Where is capacity available?
5. What should I do next?

## Running locally

```bash
npm install
npm run dev      # http://localhost:5180
```

Share on your local network (same Wi‑Fi/VPN):

```bash
npm run dev:share   # opens on your LAN IP, e.g. http://192.168.x.x:5180
```

## Share with anyone (public URL)

The prototype is a static Vite app (HashRouter) — deploy the `dist` folder to any static host.

### Option A — Vercel (recommended, free, permanent)

1. Install dependencies and log in once:

```bash
npm install
npx vercel login
```

2. Deploy from the `ops-control-tower` folder:

```bash
npm run deploy:vercel
```

Vercel prints a URL like `https://ops-control-tower-xxxx.vercel.app`. Share that link — anyone can open and interact with the prototype in their browser. No install required on their side.

### Option B — Netlify (free, permanent)

```bash
npm install
npx netlify login
npm run deploy:netlify
```

### Option C — GitHub Pages (free, permanent)

1. Push this repo to GitHub.
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push to `main` — the workflow in `.github/workflows/deploy-prototype.yml` builds and publishes automatically.

The site URL will be `https://<username>.github.io/<repo-name>/`.

### Temporary demo tunnel (while your machine is running)

```bash
npm run build
npm run preview -- --port 4173
# In another terminal:
npx cloudflared tunnel --url http://127.0.0.1:4173
```

Cloudflare prints a `https://*.trycloudflare.com` URL. This stops when you close the terminal — use Vercel/Netlify for a permanent link.

## Structure

- **No left sidebar** — full-width, workspace-oriented canvas.
- **Section 1 · Planning** — Overdue, Due Today and Upcoming containers with
  process-wise breakdowns, system-generated interpretations on every number,
  and progressive disclosure (expand → filter/sort/group → article detail).
- **Section 2 · Capacity** — location summary cards and a searchable,
  filterable, groupable employee grid with hover reveal (assignments, due
  dates, capacity and productivity trends).
- **AI Recommendation layer** — continuously connects workload with capacity
  and proposes actionable reallocations (review → apply to today's plan).
- **Article Detail** — overview, workflow progress, capacity impact with
  alternate resources, activity timeline, AI assessment.
- **Employee Detail** — overview, capacity, current work, lightweight trends,
  AI recommendations.

Planning and Capacity stay connected: clicking a location card focuses the
entire workspace (planning counts and the employee grid) on that location.

## Data

All sample data is generated deterministically from a fixed seed in
`src/data/data.js`. Capacity numbers are derived from real article→employee
assignments, so counts, utilization, free hours and recommendations stay
internally consistent.

## Design language

Colors, typography (Source Sans 3), spacing, radii, strokes and component
styling follow the *Ops Ctrl Tower* Figma file (tokens captured in
`src/index.css` via Tailwind 4 `@theme`).

## Verification

`scripts/verify-flows.mjs` and `scripts/verify-flow3.mjs` walk the seven
prototype flows with Playwright (uses the system Chrome) and capture
screenshots plus console errors.

## Stack

Vite · React 19 · React Router 7 · Tailwind CSS 4
