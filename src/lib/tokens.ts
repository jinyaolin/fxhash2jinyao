import type { WhitehashToken } from '@whitehash/chain-reader'
import { tokenKey, type TokenKey } from './issuerTokens'

/** Parse edition number from on-chain token name (`… #12`). */
export function tokenIteration(token: WhitehashToken): number | null {
  const match = token.name?.match(/#(\d+)\s*$/)
  if (match) return Number(match[1])
  return null
}

/**
 * Whitehash lists Tezos iterations with TzKT `metadata.name.as={name} #*`,
 * which is case-insensitive — so "aura" also matches another artist's "Aura".
 * Keep only the exact on-chain project name prefix.
 */
export function tokenBelongsToProject(
  token: WhitehashToken,
  projectName: string | null | undefined,
): boolean {
  if (!projectName || !token.name) return false
  return token.name.startsWith(`${projectName} #`)
}

export function shouldShowToken(
  token: WhitehashToken,
  options: {
    projectName?: string | null
    hideIterationsThrough?: number
    /**
     * Token ids minted from this project's issuer. Name matching alone is not
     * unique — two different `forsaken` projects share names *and* iteration
     * numbers — so when the set is loaded it is the deciding filter.
     */
    issuerTokenKeys?: Set<TokenKey> | null
  } = {},
): boolean {
  if (
    options.projectName &&
    !tokenBelongsToProject(token, options.projectName)
  ) {
    return false
  }
  if (
    options.issuerTokenKeys &&
    !options.issuerTokenKeys.has(tokenKey(token.contract, token.tokenId))
  ) {
    return false
  }
  if (options.hideIterationsThrough == null) return true
  const iteration = tokenIteration(token)
  if (iteration == null) return true
  return iteration > options.hideIterationsThrough
}
