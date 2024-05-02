import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  envPrefix: "PUB_",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shadcn": path.resolve(__dirname, "./src/components/shadcn")
    }
  }
})
