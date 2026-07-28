import { GENTK_CONTRACTS } from '../data/projects'

const TZKT_BASE = 'https://api.tzkt.io'
const PAGE = 1000

/** `${contract}:${tokenId}` — unique across the gentk FA2s. */
export type TokenKey = string

export function tokenKey(contract: string, tokenId: string): TokenKey {
  return `${contract}:${tokenId}`
}

async function contractTokenIds(
  contract: string,
  issuerId: string,
  signal?: AbortSignal,
): Promise<string[]> {
  const ids: string[] = []
  for (let offset = 0; ; offset += PAGE) {
    const url =
      `${TZKT_BASE}/v1/contracts/${contract}/bigmaps/token_data/keys` +
      `?value.issuer_id=${issuerId}&limit=${PAGE}&offset=${offset}&select=key`
    const res = await fetch(url, { signal })
    if (!res.ok) throw new Error(`TzKT HTTP ${res.status} for ${url}`)
    const page = (await res.json()) as string[]
    ids.push(...page)
    if (page.length < PAGE) return ids
  }
}

/**
 * Authoritative iteration set for one project, straight from the gentk
 * `token_data` big map (`issuer_id` per token).
 *
 * Whitehash lists iterations by name prefix (`{project} #*`) across every gentk
 * contract, which is not unique: `forsaken` (issuer 4788) and another artist's
 * `forsaken` (issuer 4789) minted the same day with the same iteration numbers,
 * and `Aura` differs from `aura` only by case. Only `issuer_id` separates them.
 */
export async function fetchIssuerTokenKeys(
  projectId: string,
  signal?: AbortSignal,
): Promise<Set<TokenKey>> {
  const issuerId = projectId.split(':')[1]
  if (!issuerId) throw new Error(`Malformed project id: ${projectId}`)

  const perContract = await Promise.all(
    GENTK_CONTRACTS.map(async (contract) => {
      const ids = await contractTokenIds(contract, issuerId, signal)
      return ids.map((tokenId) => tokenKey(contract, tokenId))
    }),
  )
  return new Set(perContract.flat())
}
