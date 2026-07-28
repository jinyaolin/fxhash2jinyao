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
 * each and no backoff. Both are Protocol Labs and rate-limit a burst, which on
 * the 17-card home page shows up as missing titles and covers. Two more CORS-
 * enabled public gateways to fall through to.
 */
const WHITEHASH_CONFIG = {
  resolver: {
    ipfsGateways: [
      'https://ipfs.io',
      'https://dweb.link',
      'https://gateway.pinata.cloud',
      'https://4everland.io',
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
