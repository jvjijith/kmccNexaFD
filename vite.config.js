import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: "/",   // Important for Azure
  build: {
    outDir: "dist", // Default but we explicitly set it
  },
})
