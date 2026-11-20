# Elkridge Water Hugo Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold a three-page Hugo marketing site for Elkridge Water (Home, Services, Contact) patterned on `larkalert.com`, with minimal CSS, no HubSpot, and S3 deploy wiring to `s3://elkridgewater.com`.

**Architecture:** Hand-written Hugo layouts (no theme). Site config and menus in `hugo.toml`. Page copy in `content/*.md`. Shared chrome via `layouts/partials/{head,header,footer}.html`. GitHub Actions builds on PRs and deploys on `main` with extensionless S3 redirect stubs for `/services` and `/contact`.

**Tech Stack:** Hugo 0.166.0+ (CI uses `hugo_withdeploy`), GitHub Actions, AWS S3 (+ CloudFront placeholder), plain CSS via Hugo pipes.

**Spec:** `docs/superpowers/specs/2026-11-20-elkridgewater-hugo-scaffold-design.md`

## Global Constraints

- Pages only: `/`, `/services/`, `/contact/` — no taxonomy/term/rss
- Contact strings live once in `hugo.toml` `[params]` — never hardcoded in layouts
- No HubSpot / CTA partial
- Minimal CSS only (readable nav + type) — no brand design system
- Copy facts only: water truck (fire/farm/construction), daylighting trailer (rent or with operator), Viper-connected, registered for government contracts
- Deploy bucket: `s3://elkridgewater.com`; region `us-west-2`; CloudFront ID `REPLACE_ME`; IAM role name `elkridgewater.com_Deployment_Role`
- No favicon in this pass
- Do not expand CSS, add example/instructional files, or invent rates/service area

## File map

| Path | Responsibility |
| --- | --- |
| `hugo.toml` | Title, params, menus, minify, module mounts (exclude stubs), deployment |
| `.gitignore` | Ignore `public/`, Hugo lock/gen |
| `README.md` | Short how to run/build (replace stub) |
| `content/_index.md` | Home front matter + highlights |
| `content/services.md` | Services page |
| `content/contact.md` | Contact page |
| `layouts/_default/baseof.html` | HTML shell |
| `layouts/_default/single.html` | Inner pages |
| `layouts/index.html` | Home layout |
| `layouts/404.html` | Not found |
| `layouts/partials/head.html` | Meta + CSS fingerprint (no favicon links) |
| `layouts/partials/header.html` | Brand text + main menu |
| `layouts/partials/footer.html` | Contact params + footer menu |
| `assets/css/main.css` | Minimal styles |
| `static/services`, `static/contact` | Extensionless meta-refresh stubs |
| `.github/workflows/hugo-build-deploy-s3.yml` | Build/verify/deploy |

---

### Task 1: Hugo config, gitignore, README

**Files:**
- Create: `hugo.toml`
- Create: `.gitignore`
- Modify: `README.md`

**Interfaces:**
- Produces: `site.Params.{description,email,phone,phoneHref,location}`; menus `main` and `footer` with Home/Services/Contact; deployment target `production` → `s3://elkridgewater.com?region=us-west-2`

- [ ] **Step 1: Write `hugo.toml`**

```toml
baseURL = 'https://elkridgewater.com/'
defaultContentLanguage = 'en'
title = 'Elkridge Water'
enableRobotsTXT = true

disableKinds = ['taxonomy', 'term', 'rss']

[params]
  description = 'Elkridge Water provides water truck service for fire, farm, and construction uses, plus daylighting trailer rental with or without an operator. Fully connected with Viper and registered for government contracts.'
  email = 'info@elkridgewater.com'
  phone = '(000) 000-0000'
  phoneHref = '+10000000000'
  location = 'Location TBD'

[menus]
  [[menus.main]]
    name = 'Home'
    pageRef = '/'
    weight = 10
  [[menus.main]]
    name = 'Services'
    pageRef = '/services'
    weight = 20
  [[menus.main]]
    name = 'Contact'
    pageRef = '/contact'
    weight = 30

  [[menus.footer]]
    name = 'Home'
    pageRef = '/'
    weight = 10
  [[menus.footer]]
    name = 'Services'
    pageRef = '/services'
    weight = 20
  [[menus.footer]]
    name = 'Contact'
    pageRef = '/contact'
    weight = 30

[markup.goldmark.renderer]
  unsafe = true

[minify]
  disableXML = true

[module]
  [[module.mounts]]
    source = 'content'
    target = 'content'
  [[module.mounts]]
    source = 'data'
    target = 'data'
  [[module.mounts]]
    source = 'layouts'
    target = 'layouts'
  [[module.mounts]]
    source = 'i18n'
    target = 'i18n'
  [[module.mounts]]
    source = 'archetypes'
    target = 'archetypes'
  [[module.mounts]]
    source = 'assets'
    target = 'assets'
  [[module.mounts]]
    source = 'static'
    target = 'static'
    files = ['! services', '! contact']

[deployment]
  invalidateCDN = true
  maxDeletes = -1
  workers = 10

  [[deployment.targets]]
    name = 'production'
    url = 's3://elkridgewater.com?region=us-west-2'
    cloudFrontDistributionID = 'REPLACE_ME'

  [[deployment.matchers]]
    pattern = '^.+\\.(css|js)$'
    cacheControl = 'max-age=31536000, no-transform, public'
    gzip = true

  [[deployment.matchers]]
    pattern = '^.+\\.(png|jpg|jpeg|gif|svg|webp|woff2)$'
    cacheControl = 'max-age=31536000, no-transform, public'

  [[deployment.matchers]]
    pattern = '^.+\\.(html|xml|json)$'
    cacheControl = 'max-age=300, must-revalidate'
    gzip = true
```

