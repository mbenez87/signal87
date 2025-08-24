import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Replace with your actual repo name:
export default defineConfig({
  plugins: [react()],
  base: 'https://app.signal87.ai/'
})
