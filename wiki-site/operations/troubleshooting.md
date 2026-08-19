# Troubleshooting

- Use the Node and pnpm versions in `.node-version` and `packageManager`.
- If install state is suspect, verify a clean `pnpm install --frozen-lockfile` rather than editing the lockfile.
- If Playwright cannot launch Chromium, run `pnpm exec playwright install chromium`.
- If the wiki fails, read the first broken-link path from `pnpm wiki:check` and fix the source link.
- Do not bypass failing deterministic, vector-leakage, accessibility or release-safety checks.