- [ ] **Step 2: Write `.gitignore`**

```
/public/
/resources/_gen/
/.hugo_build.lock
.DS_Store
```

- [ ] **Step 3: Replace `README.md`**

```markdown
# elkridgewater.com

Public marketing site for **Elkridge Water**. Built with [Hugo](https://gohugo.io/).

## Pages

| URL | Source | Purpose |
| --- | --- | --- |
| `/` | `content/_index.md` | Home |
| `/services/` | `content/services.md` | Water truck and daylighting |
| `/contact/` | `content/contact.md` | Contact placeholders |

## Local development

Requires Hugo **0.166.0+**.

```bash
hugo server
hugo --gc --minify
```

Contact details live in `hugo.toml` under `[params]`. Deploy settings are under `[deployment]` (bucket `elkridgewater.com`; CloudFront ID still a placeholder).
```

- [ ] **Step 4: Commit**

```bash
git add hugo.toml .gitignore README.md
git commit -m "Add Hugo site config, gitignore, and README"
```

---

### Task 2: Layouts and minimal CSS

**Files:**
- Create: `layouts/_default/baseof.html`
- Create: `layouts/_default/single.html`
- Create: `layouts/index.html`
- Create: `layouts/404.html`
- Create: `layouts/partials/head.html`
- Create: `layouts/partials/header.html`
- Create: `layouts/partials/footer.html`
- Create: `assets/css/main.css`

**Interfaces:**
- Consumes: `site.Params.*`, `site.Menus.main`, `site.Menus.footer`
- Produces: Home reads `.Params.hero` and `.Params.highlights`; single pages read `.Title`, `.Params.lede`, `.Content`

- [ ] **Step 1: Create layout shell files**

`layouts/_default/baseof.html`:

```html
<!DOCTYPE html>
<html lang="en">
  {{ partial "head.html" . }}
  <body>
    <a class="skip-link" href="#main">Skip to main content</a>
    {{ partial "header.html" . }}
    <main id="main">
      {{ block "main" . }}{{ end }}
    </main>
    {{ partial "footer.html" . }}
  </body>
</html>
```

`layouts/partials/head.html`:

```html
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  {{- $title := cond .IsHome site.Title (printf "%s | %s" .Title site.Title) }}
  {{- $description := or .Description .Summary site.Params.description | plainify | chomp }}
  <title>{{ $title }}</title>
  <meta name="description" content="{{ $description }}" />
  <link rel="canonical" href="{{ .Permalink }}" />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="{{ site.Title }}" />
  <meta property="og:title" content="{{ $title }}" />
  <meta property="og:description" content="{{ $description }}" />
  <meta property="og:url" content="{{ .Permalink }}" />
  <meta name="twitter:card" content="summary" />

  {{- with resources.Get "css/main.css" }}
    {{- $css := . | minify | fingerprint }}
    <link rel="stylesheet" href="{{ $css.RelPermalink }}" integrity="{{ $css.Data.Integrity }}" />
  {{- end }}

  {{- if hugo.IsProduction }}
    <meta name="robots" content="index, follow" />
  {{- else }}
    <meta name="robots" content="noindex, nofollow" />
  {{- end }}

  {{ hugo.Generator }}
</head>
```

