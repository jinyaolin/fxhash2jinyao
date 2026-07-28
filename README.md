# fxhash2jinyao

Self-hosted gallery of **Jinyao Lin**'s fxhash works, built with [Whitehash](https://whitehash.m3000.io/).

Forked from [ileivoivm/fxhash2aluan](https://github.com/ileivoivm/fxhash2aluan).

Reads projects and tokens from Tezos, resolves IPFS covers/previews, and runs correctly seeded live artwork in a sandboxed iframe — without the fxhash platform backend.

## Artist

| | |
|---|---|
| Name | Jinyao Lin |
| Tezos | `tz1XuoTxu2m7Kdp5iBhLv35KxFcjkoeY5vYe` |
| Projects | 17 (2021-11 → 2022-12) |

## Features

- Curated project list with on-chain covers (`displayUri` / `thumbnailUri`)
- Project pages with cover, chain metadata, and iteration grid
- Token page: static preview + **Run live** + link to [objkt](https://objkt.com)
- **Issuer-exact iteration filter** — see below

### Why the issuer filter exists

Whitehash lists Tezos iterations with TzKT `metadata.name.as={name} #*`, matched
across every gentk FA2. That is not unique, and two of these projects are hit by it:

| project | name-only match | actual |
|---|---|---|
| `aura` (issuer 7892) | 594 | 256 — TzKT match is case-insensitive, so another artist's `Aura` came in |
| `forsaken` (issuer 4788) | 179 | 150 — a different `forsaken` (issuer **4789**) minted the same day, same casing, same iteration numbers |

`src/lib/issuerTokens.ts` therefore reads the authoritative token set from the
gentk `token_data` big map filtered by `issuer_id`, and `shouldShowToken()`
uses it as the deciding filter. The grid waits for that set before rendering.

## Embed

```html
<iframe
  src="https://jinyaolin.github.io/fxhash2jinyao/"
  title="Jinyao Lin — fxhash works"
  style="width:100%;min-height:80vh;border:0;background:#0c0b0a"
  loading="lazy"
  allow="fullscreen"
  referrerpolicy="no-referrer-when-downgrade"
></iframe>
```

Project page example:

```html
<iframe
  src="https://jinyaolin.github.io/fxhash2jinyao/works/mythologic"
  title="Mythologic"
  style="width:100%;min-height:80vh;border:0"
  loading="lazy"
  allow="fullscreen"
></iframe>
```

## Develop

```bash
npm install
npm run dev
```

Open the Local URL Vite prints (base path is `/fxhash2jinyao/`).

Root-path local dev:

```bash
VITE_BASE_PATH=/ npm run dev
```

> `@whitehash/*` must come from the official npm registry. This repo includes `.npmrc` with `registry=https://registry.npmjs.org/`.

## Deploy

Push to `main` → GitHub Actions builds and publishes GitHub Pages.

Manual check: **Settings → Pages → Source: GitHub Actions**.

The base path is set in two places and must match the repo name:
`vite.config.ts` (`/fxhash2jinyao/`) and `.github/workflows/deploy.yml`
(`VITE_BASE_PATH`).

## Routes

| Path | Purpose |
|------|---------|
| `/` | Project grid (covers + titles from chain) |
| `/works/:slug` | Project cover + iteration gallery |
| `/token/sample` | Sample: Intimate #1 |
| `/token/:contract/:tokenId` | Any GENTK token (preview, live, objkt) |

## Curated projects

Refs live in `src/data/projects.ts` (slug ↔ `v2:<issuer_id>`), newest first.
Titles, descriptions, and covers come from chain metadata via Whitehash.

| slug | projectId | minted | date | gentk |
|------|-----------|--------|------|-------|
| `intimate` | `v2:22357` | 34 | 2022-12 | v2 |
| `mythologic` | `v2:13458` | 987 | 2022-05 | v2 |
| `requiem-cloud` | `v2:11024` | 256 | 2022-04 | v2 |
| `cloud-atlas` | `v2:10165` | 128 | 2022-03 | genesis |
| `aura` | `v2:7892` | 256 | 2022-01 | genesis |
| `evangel` | `v2:6496` | 64 | 2022-01 | genesis |
| `reveal` | `v2:5651` | 365 | 2022-01 | genesis |
| `forsaken` | `v2:4788` | 150 | 2021-12 | genesis |
| `distortion-city-tool` | `v2:4068` | 312 | 2021-12 | genesis |
| `distortion-city-05` | `v2:3924` | 32 | 2021-12 | genesis |
| `alley` | `v2:3843` | 140 | 2021-12 | genesis |
| `evilbeanverse` | `v2:3358` | 130 | 2021-12 | genesis |
| `improviser` | `v2:2423` | 80 | 2021-12 | genesis |
| `distortion-city-04` | `v2:1893` | 40 | 2021-12 | genesis |
| `distortion-city-03` | `v2:1586` | 48 | 2021-11 | genesis |
| `distortion-city-02` | `v2:1413` | 56 | 2021-11 | genesis |
| `distortion-city-01` | `v2:1163` | 64 | 2021-11 | genesis |

`v2:` is the Whitehash namespace for the fxhash v2 issuer contract
`KT1BJC12dG17CVvPKJ1VYaNnaT5mzfnUTwXv`, which holds the migrated genesis-era
projects too. Minted counts are `token_data` entries per `issuer_id`.

To re-derive the list after minting something new:

```bash
curl -s "https://api.tzkt.io/v1/bigmaps/149776/keys\
?value.author=tz1XuoTxu2m7Kdp5iBhLv35KxFcjkoeY5vYe&limit=200&select=key"
```

### Objkt links

| GENTK contract | objkt path |
|----------------|------------|
| `KT1KEa8z6vWXDJrVqtMrAeDVzsvxat3kHaCE` | `fxhashgenesis` |
| `KT1U6EHmNxJTkvaWJ4ThczG4FSDaHC21ssvi` | `fxhash` |

## Stack

- Vite 5 + React 19 + TypeScript
- `@whitehash/react` · `@whitehash/ui` · `@whitehash/chain-reader`
- React Router · GitHub Pages (Actions)
