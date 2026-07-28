import type { ChainId } from '@whitehash/chain-reader'

/** Curated fxhash project refs only. Titles/descriptions come from chain via Whitehash. */
export type CuratedProject = {
  slug: string
  /** Whitehash Tezos project id: `v2:<issuer_id>` */
  projectId: string
  chain: Extract<ChainId, 'tezos:mainnet'>
  /** Hide iterations 1..N (test mints). Applied in the UI only. */
  hideIterationsThrough?: number
}

export const ARTIST = {
  name: 'Jinyao Lin',
  tezos: 'tz1XuoTxu2m7Kdp5iBhLv35KxFcjkoeY5vYe',
} as const

/** fx(hash) Genesis FA2 — iterations of the 2021–2022/03 projects */
export const GENTK_V1 = 'KT1KEa8z6vWXDJrVqtMrAeDVzsvxat3kHaCE'
/** GENTK v2 FA2 — iterations from `requiem-cloud` onward; Intimate sample */
export const GENTK_V2 = 'KT1U6EHmNxJTkvaWJ4ThczG4FSDaHC21ssvi'
/** GENTK v3 FA2 — no project here mints into it yet; kept so the issuer filter is complete. */
export const GENTK_V3 = 'KT1EfsNuqwLAWDd3o4pvfUx1CAh5GMdTrRvr'

export const GENTK_CONTRACTS = [GENTK_V1, GENTK_V2, GENTK_V3] as const

/** Newest first. Issuer ids read from the fxhash v2 issuer ledger for ARTIST.tezos. */
export const PROJECTS: CuratedProject[] = [
  {
    slug: 'intimate',
    projectId: 'v2:22357',
    chain: 'tezos:mainnet',
  },
  {
    slug: 'mythologic',
    projectId: 'v2:13458',
    chain: 'tezos:mainnet',
  },
  {
    slug: 'requiem-cloud',
    projectId: 'v2:11024',
    chain: 'tezos:mainnet',
  },
  {
    slug: 'cloud-atlas',
    projectId: 'v2:10165',
    chain: 'tezos:mainnet',
  },
  {
    slug: 'aura',
    projectId: 'v2:7892',
    chain: 'tezos:mainnet',
  },
  {
    slug: 'evangel',
    projectId: 'v2:6496',
    chain: 'tezos:mainnet',
  },
  {
    slug: 'reveal',
    projectId: 'v2:5651',
    chain: 'tezos:mainnet',
  },
  {
    slug: 'forsaken',
    projectId: 'v2:4788',
    chain: 'tezos:mainnet',
  },
  {
    slug: 'distortion-city-tool',
    projectId: 'v2:4068',
    chain: 'tezos:mainnet',
  },
  {
    slug: 'distortion-city-05',
    projectId: 'v2:3924',
    chain: 'tezos:mainnet',
  },
  {
    slug: 'alley',
    projectId: 'v2:3843',
    chain: 'tezos:mainnet',
  },
  {
    slug: 'evilbeanverse',
    projectId: 'v2:3358',
    chain: 'tezos:mainnet',
  },
  {
    slug: 'improviser',
    projectId: 'v2:2423',
    chain: 'tezos:mainnet',
  },
  {
    slug: 'distortion-city-04',
    projectId: 'v2:1893',
    chain: 'tezos:mainnet',
  },
  {
    slug: 'distortion-city-03',
    projectId: 'v2:1586',
    chain: 'tezos:mainnet',
  },
  {
    slug: 'distortion-city-02',
    projectId: 'v2:1413',
    chain: 'tezos:mainnet',
  },
  {
    slug: 'distortion-city-01',
    projectId: 'v2:1163',
    chain: 'tezos:mainnet',
  },
]

/** One known-good token, used as the "preview + Run live" smoke test on `/token/sample`. */
export const SAMPLE_TOKEN = {
  slug: 'intimate',
  chain: 'tezos:mainnet',
  contract: GENTK_V2,
  tokenId: '1394091',
  label: 'Intimate #1',
} as const

export function getProject(slug: string): CuratedProject | undefined {
  return PROJECTS.find((p) => p.slug === slug)
}