`layouts/partials/header.html`:

```html
<header class="site-header">
  <div class="wrap site-header__inner">
    <a class="brand" href="{{ "/" | relURL }}" {{ if .IsHome }}aria-current="page"{{ end }}>Elkridge Water</a>
    <nav class="site-nav" aria-label="Main">
      <ul class="site-nav__list">
        {{- range site.Menus.main }}
          {{- $active := or ($.IsMenuCurrent "main" .) ($.HasMenuCurrent "main" .) }}
          <li>
            <a href="{{ .URL }}" {{ if $active }}aria-current="page"{{ end }}>{{ .Name }}</a>
          </li>
        {{- end }}
      </ul>
    </nav>
  </div>
</header>
```

`layouts/partials/footer.html`:

```html
<footer class="site-footer">
  <div class="wrap site-footer__inner">
    <div>
      <a class="brand" href="{{ "/" | relURL }}">Elkridge Water</a>
      <p class="site-footer__tagline">Water truck and daylighting services.</p>
    </div>
    <div>
      <h2 class="site-footer__heading">Contact</h2>
      <ul class="site-footer__list">
        <li><a href="mailto:{{ site.Params.email }}">{{ site.Params.email }}</a></li>
        <li><a href="tel:{{ site.Params.phoneHref }}">{{ site.Params.phone }}</a></li>
        <li>{{ site.Params.location }}</li>
      </ul>
    </div>
    <div>
      <h2 class="site-footer__heading">Site</h2>
      <ul class="site-footer__list">
        {{- range site.Menus.footer }}
          <li><a href="{{ .URL }}">{{ .Name }}</a></li>
        {{- end }}
      </ul>
    </div>
  </div>
  <div class="wrap site-footer__legal">
    <p>&copy; {{ now.Format "2006" }} Elkridge Water. All rights reserved.</p>
  </div>
</footer>
```

`layouts/index.html`:

```html
{{ define "main" }}
  {{- $hero := .Params.hero | default dict }}
  <section class="hero">
    <div class="wrap">
      <p class="hero__brand">Elkridge Water</p>
      <h1 class="hero__heading">{{ $hero.heading | default .Title }}</h1>
      {{- with $hero.body }}<p class="hero__body">{{ . }}</p>{{ end }}
      <div class="hero__actions">
        {{- with $hero.primary }}
          <a class="button button--primary" href="{{ .url | relURL }}">{{ .label }}</a>
        {{- end }}
        {{- with $hero.secondary }}
          <a class="button button--ghost" href="{{ .url | relURL }}">{{ .label }}</a>
        {{- end }}
      </div>
    </div>
  </section>

  {{- with .Params.highlights }}
    <section class="section" aria-labelledby="highlights-heading">
      <div class="wrap">
        <h2 id="highlights-heading">{{ .heading }}</h2>
        {{- with .body }}<p>{{ . }}</p>{{ end }}
        <ul class="highlights">
          {{- range .items }}
            <li>
              <strong>{{ .title }}</strong>
              <p>{{ .body }}</p>
            </li>
          {{- end }}
        </ul>
      </div>
    </section>
  {{- end }}

  {{- with .Content }}
    <section class="section">
      <div class="wrap prose">{{ . }}</div>
    </section>
  {{- end }}
{{ end }}
```

`layouts/_default/single.html`:

```html
{{ define "main" }}
  <article class="page">
    <header class="page__header">
      <div class="wrap">
        <h1 class="page__title">{{ .Title }}</h1>
        {{- with .Params.lede }}<p class="page__lede">{{ . }}</p>{{ end }}
      </div>
    </header>
    <div class="wrap prose">
      {{ .Content }}
    </div>
  </article>
{{ end }}
```

`layouts/404.html`:

```html
{{ define "main" }}
  <section class="page">
    <div class="wrap">
      <h1>Page not found</h1>
      <p><a href="{{ "/" | relURL }}">Back to Elkridge Water home</a></p>
    </div>
  </section>
{{ end }}
```

- [ ] **Step 2: Write minimal `assets/css/main.css`**

