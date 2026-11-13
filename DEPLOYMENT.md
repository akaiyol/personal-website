# Cloudflare deployment

The GitHub repository `akaiyol/personal-website`, branch `main`, is connected to the Cloudflare Worker `personal-website`.

- Root directory: `/`.
- Build command: empty (the site is static HTML, CSS and JavaScript).
- Deploy command: `npx wrangler deploy`.
- `wrangler.jsonc` sets the Worker name, asset directory and custom domain `yolandachen.me`.
- The custom domain is attached to `personal-website`; Cloudflare manages its DNS record and HTTPS certificate. The existing workers.dev address stays enabled.
- `.assetsignore` restricts uploads to the active page, root styles/scripts, public artwork/fonts/cursors and web photos. Git history, local documents, tooling, mockups and original photo archives are excluded.

The initial deployment failed because automatic configuration uploaded the repository root including a 48.3 MiB Git pack; Workers limits individual assets to 25 MiB. Keep the upload allowlist when adding public assets. Local commits affect Cloudflare only after an authorized push to GitHub.

## Branch previews

- Preview branch for the purple planet and flick gesture: `codex/purple-planet-preview`.
- Cloudflare Worker Previews is enabled for this repository. Pushes to the preview branch trigger `npx wrangler preview`; production branch `main` continues using `npx wrangler deploy`.
- `wrangler.jsonc` includes an empty `previews` block required by Worker Previews. Shared static assets and compatibility settings remain at the top level.
- Cloudflare’s Previews section provides the branch URL. Confirm build success and verify the hosted page before sharing it as ready.
- Keep `.assetsignore`: mockups, private/source documents, Git metadata and tooling are excluded; public planet JavaScript is included.
