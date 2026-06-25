#!/usr/bin/env node
/**
 * One-shot public deploy helper.
 * Set VERCEL_TOKEN (https://vercel.com/account/tokens) then:
 *   npm run deploy:vercel
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

console.log("Building production bundle…");
execSync("npm run build", { cwd: root, stdio: "inherit" });

if (!existsSync(join(root, "dist", "index.html"))) {
  console.error("Build failed: dist/index.html missing.");
  process.exit(1);
}

if (process.env.VERCEL_TOKEN) {
  console.log("Deploying to Vercel…");
  execSync(`npx vercel deploy --prod --yes --token ${process.env.VERCEL_TOKEN}`, {
    cwd: root,
    stdio: "inherit",
  });
  process.exit(0);
}

console.log(`
No VERCEL_TOKEN found. Choose one path:

  A) Vercel (recommended — free, works on phone/tablet/desktop)
     1. Create token: https://vercel.com/account/tokens
     2. Run: VERCEL_TOKEN=your_token npm run deploy:vercel

  B) GitHub Pages (free, permanent after push)
     1. Push this repo to GitHub
     2. Settings → Pages → Source: GitHub Actions
     3. Push to main — workflow publishes automatically

  C) Same Wi‑Fi demo (temporary)
     npm run dev:share
     Share the LAN URL printed in the terminal.

The app uses HashRouter — any static host works; no backend required.
`);
