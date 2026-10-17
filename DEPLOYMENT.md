# Cloudflare deployment

The GitHub repository `akaiyol/personal-website`, branch `main`, is connected to the Cloudflare Worker `personal-website`.

- Root directory: `/`.
- Build command: empty (the site is static HTML, CSS and JavaScript).
- Deploy command: `npx wrangler deploy`.
- `wrangler.jsonc` sets the Worker name, asset directory and custom domain `yolandachen.me`.
- The custom domain is attached to `personal-website`; Cloudflare manages its DNS record and HTTPS certificate. The existing workers.dev address stays enabled.
- `.assetsignore` restricts uploads to the active page, root styles/scripts, public artwork/fonts/cursors and web photos. Git history, local documents, tooling, mockups and original photo archives are excluded.

The initial deployment failed because automatic configuration uploaded the repository root including a 48.3 MiB Git pack; Workers limits individual assets to 25 MiB. Keep the upload allowlist when adding public assets. Local commits affect Cloudflare only after an authorized push to GitHub.
