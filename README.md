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

Contact details live in `hugo.toml` under `[params]`. Deploy settings are under `[deployment]` (bucket `elkridgewater.com`).

**CI deploy placeholders** (see `.github/workflows/hugo-build-deploy-s3.yml`):

- Replace `ACCOUNT_ID` in the workflow’s `role-to-assume` ARN with your AWS account ID before OIDC deploys work.
- Set `cloudFrontDistributionID` in `hugo.toml` (currently `REPLACE_ME`) before `hugo deploy --invalidateCDN` can invalidate the CDN. Extensionless redirect stubs (`static/services`, `static/contact`) are uploaded to S3 only until CloudFront is configured.