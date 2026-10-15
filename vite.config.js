import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { SONDAGGIO } from './src/pe-fratte/sondaggio.config.js'
import { gestisci } from './api/_lib/gestore.js'
import { creaArchivioMemoria } from './api/_lib/archivio.js'
import { hashRete } from './api/_lib/rete.js'

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

/* In sviluppo /api/sondaggio risponde con lo stesso gestore della funzione
   Vercel, ma con i voti in memoria (si azzerano al riavvio): niente Redis.
   /__sondaggio?ora=<ISO>&guasto=1 sposta l'orologio del server (senza `ora`
   torna all'ora reale) e simula Redis giù (503), per provare tutti gli
   stati della pagina. Solo in `vite dev`. */
function sondaggioInSviluppo() {
  const archivio = creaArchivioMemoria()
  let oraFinta = null
  let guasto = false
  return {
    name: 'sondaggio-in-sviluppo',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__sondaggio', (req, res) => {
        const parametri = new URL(req.url, 'http://localhost').searchParams
        oraFinta = parametri.get('ora') ? new Date(parametri.get('ora')) : null
        guasto = parametri.get('guasto') === '1'
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ ora: (oraFinta ?? new Date()).toISOString(), finta: Boolean(oraFinta), guasto }))
      })
      server.middlewares.use('/api/sondaggio', async (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Cache-Control', 'no-store')
        if (guasto) {
          res.statusCode = 503
          res.end(JSON.stringify({ errore: 'servizio' }))
          return
        }
        const url = new URL(req.url, 'http://localhost')
        let corpo = null
        if (req.method === 'POST') {
          let testo = ''
          for await (const pezzo of req) testo += pezzo
          try { corpo = JSON.parse(testo) } catch { corpo = null }
        }
        const { status, corpo: risposta } = await gestisci(
          {
            metodo: req.method,
            token: req.method === 'POST' ? corpo?.token : url.searchParams.get('token'),
            mete: corpo?.mete,
            rete: hashRete(req.socket.remoteAddress ?? 'locale', 'sviluppo', SONDAGGIO.id),
            ora: oraFinta ?? new Date(),
          },
          { config: SONDAGGIO, archivio }
        )
        res.statusCode = status
        res.end(JSON.stringify(risposta))
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), leagueSpaFallback(), stripImpeccableLive(), sondaggioInSviluppo()],
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
