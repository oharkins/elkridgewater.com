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