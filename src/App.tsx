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
 * these CIDs (all 34 of them, with `Access-Control-Allow-Origin: *`).
 *
 * 2026-10-06 re-measured, and the picture got worse:
 *   gateway.fxhash.xyz   403 "This gateway is currently unavailable."  ← shut down
 *   gateway.pinata.cloud 200 (the only one that works, ~6.4s)
 *   4everland.io         301 → subdomain form answers 400
 *   ipfs.io / dweb.link  429 (unchanged)
 *   w3s.link             301 → subdomain form also 301
 * fxhash's gateway was FIRST in the list, so every asset paid a failed
 * round-trip to a dead host before reaching Pinata — that 403 page is exactly
 * the "gateway unavailable" the previews were showing. Dropped it, and dropped
 * 4everland too (it never served these CIDs). ipfs.io stays only as a safety
 * net in case Pinata changes.
 *
 * One working public gateway is not a healthy place to be, so the same day we
 * stood up our own: Caddy on the box that already serves jinyaolin.info answers
 * /ipfs/<cid> straight from the local backup (/root/fxhash_ipfs_backup, a
 * symlink tree built by build-gateway-index.py there). Measured against the
 * same CID: ours 22ms, Pinata 6.4s, and the bytes are identical. All 34 CIDs
 * this gallery needs are covered, so the public gateways below are now only a
 * fallback for CIDs the backup does not have yet.
 */
const WHITEHASH_CONFIG = {
  resolver: {
    ipfsGateways: [
      // 自家 gateway:直接餵本機備份(/root/fxhash_ipfs_backup),22ms、不限流、
      // 不依賴任何第三方。涵蓋這 17 件作品需要的全部 34 個 CID。
      'https://jinyaolin.info',
      // 備份裡沒有的 CID(例如以後新增作品還沒備份)才會走到這裡。
      'https://gateway.pinata.cloud',
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
