import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useProject } from '@whitehash/react'
import {
  Artwork,
  Badge,
  Button,
  Card,
  SortToggle,
  Spinner,
  chainLabel,
  editionsLabel,
} from '@whitehash/ui'
import type { ListOrder, WhitehashToken } from '@whitehash/chain-reader'
import { ProjectCover } from '../components/ProjectCover'
import {
  getProject,
  SAMPLE_TOKEN,
  type CuratedProject,
} from '../data/projects'
import { PROJECT_META } from '../data/projectMeta.generated'
import { shouldShowToken } from '../lib/tokens'
import { fetchIssuerTokenKeys, type TokenKey } from '../lib/issuerTokens'

function ArtworkCard({
  token,
  onOpen,
}: {
  token: WhitehashToken
  onOpen?: (token: WhitehashToken) => void
}) {
  return (
    <button
      type="button"
      className="token-card"
      onClick={onOpen ? () => onOpen(token) : undefined}
    >
      <Card.Root>
        <Card.Media>
          <Artwork.Root token={token}>
            <Artwork.Image source="thumbnail" />
          </Artwork.Root>
        </Card.Media>
        <Card.Body>
          <Card.Title>{token.name ?? `#${token.tokenId}`}</Card.Title>
          <Card.Meta>
            <Badge>{chainLabel(token.chain)}</Badge>
          </Card.Meta>
        </Card.Body>
      </Card.Root>
    </button>
  )
}

function WorkPageContent({
  projectRef,
  slug,
}: {
  projectRef: CuratedProject
  slug: string
}) {
  const navigate = useNavigate()
  const [order, setOrder] = useState<ListOrder>('oldest')

  const { project, tokens, loading, error, hasMore, loadMore } = useProject(
    { chain: projectRef.chain, id: projectRef.projectId },
    { order },
  )

  // Same floor as the home page: when the IPFS metadata fetch is throttled the
  // reader returns a project with null name/cover, and the header would show a
  // bare `v2:<id>`. The generated values are the identical on-chain metadata.
  const baked = PROJECT_META[projectRef.projectId]
  const projectName = project?.name ?? baked?.name ?? null

  // Which iterations actually came from this issuer. Null while in flight —
  // until it resolves we must not render, or another artist's same-named
  // tokens flash in first.
  const [issuerTokenKeys, setIssuerTokenKeys] = useState<Set<TokenKey> | null>(
    null,
  )
  const [issuerError, setIssuerError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setIssuerTokenKeys(null)
    setIssuerError(null)
    fetchIssuerTokenKeys(projectRef.projectId, controller.signal)
      .then(setIssuerTokenKeys)
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setIssuerError(err instanceof Error ? err.message : String(err))
      })
    return () => controller.abort()
  }, [projectRef.projectId])

  const visibleTokens = useMemo(
    () =>
      issuerTokenKeys
        ? tokens.filter((token) =>
            shouldShowToken(token, {
              projectName,
              hideIterationsThrough: projectRef.hideIterationsThrough,
              issuerTokenKeys,
            }),
          )
        : [],
    [tokens, projectName, projectRef.hideIterationsThrough, issuerTokenKeys],
  )

  // Whitehash pages by name match, so a page can be mostly another issuer's
  // tokens (aura/Aura, forsaken/forsaken). Pull more until the grid is filled.
  useEffect(() => {
    if (!projectName || !issuerTokenKeys) return
    if (loading || !hasMore) return
    if (tokens.length === 0) return
    if (visibleTokens.length >= 12) return
    void loadMore()
  }, [
    projectName,
    issuerTokenKeys,
    loading,
    hasMore,
    tokens.length,
    visibleTokens.length,
    loadMore,
  ])

  const onOpenToken = (token: WhitehashToken) => {
    navigate(
      `/token/${token.contract}/${token.tokenId}?from=${encodeURIComponent(slug)}`,
    )
  }

  const title = projectName ?? projectRef.projectId
  const description = project?.description ?? baked?.description ?? null
  const label = project
    ? editionsLabel(project.minted, project.editions)
    : ''
  const coverUri =
    project?.displayUri ??
    project?.thumbnailUri ??
    baked?.displayUri ??
    baked?.thumbnailUri ??
    null

  return (
    <main className="page wide">
      <nav className="crumb">
        <Link to="/">Works</Link>
        <span aria-hidden>/</span>
        <span>{title}</span>
      </nav>

      <header className="work-head">
        <ProjectCover
          uri={coverUri}
          chain={projectRef.chain}
          alt={title}
          className="work-cover"
        />
        <div className="work-head-copy">
          <h1>{title}</h1>
          {description ? <p>{description}</p> : null}
          <p className="meta">
            {projectRef.projectId}
            {label ? ` · ${label}` : ''}
          </p>
          {projectRef.slug === SAMPLE_TOKEN.slug && (
            <Link className="button" to="/token/sample">
              Sample · {SAMPLE_TOKEN.label}
            </Link>
          )}
        </div>
      </header>

      <section className="gallery">
        <div className="gallery-toolbar">
          <Button variant="link" onClick={() => navigate('/')}>
            ← All Projects
          </Button>
          <SortToggle order={order} onChange={setOrder} />
        </div>

        {error ? <p className="error">{error}</p> : null}
        {issuerError ? (
          <p className="error">Could not read issuer tokens: {issuerError}</p>
        ) : null}

        {(loading || !issuerTokenKeys) && visibleTokens.length === 0 ? (
          <div className="page center">
            <Spinner />
          </div>
        ) : (
          <div className="token-grid">
            {visibleTokens.map((token) => (
              <ArtworkCard
                key={`${token.chain}:${token.contract}:${token.tokenId}`}
                token={token}
                onOpen={onOpenToken}
              />
            ))}
          </div>
        )}

        <div className="gallery-footer">
          {loading && visibleTokens.length > 0 ? (
            <p className="meta">Loading more…</p>
          ) : null}
          {!loading && issuerTokenKeys && hasMore ? (
            <Button variant="link" onClick={() => void loadMore()}>
              Load More
            </Button>
          ) : null}
          {!loading &&
          issuerTokenKeys &&
          visibleTokens.length === 0 &&
          !error ? (
            <p className="meta">No minted iterations found.</p>
          ) : null}
        </div>
      </section>
    </main>
  )
}

export function WorkPage() {
  const { slug = '' } = useParams()
  const projectRef = getProject(slug)

  if (!projectRef) {
    return (
      <main className="page">
        <p>Project not found.</p>
        <Link to="/">← Works</Link>
      </main>
    )
  }

  return <WorkPageContent projectRef={projectRef} slug={slug} />
}
