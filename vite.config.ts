import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/** GitHub Pages project site: https://<user>.github.io/fxhash2jinyao/ */
const base = process.env.VITE_BASE_PATH ?? '/fxhash2jinyao/'

export default defineConfig({
  plugins: [react()],
  base,
})
