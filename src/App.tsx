import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { WhitehashProvider } from '@whitehash/ui'
import '@whitehash/ui/styles.css'
import { HomePage } from './pages/HomePage'
import { WorkPage } from './pages/WorkPage'
import { TokenPage } from './pages/TokenPage'
import './App.css'

/** Must match Vite `base` (no trailing slash for react-router). */
const BASENAME = import.meta.env.BASE_URL.replace(/\/$/, '') || ''

export default function App() {
  return (
    <WhitehashProvider>
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
