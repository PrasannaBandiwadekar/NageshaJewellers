import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite is the tool that runs our React app during development and
// "builds" it into final files when we're ready to publish the site.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
})
