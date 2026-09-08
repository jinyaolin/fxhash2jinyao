import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { WhitehashProvider } from '@whitehash/ui'
import '@whitehash/ui/styles.css'
import { HomePage } from './pages/HomePage'
import { WorkPage } from './pages/WorkPage'
import { TokenPage } from './pages/TokenPage'
import './App.css'

/** Must match Vite `base` (no trailing slash for react-router). */
const BASENAME = import.meta.env.BASE_URL.replace(/\/$/, '') || ''

/**
 * Whitehash defaults to ipfs.io + dweb.link, tried in order with one attempt
 * each and no backoff. Both are Protocol Labs and now rate-limit *every*
 * request, not just bursts: they answer 429 even for the canonical IPFS test
 * CID, and the 429 body has no cross-origin header, so the browser reports it
 * as ERR_BLOCKED_BY_RESPONSE.NotSameOrigin rather than a plain HTTP error.
 *
 * Measured on the live home page: 25 requests to ipfs.io and 25 to dweb.link,
 * all failed; 25 to gateway.pinata.cloud, all 200. Every asset was paying two
 * failed round-trips before reaching a gateway that works, and 5 of the 17
 * covers gave up before getting there.
 *
 * So the order below leads with gateways that were actually verified to serve
 * these CIDs (all 34 of them, with `Access-Control-Allow-Origin: *`):
 * fxhash's own gateway first — it is the one place guaranteed to keep fxhash
 * content pinned — then Pinata. ipfs.io stays last purely as a safety net in
 * case the others change.
 */
const WHITEHASH_CONFIG = {
  resolver: {
    ipfsGateways: [
      'https://gateway.fxhash.xyz',
      'https://gateway.pinata.cloud',
      'https://4everland.io',
      'https://ipfs.io',
    ],
  },
}

export default function App() {
  return (
    <WhitehashProvider config={WHITEHASH_CONFIG}>
      <BrowserRouter basename={BASENAME}>
        <div className="shell">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/works/:slug" element={<WorkPage />} />
            <Route path="/token/sample" element={<TokenPage />} />
            <Route
              path="/token/:contract/:tokenId"
              element={<TokenPage />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </WhitehashProvider>
  )
}
