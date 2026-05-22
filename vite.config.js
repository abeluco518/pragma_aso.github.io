// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        verification:'google76365b1ad045cc01.html',
        qui:'qui-som.html',
        help:'help.html',
        donate:'donate.html',
        contacte:'contacte.html',
        
        
        // Añade aquí todos los html que quieras incluir
      }
    }
  },
  base: './'
})
