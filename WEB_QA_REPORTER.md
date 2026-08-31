# Feather Fury Web QA Reporter

Status: ACTIVE FOR QA ONLY

## Purpose

Allow browser-only manual testing to produce sanitized run reports while Android hardware is unavailable.

This system supplements, but does not replace, Android/Firebase/Capacitor device validation.

## Feature gate

The browser reporter is disabled by default.

It activates only when the game URL contains:

`?ffqa=1`

Normal players and normal GitHub Pages QA runs do not send reports to this service.

## Cloudflare isolation contract

Only these dedicated resources belong to Feather Fury Web QA:

- Worker: `featherfury-web-qa-reports`
- D1: `featherfury-web-qa-reports`
- D1 UUID: `aa17cfd9-a3ee-401b-a8a2-f29831b7f75c`
- Worker URL: `https://featherfury-web-qa-reports.salahaseel82.workers.dev`

Do not modify, reuse, rename, bind, delete, or redeploy any other Cloudflare Worker, D1 database, route, domain, KV namespace, R2 bucket, or account setting for this feature.

The Worker uses its workers.dev subdomain only. No custom Cloudflare zone/domain route is required.

## Data policy

The reporter is intended to send sanitized QA/gameplay fields only:

- session-scoped random QA id
- report/run id
- browser family
- viewport
- game build label
- world
- hero
- score
- coins earned
- revives
- boss reached/completed flags
- telemetry event names and compact numeric gameplay fields
- JavaScript runtime error messages during QA

It does not intentionally collect player names, email addresses, account ids, cookies, authentication tokens, IP addresses in the application payload, or full browser fingerprints.

## GitHub reporting

GitHub Issue #115 is the single live report surface:

`[WEB QA] Browser Run Reports`

`.github/workflows/web-qa-to-issue.yml` reads the Worker public sanitized recent-report endpoint every 15 minutes and replaces the issue body with the latest report table using the repository-provided GitHub Actions token.

No GitHub token is stored in the game or Cloudflare Worker.

## Runtime ownership

`web-qa-reporter-v1.js` is an observer only. It listens to the existing `ff:telemetry` browser event emitted by `telemetry-v1.js`.

It must not become an owner of world state, game state, economy, revive behavior, hero state, boss behavior, navigation, saves, or Firebase Analytics.

If Web QA ever causes a gameplay regression, disable/remove the Web QA reporter rather than modifying approved gameplay systems to accommodate it.
