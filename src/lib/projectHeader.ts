import { useEffect, useState } from 'react'
import { useWhitehash } from '@whitehash/react'
import type { ChainId, WhitehashProject } from '@whitehash/chain-reader'
import { PROJECT_META } from '../data/projectMeta.generated'

export type ProjectHeader = {
  name: string | null
  description: string | null
  coverUri: string | null
  minted: number | null
  editions: number | null
  loading: boolean
  error: string | null
}

/**
 * Project title/description/cover, with the generated metadata as a floor.
 *
 * Deliberately not `useProject()`: that also runs `listProjectTokens`, which is
 * three TzKT queries per project — 51 wasted requests on a 17-card grid whose
 * cards show no iterations. Cutting them leaves more headroom for the IPFS
 * metadata fetch that actually feeds the card.
 */
export function useProjectHeader(
  chain: ChainId,
  projectId: string,
): ProjectHeader {
  const { client } = useWhitehash()
  const [onChain, setOnChain] = useState<WhitehashProject | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setOnChain(null)
    setLoading(true)
    setError(null)
    client
      .getProject({ chain, id: projectId })
      .then((value) => {
        if (!cancelled) setOnChain(value)
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : String(cause))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [client, chain, projectId])

  const baked = PROJECT_META[projectId]

  return {
    name: onChain?.name ?? baked?.name ?? null,
    description: onChain?.description ?? baked?.description ?? null,
    coverUri:
      onChain?.displayUri ??
      onChain?.thumbnailUri ??
      baked?.displayUri ??
      baked?.thumbnailUri ??
      null,
    minted: onChain?.minted ?? null,
    editions: onChain?.editions ?? null,
    loading,
    error,
  }
}
