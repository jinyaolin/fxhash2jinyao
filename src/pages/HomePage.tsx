import { Link } from 'react-router-dom'
import { Spinner, editionsLabel } from '@whitehash/ui'
import { ProjectCover } from '../components/ProjectCover'
import { useProjectHeader } from '../lib/projectHeader'
import {
  ARTIST,
  PROJECTS,
  SAMPLE_TOKEN,
  type CuratedProject,
} from '../data/projects'

function ProjectCard({ project }: { project: CuratedProject }) {
  const { name, description, coverUri, minted, editions, loading, error } =
    useProjectHeader(project.chain, project.projectId)

  // `name` falls back to the generated metadata, so it is set on the first
  // paint — no '…' placeholder and no bare `v2:<id>` when IPFS is throttled.
  const title = name ?? project.projectId
  const editionsText = editionsLabel(minted, editions)

  return (
    <Link className="card" to={`/works/${project.slug}`}>
      <ProjectCover
        uri={coverUri}
        chain={project.chain}
        alt={title}
        className="card-cover"
      />
      <div className="card-body">
        <div className="card-top">
          <h2>{title}</h2>
          <span className="year">{project.projectId}</span>
        </div>
        {description ? (
          <p className="card-desc">{description}</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : loading ? (
          <p>
            <Spinner />
          </p>
        ) : null}
        {editionsText ? <p className="card-meta">{editionsText}</p> : null}
      </div>
    </Link>
  )
}

export function HomePage() {
  return (
    <main className="page">
      <header className="hero">
        <p className="eyebrow">fxhash → self-hosted</p>
        <h1>{ARTIST.name}</h1>
        <p className="lede">
          On-chain fxhash projects via Whitehash. Previews and live renders resolve
          from Tezos + IPFS — no fxhash platform backend.
        </p>
        <p className="meta">
          <span>{PROJECTS.length} projects</span>
          <span aria-hidden>·</span>
          <span className="mono">{ARTIST.tezos}</span>
        </p>
      </header>

      <section className="grid" aria-label="Works">
        {PROJECTS.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </section>

      <section className="proof">
        <h2>Live check · {SAMPLE_TOKEN.label}</h2>
        <p>Open a known token to verify preview + Run live.</p>
        <Link className="button" to="/token/sample">
          Open sample token →
        </Link>
      </section>
    </main>
  )
}
