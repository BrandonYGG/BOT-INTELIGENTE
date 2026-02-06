import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/BOT-INTELIGENTE/', // <--- Agrega esta línea aquí
  plugins: [
    react(),
    tailwindcss(), 
  ],
})