```css
:root {
  --text: #1a1f24;
  --muted: #4a5560;
  --bg: #f7f8f6;
  --surface: #ffffff;
  --accent: #1f4d3a;
  --border: #d5dbd6;
  --max: 44rem;
  --font: "Source Serif 4", "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
  --font-ui: "IBM Plex Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  color: var(--text);
  background:
    radial-gradient(ellipse 80% 50% at 10% -10%, #dce8e2 0%, transparent 55%),
    linear-gradient(180deg, #eef2ef 0%, var(--bg) 40%, #e8ece8 100%);
  font-family: var(--font-ui);
  line-height: 1.5;
}

body {
  margin: 0;
  min-height: 100vh;
}

a {
  color: var(--accent);
}

.wrap {
  width: min(100% - 2rem, 64rem);
  margin-inline: auto;
}

.skip-link {
  position: absolute;
  left: -999px;
  top: 0;
}
.skip-link:focus {
  left: 1rem;
  z-index: 10;
  background: var(--surface);
  padding: 0.5rem 0.75rem;
}

.site-header {
  border-bottom: 1px solid var(--border);
  background: color-mix(in srgb, var(--surface) 88%, transparent);
  backdrop-filter: blur(6px);
}

.site-header__inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 0;
}

.brand {
  font-family: var(--font);
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text);
  text-decoration: none;
}

.site-nav__list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.site-nav a {
  text-decoration: none;
  color: var(--muted);
}
.site-nav a[aria-current="page"] {
  color: var(--text);
  font-weight: 600;
}

.hero {
  padding: 4rem 0 3rem;
}

.hero__brand {
  margin: 0 0 0.5rem;
  font-family: var(--font);
  font-size: clamp(2.25rem, 5vw, 3.5rem);
  font-weight: 700;
  line-height: 1.1;
  color: var(--text);
}

.hero__heading {
  margin: 0 0 0.75rem;
  font-family: var(--font);
  font-size: clamp(1.25rem, 2.5vw, 1.75rem);
  font-weight: 600;
  color: var(--muted);
}

.hero__body {
  max-width: var(--max);
  color: var(--muted);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.button {
  display: inline-block;
  padding: 0.65rem 1.1rem;
  border: 1px solid var(--accent);
  text-decoration: none;
  font-weight: 600;
}
.button--primary {
  background: var(--accent);
  color: #fff;
}
.button--ghost {
  background: transparent;
  color: var(--accent);
}

.section,
.page {
  padding: 2rem 0 3rem;
}

.page__title {
  font-family: var(--font);
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  margin: 0 0 0.5rem;
}

.page__lede {
  max-width: var(--max);
  color: var(--muted);
  margin: 0 0 1.5rem;
}

.highlights {
  list-style: none;
  margin: 1.5rem 0 0;
  padding: 0;
  display: grid;
  gap: 1.25rem;
}

.highlights li {
  max-width: var(--max);
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

.prose {
  max-width: var(--max);
}

.prose h2 {
  font-family: var(--font);
  margin-top: 2rem;
}

.site-footer {
  margin-top: 2rem;
  border-top: 1px solid var(--border);
  background: #1a2420;
  color: #d7e0db;
  padding: 2rem 0 1.5rem;
}

.site-footer a {
  color: #d7e0db;
}

.site-footer .brand {
  color: #fff;
}

.site-footer__inner {
  display: grid;
  gap: 1.5rem;
}

@media (min-width: 40rem) {
  .site-footer__inner {
    grid-template-columns: 1.2fr 1fr 1fr;
  }
}

.site-footer__heading {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0 0 0.5rem;
}

.site-footer__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.site-footer__list li + li {
  margin-top: 0.35rem;
}

.site-footer__legal {
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #9aaba3;
}
```

Note: fonts are CSS stack only (system/web-safe fallbacks) — do not add Google Fonts links unless asked.

- [ ] **Step 3: Commit**

```bash
git add layouts assets
git commit -m "Add Hugo layouts and minimal CSS"
```

---

### Task 3: Content pages

**Files:**
- Create: `content/_index.md`
- Create: `content/services.md`
- Create: `content/contact.md`

**Interfaces:**
- Consumes: home layout `hero` / `highlights`; single layout `lede` + markdown body
- Produces: published pages at `/`, `/services/`, `/contact/`

- [ ] **Step 1: Write home content**

`content/_index.md`:

