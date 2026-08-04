import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/* In sviluppo serve l'app Cave League (public/league/) anche su /league/
   e sui suoi percorsi interni (/league/classifica, ...), replicando i
   rewrite di produzione (vercel.json / public/_redirects). */
function leagueSpaFallback() {
  return {
    name: 'league-spa-fallback',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = req.url.split('?')[0]
        const isLeagueRoute = url === '/league' || url.startsWith('/league/')
        const isFile = /\.[a-z0-9]+$/i.test(url)
        if (isLeagueRoute && !isFile) {
          req.url = '/league/index.html'
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), leagueSpaFallback()],
  server: {
    /* Rispetta la porta assegnata dall'ambiente (il dev server di un
       altro progetto occupa spesso la 5173). */
    port: Number(process.env.PORT) || undefined,
  },
})
