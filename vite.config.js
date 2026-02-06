import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Borra o comenta la línea de 'base' para Netlify
  plugins: [
    react(),
    tailwindcss(), 
  ],
})