```markdown
---
title: "Water for fire, farm, and construction"
description: "Elkridge Water provides water truck service for fire, farm, and construction, plus daylighting trailer rental with or without an operator. Viper-connected and registered for government contracts."

hero:
  heading: "Water truck and daylighting when you need them"
  body: >-
    Reliable water delivery for fire, farm, and construction jobs, plus a
    daylighting trailer you can rent alone or with an operator.
  primary:
    label: "Contact us"
    url: "/contact/"
  secondary:
    label: "View services"
    url: "/services/"

highlights:
  heading: "What we offer"
  body: "Straightforward equipment and service for the jobs that need water and daylighting."
  items:
    - title: "Water truck"
      body: "Water for fire, farm, and construction uses."
    - title: "Daylighting trailer"
      body: "Available for rent, or including an operator."
    - title: "Viper connected"
      body: "Fully connected with Viper."
    - title: "Government contracts"
      body: "Registered for government contracts."
---
```

- [ ] **Step 2: Write services and contact**

`content/services.md`:

```markdown
---
title: "Services"
description: "Water truck service for fire, farm, and construction, and daylighting trailer rental with or without an operator."
lede: "Equipment and operators for water delivery and daylighting."
---

## Water truck

Elkridge Water provides water truck service for fire, farm, and construction uses.

## Daylighting trailer

Rent our daylighting trailer on its own, or include an operator.

## Ready for your job

We are fully connected with Viper and registered for government contracts.

[Contact us](/contact/) to schedule or request a quote.
```

- [ ] **Step 3: Add contact layout + page that renders `site.Params`**

`layouts/_default/contact.html`:

```html
{{ define "main" }}
  <article class="page">
    <header class="page__header">
      <div class="wrap">
        <h1 class="page__title">{{ .Title }}</h1>
        {{- with .Params.lede }}<p class="page__lede">{{ . }}</p>{{ end }}
      </div>
    </header>
    <div class="wrap prose">
      {{ .Content }}
      <ul>
        <li><a href="mailto:{{ site.Params.email }}">{{ site.Params.email }}</a></li>
        <li><a href="tel:{{ site.Params.phoneHref }}">{{ site.Params.phone }}</a></li>
        <li>{{ site.Params.location }}</li>
      </ul>
    </div>
  </article>
{{ end }}
```

`content/contact.md`:

```markdown
---
title: "Contact"
layout: contact
description: "Contact Elkridge Water for scheduling and quotes."
lede: "Reach out for scheduling and quotes."
---

Use the details below — they come from site configuration and will be replaced with final contact information when available.
```

- [ ] **Step 4: Commit**

```bash
git add content layouts/_default/contact.html
git commit -m "Add Home, Services, and Contact content"
```

---

### Task 4: Extensionless stubs and CI deploy workflow

**Files:**
- Create: `static/services`
- Create: `static/contact`
- Create: `.github/workflows/hugo-build-deploy-s3.yml`

**Interfaces:**
- Consumes: Hugo `public/` build; stubs excluded from static mount
- Produces: CI verify of `/services/` and `/contact/`; deploy to `s3://elkridgewater.com` on non-PR events

- [ ] **Step 1: Create redirect stubs**

`static/services`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Redirecting…</title>
<link rel="canonical" href="https://elkridgewater.com/services/">
<meta http-equiv="refresh" content="0;url=/services/">
</head>
<body>
<p><a href="/services/">Continue to Services</a></p>
</body>
</html>
```

`static/contact`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Redirecting…</title>
<link rel="canonical" href="https://elkridgewater.com/contact/">
<meta http-equiv="refresh" content="0;url=/contact/">
</head>
<body>
<p><a href="/contact/">Continue to Contact</a></p>
</body>
</html>
```

- [ ] **Step 2: Create workflow**

`.github/workflows/hugo-build-deploy-s3.yml`:

