# Elkridge Water Hugo site scaffold

Date: 2026-11-20  
Repo: `oharkins/elkridgewater.com`  
Reference: `oharkins/larkalert.com` (Hugo marketing site pattern)

## Goal

Scaffold a small Hugo marketing site for **Elkridge Water** with three pages (Home, Services, Contact), using the same operational skeleton as Lark Alert (hand-written layouts, content-driven pages, GitHub Actions → S3 deploy), but with Elkridge copy, placeholder contact details, minimal CSS, and no HubSpot lead form.

## Decisions (locked)

| Topic | Choice |
| --- | --- |
| Approach | Mirror Lark Alert skeleton; strip to 3 pages |
| Contact details | Placeholders in `hugo.toml` (`info@elkridgewater.com`, phone/location TBD-style placeholders) |
| CSS | Minimal base styles only (nav, footer, readable type) — no brand design system yet |
| Lead capture | No CTA partial / no HubSpot |
| Deploy | Include GitHub Actions + `hugo.toml` deployment; bucket `s3://elkridgewater.com` |
| URLs | `/`, `/services/`, `/contact/` (not `/contacts/`) |

## Out of scope

- CloudFront distribution ID (placeholder until provided)
- AWS OIDC role provisioning (workflow assumes a named role; AWS side is separate)
- Real phone / email / physical address
- Photos, logos, favicon art beyond a minimal placeholder
- Visual branding / design polish beyond minimal CSS
- Privacy policy page, blog, taxonomies
- Pricing, service-area maps, testimonials, or invented certifications
- HubSpot or other form embeds

## Architecture

Hugo static site, no third-party theme. Layout mirrors Lark Alert’s project shape:

```
hugo.toml
content/
  _index.md          # Home
  services.md        # Services
  contact.md         # Contact
layouts/
  _default/
    baseof.html
    single.html
  index.html
  404.html
  partials/
    head.html
    header.html
    footer.html
assets/css/main.css  # minimal
static/
  services           # extensionless stub → /services/
  contact            # extensionless stub → /contact/
  # No favicon in this pass — add under static/ when a brand asset exists
.github/workflows/
  hugo-build-deploy-s3.yml
```

- `disableKinds`: taxonomy, term, rss (marketing pages only).
- Menus: Home, Services, Contact in `[menus.main]` and `[menus.footer]`.
- Site params once in `hugo.toml`: `description`, `email`, `phone`, `phoneHref`, `location` — templates read these; do not hardcode contact strings in layouts.
- No `[params.hubspot]` block.
- No `layouts/partials/cta.html` and no landing `sections/` partials from Lark Alert.

## Page content

### Home (`content/_index.md` → `/`)

- Brand-first hero: **Elkridge Water** as the primary name signal.
- One short supporting sentence: water for fire, farm, and construction; daylighting available.
- Primary link to Contact; secondary link to Services.
- Below the fold, short factual highlights only:
  - Water truck for fire, farm, and construction uses
  - Daylighting trailer for rent, or with operator
  - Fully connected with Viper
  - Registered for government contracts

### Services (`content/services.md` → `/services/`)

Two service sections:

1. **Water truck** — delivery for fire, farm, and construction.
2. **Daylighting trailer** — available for rent alone or including an operator.

Closing note: fully connected with Viper; registered for government contracts. Link to Contact for scheduling and quotes.

### Contact (`content/contact.md` → `/contact/`)

- Short “reach out for scheduling and quotes” copy.
- Display placeholder phone, email, and location from `hugo.toml` params.
- No form embed.

Copy rules: stay factual to the bullets above. Do not invent rates, coverage area, response times, or certifications beyond Viper connection and government-contract registration.

## Styling

`assets/css/main.css` provides only what the scaffold needs to be readable:

- Basic document typography and spacing
- Header nav + footer layout
- Simple content width / link styles

No Lark Alert cyan/mint tokens, no card-heavy marketing system, no motion library. Further visual design is a later pass (user approval required before expanding CSS).

## Deploy

Patterned on Lark Alert’s workflow and `hugo.toml` `[deployment]`:

- **Bucket:** `s3://elkridgewater.com` (ARN `arn:aws:s3:::elkridgewater.com`)
- **Region in deploy URL:** `us-west-2` unless corrected later
- **CloudFront distribution ID:** `REPLACE_ME` placeholder in `hugo.toml`
- **GitHub Actions role:** placeholder name `elkridgewater.com_Deployment_Role` via OIDC (same shape as Lark Alert)
- **Hugo version:** `0.166.0` with `hugo_withdeploy` in CI
- **PR:** build only (`hugo --gc --minify`)
- **Push to `main` / `workflow_dispatch`:** build + `hugo deploy`
- **Extensionless stubs:** after deploy, upload `static/services` and `static/contact` as bare S3 keys with `Content-Type: text/html` (meta refresh to trailing-slash URLs)
- **Module mounts:** exclude those stub filenames from the static → public mount so they do not collide with Hugo pretty-URL directories

Cache matchers (CSS/JS long-lived, images long-lived, HTML short) follow Lark Alert’s deployment matchers.

## Success criteria

1. `hugo server` serves Home, Services, and Contact with working nav.
2. Contact details render from `hugo.toml` placeholders only.
3. No HubSpot scripts or CTA partial.
4. CSS is minimal and the site is usable on desktop and mobile without a designed brand look.
5. Workflow and `hugo.toml` deployment target the `elkridgewater.com` bucket with clear placeholders for CloudFront ID and IAM role.
6. Content covers water truck, daylighting (rent or with operator), Viper, and government contracts — nothing beyond that without new facts.
