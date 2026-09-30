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
        // Pagina statica dell'informativa privacy (public/privacy/)
        if (url === '/privacy' || url === '/privacy/') {
          req.url = '/privacy/index.html'
        }
        // Pagina Pe' Fratte (seconda entry della build: pe-fratte/index.html)
        if (url === '/pe-fratte') {
          req.url = '/pe-fratte/'
        }
        next()
      })
    },
  }
}

/* Lo strumento impeccable (modalità live) inserisce in index.html uno script
   da http://localhost:8400 tra i marker impeccable-live-start/end. Se finisce
   in un commit, in produzione (https) verrebbe bloccato come contenuto misto:
   in build lo togliamo comunque da tutte le pagine HTML. */
function stripImpeccableLive() {
  return {
    name: 'strip-impeccable-live',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(
        /[ \t]*<!-- impeccable-live-start -->[\s\S]*?<!-- impeccable-live-end -->\n?/g,
        ''
      )
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), leagueSpaFallback(), stripImpeccableLive()],
  build: {
    /* Due pagine nella stessa build: la home Cave Lab e /pe-fratte/,
       ognuna con il proprio CSS (i due design system non si mescolano). */
    rollupOptions: {
      input: {
        main: 'index.html',
        peFratte: 'pe-fratte/index.html',
      },
    },
  },
  server: {
    /* Rispetta la porta assegnata dall'ambiente (il dev server di un
       altro progetto occupa spesso la 5173). */
    port: Number(process.env.PORT) || undefined,
  },
})