```yaml
name: Hugo Build and Deploy to S3

on:
  workflow_dispatch:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

permissions:
  id-token: write
  contents: read

concurrency:
  group: hugo-deploy-${{ github.ref }}
  cancel-in-progress: true

env:
  HUGO_VERSION: '0.166.0'

jobs:
  build:
    name: Build and Deploy
    runs-on: ubuntu-latest
    steps:
      - name: Check out
        uses: actions/checkout@v4

      - name: Install Hugo
        run: |
          archive="hugo_withdeploy_${HUGO_VERSION}_Linux-64bit.tar.gz"
          wget -q "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/${archive}"
          tar -xzf "${archive}" hugo
          sudo mv hugo /usr/local/bin/hugo
          hugo version

      - name: Build
        run: hugo --gc --minify

      - name: Verify pretty-URL pages and extensionless redirect stubs
        run: |
          for path in services contact; do
            test -f "public/${path}/index.html" || { echo "missing public/${path}/index.html"; exit 1; }
            test -f "static/${path}" || { echo "missing static/${path} redirect stub"; exit 1; }
            test ! -e "public/${path}" || test -d "public/${path}" || {
              echo "public/${path} must be a directory, not a file"; exit 1;
            }
            grep -q "url=/${path}/" "static/${path}" || {
              echo "static/${path} missing meta refresh to /${path}/"; exit 1;
            }
          done
          test -f public/index.html || { echo "missing public/index.html"; exit 1; }
          echo "OK: page directories in public/; extensionless stubs in static/ for S3 upload"

      - name: Configure AWS credentials
        if: github.event_name != 'pull_request'
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-region: us-west-2
          # Replace ACCOUNT_ID when the OIDC deploy role exists in AWS.
          role-to-assume: arn:aws:iam::ACCOUNT_ID:role/elkridgewater.com_Deployment_Role
          role-duration-seconds: 3600
          role-skip-session-tagging: true

      - name: Deploy to S3 and CloudFront
        if: github.event_name != 'pull_request'
        run: hugo deploy --target production --invalidateCDN --maxDeletes -1 --logLevel info

      # Extensionless stubs are excluded from Hugo public/ (file vs directory).
      # Upload as bare S3 keys after every deploy. Add CloudFront path
      # invalidation for /services and /contact once a distribution ID exists.
      - name: Upload extensionless pretty-URL redirects
        if: github.event_name != 'pull_request'
        run: |
          for path in services contact; do
            aws s3 cp "static/${path}" "s3://elkridgewater.com/${path}" \
              --region us-west-2 \
              --content-type 'text/html; charset=utf-8' \
              --cache-control 'max-age=300, must-revalidate'
          done
```

Notes for implementers:
- `role-to-assume` uses `ACCOUNT_ID` placeholder — replace with the real AWS account before production deploys succeed.
- `hugo.toml` keeps `invalidateCDN = true` and `cloudFrontDistributionID = 'REPLACE_ME'` per spec; `hugo deploy` CDN invalidation will need a real ID. Stub upload step is S3-only until then.
- Update README deploy section to mention both placeholders.

- [ ] **Step 3: Commit**

```bash
git add static/services static/contact .github/workflows/hugo-build-deploy-s3.yml
git commit -m "Add redirect stubs and Hugo S3 deploy workflow"
```

---

### Task 5: Local verify

**Files:** none new (verification only)

- [ ] **Step 1: Install Hugo if missing and build**

```bash
command -v hugo || {
  VER=0.166.0
  archive="hugo_extended_${VER}_Linux-64bit.tar.gz"
  # Prefer withdeploy if available; extended/standard also fine for local build-only.
  wget -q "https://github.com/gohugoio/hugo/releases/download/v${VER}/hugo_${VER}_Linux-64bit.tar.gz" -O /tmp/hugo.tgz
  tar -xzf /tmp/hugo.tgz -C /tmp hugo
  sudo mv /tmp/hugo /usr/local/bin/hugo
}
hugo version
hugo --gc --minify
```

Expected: exit 0; `public/index.html`, `public/services/index.html`, `public/contact/index.html` exist; `public/services` and `public/contact` are directories (not files).

- [ ] **Step 2: Run the same stub checks as CI**

```bash
for path in services contact; do
  test -f "public/${path}/index.html"
  test -f "static/${path}"
  test -d "public/${path}"
  grep -q "url=/${path}/" "static/${path}"
done
grep -q 'info@elkridgewater.com' public/contact/index.html
grep -q 'Elkridge Water' public/index.html
grep -q 'Viper' public/index.html
grep -q 'government contracts' public/services/index.html
```

Expected: all succeed.

- [ ] **Step 3: Push branch and open/update PR**

```bash
git push -u origin HEAD
```

Then create/update PR against `main` with ManagePullRequest.

---

## Spec coverage checklist

| Spec requirement | Task |
| --- | --- |
| Hugo skeleton like Lark Alert | 1–4 |
| Home / Services / Contact | 3 |
| Placeholder contacts in params | 1, 3 |
| Minimal CSS | 2 |
| No HubSpot/CTA | (omitted by design) |
| S3 bucket elkridgewater.com + workflow | 1, 4 |
| Extensionless stubs | 4 |
| Water truck, daylighting, Viper, gov contracts copy | 3 |
| No favicon | 2 (head has none) |
