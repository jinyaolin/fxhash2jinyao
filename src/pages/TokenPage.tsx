import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { useToken } from '@whitehash/react'
import { Artwork, Spinner } from '@whitehash/ui'
import { SAMPLE_TOKEN } from '../data/projects'
import { objktTokenUrl } from '../lib/objkt'

export function TokenPage() {
  const { contract, tokenId } = useParams()
  const location = useLocation()
  const [search] = useSearchParams()
  const navigate = useNavigate()
  const from = search.get('from')

  const isSample = location.pathname === '/token/sample'
  const input = isSample
    ? {
        chain: SAMPLE_TOKEN.chain,
        contract: SAMPLE_TOKEN.contract,
        tokenId: SAMPLE_TOKEN.tokenId,
      }
    : contract && tokenId
      ? {
          chain: 'tezos:mainnet' as const,
          contract,
          tokenId,
        }
      : null

  const { token, loading, error } = useToken(input)

  if (!input) {
    return (
      <main className="page">
        <p>Missing token.</p>
        <Link to="/">← Works</Link>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="page center">
        <Spinner />
        <p>Reading token from chain…</p>
      </main>
    )
  }

  if (error || !token) {
    return (
      <main className="page">
        <p className="error">{error ?? 'Token not found'}</p>
        <Link to="/">← Works</Link>
      </main>
    )
  }

  const backTo = from ? `/works/${from}` : '/'
  const title =
    token.name ?? (isSample ? SAMPLE_TOKEN.label : `#${token.tokenId}`)
  const objktUrl = objktTokenUrl(token.contract, token.tokenId)

  return (
    <main className="page wide">
      <nav className="crumb">
        <Link to="/">Works</Link>
        {from && (
          <>
            <span aria-hidden>/</span>
            <Link to={backTo}>{from}</Link>
          </>
        )}
        <span aria-hidden>/</span>
        <span>{title}</span>
      </nav>

      <section className="viewer">
        <div className="stage">
          <Artwork.Root token={token} className="artwork-stage">
            <Artwork.Image />
            <Artwork.Live />
            <div className="stage-controls">
              <Artwork.PlayButton playLabel="Run live" stopLabel="Stop" />
              <Artwork.StatusBadge />
              <a
                className="objkt-link"
                href={objktUrl}
                target="_blank"
                rel="noreferrer"
              >
                View on objkt ↗
              </a>
            </div>
          </Artwork.Root>
        </div>

        <aside className="aside">
          <button
            type="button"
            className="text-back"
            onClick={() => navigate(backTo)}
          >
            ← Back
          </button>
          <h1 className="token-title">{title}</h1>
          <dl className="token-meta">
            <div>
              <dt>Chain</dt>
              <dd>{token.chain}</dd>
            </div>
            <div>
              <dt>Contract</dt>
              <dd className="mono">{token.contract}</dd>
            </div>
            <div>
              <dt>Token ID</dt>
              <dd>{token.tokenId}</dd>
            </div>
            {token.iterationHash && (
              <div>
                <dt>Hash</dt>
                <dd className="mono">{token.iterationHash}</dd>
              </div>
            )}
            <div>
              <dt>Marketplace</dt>
              <dd>
                <a href={objktUrl} target="_blank" rel="noreferrer">
                  objkt.com
                </a>
              </dd>
            </div>
          </dl>
          <p className="hint">
            Preview from IPFS. Run live executes the generator with the correct
            seed in a sandboxed iframe.
          </p>
        </aside>
      </section>
    </main>
  )
}
