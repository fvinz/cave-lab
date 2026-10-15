# Sondaggio "Le mete di novembre" — Pe' Fratte

Design approvato in conversazione il 15 ottobre 2026. Questo documento è la base per il piano di implementazione.

## 1. Obiettivo

La community Pe' Fratte sceglie le uscite di novembre votando sulla pagina `/pe-fratte`.

- Circa 15 mete candidate. Ogni persona ne vota **esattamente tre**, tutte con lo stesso peso.
- Si vota **una volta per dispositivo**. Il voto è definitivo.
- La classifica parziale si vede **solo dopo aver votato**.
- Il sondaggio resta aperto da **lunedì 19 ottobre** a **giovedì 22 ottobre 2026 notte**, ora italiana. Gli orari esatti sono un dato di lancio (§10).
- Alla chiusura la classifica **non** si vede subito. Diventa pubblica **venerdì 23 ottobre alle 18:00**, il giorno dopo, per tutti allo stesso momento, con le **prime tre** mete evidenziate come mete di novembre. Nella pausa nessuno la vede, nemmeno chi ha votato.

**Criteri di successo**

- Chi arriva dal link nel gruppo WhatsApp vota da telefono in meno di un minuto, senza registrarsi.
- I conteggi sono esatti: un voto accettato conta una volta sola, uno respinto non conta.
- Apertura e chiusura avvengono da sole all'ora stabilita, senza interventi manuali.
- Nessun dato personale in chiaro.

## 2. Decisioni prese

| Tema | Decisione |
|---|---|
| Anti-doppioni | Livello **leggero**: un codice casuale nel browser, verificato dal server, più un tetto di voti per rete. Nessuna impronta del dispositivo, nessuna verifica di identità. |
| Scheda di ogni meta | Nome, zona, difficoltà e, se forniti, km, dislivello e durata. Niente foto. |
| Risultati parziali | Classifica con numero di voti, le proprie tre scelte evidenziate e il totale dei votanti. Niente percentuali. |
| Dopo la chiusura | Attesa fino alle 18:00 del giorno dopo: niente classifica per nessuno, chi ha votato vede solo le sue tre scelte. Poi classifica finale per tutti, prime 3 evidenziate. La sezione resta finché non viene disattivata. (Modifica richiesta il 15 ottobre, dopo l'approvazione della spec.) |
| Architettura | Funzione Vercel (`api/sondaggio`) con database Upstash Redis dal marketplace Vercel. |
| Regione | Funzione fissata a Francoforte (`fra1`) in `vercel.json`, nella stessa regione del database Redis (Frankfurt, nessuna regione di lettura). |
| Prima dell'apertura | La sezione non compare. |
| Ordine delle mete | Mescolato per dispositivo, poi stabile su quel dispositivo. |

**Stato verificato il 15 ottobre**

- Il progetto Vercel `cave-lab` ha come regione predefinita delle funzioni `iad1` (Washington). Per questo la regione va fissata nel repo.
- Upstash Redis è già collegato al progetto: le variabili `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN`, `KV_URL` e `REDIS_URL` sono presenti per sviluppo, anteprima e produzione.
- I tre ambienti usano lo stesso database. La separazione tra voti di prova e voti veri è quindi obbligatoria (§5).

## 3. Architettura

```
Browser (/pe-fratte)                       Vercel, fra1                   Upstash Redis, Frankfurt
┌─────────────────────────┐   GET/POST    ┌──────────────────────┐       ┌────────────────────────┐
│ Sondaggio.jsx           │ ────────────▶ │ api/sondaggio.js     │ ────▶ │ sondaggio:<env>:<id>:* │
│ useSondaggio.js         │ ◀──────────── │  └ api/_lib/regole.js │ ◀──── │                        │
│ (codice in localStorage)│     JSON      │  └ api/_lib/archivio │       └────────────────────────┘
└─────────────────────────┘               └──────────────────────┘
            ▲                                        ▲
            └──── src/pe-fratte/sondaggio.config.js ─┘  (stessa configurazione per pagina e server)
```

**Unità e responsabilità**

| Unità | Responsabilità | Dipende da |
|---|---|---|
| `src/pe-fratte/sondaggio.config.js` | Solo dati: id del sondaggio, attivazione, orari, numero di voti e di vincitrici, tetto per rete, mete. Nessuna logica. | Niente |
| `api/_lib/regole.js` | Funzioni pure: stato del sondaggio a un dato istante, validazione della scelta, validazione del codice, classifica e vincitrici con pari merito. | Configurazione |
| `api/_lib/archivio.js` | Accesso ai dati, con due implementazioni della stessa interfaccia: Redis (produzione e anteprima) e memoria (sviluppo locale e test). | `@upstash/redis` |
| `api/_lib/gestore.js` | Gestisce una richiesta: `({ metodo, token, mete, ip, ora }, archivio) → { status, corpo }`. Non conosce né HTTP né Redis. | Regole, interfaccia dell'archivio |
| `api/sondaggio.js` | Adattatore HTTP Vercel con firma Web (`GET` e `POST`, Request → Response). Legge l'IP, crea l'archivio Redis, chiama il gestore. | Gestore, archivio |
| `src/pe-fratte/useSondaggio.js` | Lato browser: crea e conserva il codice, legge lo stato, invia il voto, espone gli stati alla UI. | Configurazione, `fetch` |
| `src/pe-fratte/Sondaggio.jsx` | Sezione della pagina: elenco da votare, classifica, messaggi. Non applica regole: mostra quello che dice il server. | Hook, configurazione, componenti esistenti |

I file sotto `api/_lib/` non diventano funzioni, perché iniziano con underscore.

## 4. Configurazione

```js
// src/pe-fratte/sondaggio.config.js
export const SONDAGGIO = {
  id: "novembre-2026",
  attivo: true,                                // false = sezione e API spente
  apertura: "2026-10-19T<HH:MM>:00+02:00",     // dato di lancio (§10)
  chiusura: "2026-10-22T<HH:MM>:00+02:00",     // dato di lancio (§10)
  pubblicazione: "2026-10-23T18:00:00+02:00",  // la classifica diventa pubblica
  voti: 3,
  vincitrici: 3,
  tettoPerRete: 10,
  mete: [
    // id stabile (slug), mai riusato né rinominato dopo l'apertura
    { id: "monte-esempio", nome: "Monte Esempio", zona: "Monti Simbruini",
      difficolta: "intermedia", km: "9,4", dislivello: 410, durata: "3–4 h" },
  ],
};
```

- Gli orari hanno l'offset esplicito `+02:00`: dal 19 al 22 ottobre vale ancora l'ora legale, che finisce il 25.
- `difficolta` usa le chiavi già presenti in `PE_FRATTE.difficolta` (`facile`, `intermedia`, `impegnativa`).
- `km`, `dislivello` e `durata` sono facoltativi e seguono il formato di `percorso` in `EVENTI`. Un dato non fornito non si mostra e non si inventa.
- Pagina e server importano lo stesso file, quindi elenco e orari non possono divergere.

## 5. Dati in Redis

Prefisso delle chiavi: `sondaggio:<env>:<id>:`.

- `<env>` è `VERCEL_ENV` (`production`, `preview`) oppure `development` in locale.
- Anteprima e produzione scrivono in spazi separati, anche se il database è lo stesso.

| Chiave | Tipo | Contenuto | Scadenza |
|---|---|---|---|
| `schede` | hash | codice → `{"mete":[a,b,c],"t":"<ISO>"}` | Nessuna |
| `conteggi` | hash | id meta → numero di voti | Nessuna |
| `rete:<hash>` | stringa | Voti accettati da quella rete | Chiusura + 7 giorni |

- **Votanti** = `HLEN schede`.
- **Hash della rete**: HMAC-SHA256 dell'IP, con chiave `KV_REST_API_TOKEN` + id del sondaggio. Non è reversibile e non serve un'altra variabile d'ambiente.
- **Registrazione del voto**: un unico script Lua (`EVAL`), quindi atomico:
  1. Se `rete:<hash>` ha raggiunto il tetto, risponde `tetto`.
  2. Altrimenti `HSETNX schede <codice> …`. Se la scheda esiste già, risponde `gia-votato`.
  3. Altrimenti `HINCRBY conteggi` per ognuna delle tre mete, `INCR rete:<hash>` con `EXPIREAT` e risposta `ok`.

  Due invii simultanei dallo stesso codice producono quindi una sola scheda.

## 6. API

`/api/sondaggio`, sempre con `Cache-Control: no-store`.

**`GET ?token=<uuid>`**

Risponde `200` con:

```json
{
  "stato": "prima" | "aperto" | "attesa" | "chiuso",
  "haVotato": true,
  "scelte": ["id", "id", "id"],
  "risultati": {
    "votanti": 42,
    "mete": [{ "id": "…", "voti": 23 }],
    "vincitrici": ["…"],
    "pariMerito": false
  }
}
```

- `scelte` c'è solo se `haVotato`.
- `risultati` c'è solo nella risposta `200` al voto appena accettato (stato `aperto`), oppure se lo stato è `chiuso`. Rileggendo lo stato (GET, anche dopo aver votato), con un `409` e per tutti durante l'`attesa` il server non restituisce la classifica. (Modifica del 15 ottobre: la classifica parziale si vede solo subito dopo il voto; ricaricando torna nascosta.)
- `vincitrici` e `pariMerito` ci sono solo se lo stato è `chiuso`.
- `mete` è ordinata per voti decrescenti, poi per nome.

**`POST`** con corpo `{ "token": "<uuid>", "mete": ["id","id","id"] }`

| Esito | Status | Corpo |
|---|---|---|
| Voto accettato | `200` | Come il GET, con `haVotato: true` |
| Scheda già presente per quel codice | `409` `gia-votato` | Stato e risultati |
| Votazione chiusa | `403` `chiuso` | Stato; risultati finali solo se lo stato è `chiuso` (non durante l'`attesa`) |
| Sondaggio non ancora aperto | `403` `prima` | Nessun risultato |
| Codice non valido, mete diverse da 3, ripetute o inesistenti | `400` `scelta-non-valida` | — |
| Tetto per rete raggiunto | `429` `tetto` | — |

**Regole comuni**

- Il codice deve essere un UUID v4.
- `attivo: false` restituisce `404` su tutto.
- Metodi diversi da GET e POST restituiscono `405`.
- Lo stato dipende **solo dall'orologio del server**:
  - `prima` se l'ora è prima di `apertura`;
  - `aperto` fino a `chiusura` esclusa;
  - `attesa` da `chiusura` a `pubblicazione` esclusa;
  - `chiuso` da `pubblicazione` in poi.
- L'IP arriva dalla prima voce di `x-forwarded-for`, che su Vercel è impostata dalla piattaforma.

**Vincitrici e pari merito**

1. Si ordinano le mete per voti.
2. La soglia è il numero di voti della meta in posizione `vincitrici` (la terza).
3. Vincono tutte le mete con voti uguali o superiori alla soglia e almeno un voto.
4. `pariMerito` vale `true` se le vincitrici sono più di `vincitrici`.

## 7. Pagina `/pe-fratte`

**Posizione**

- La sezione `id="sondaggio"` sta subito dopo la hero, prima di "Prossime uscite", sul fondo notte.
- Link diretto da condividere: `/pe-fratte#sondaggio`.
- Mentre il voto è aperto, secondo l'orologio locale e la configurazione:
  - il bottone oro della hero diventa "Vota le mete di novembre" e porta alla sezione;
  - "Entra nella community" passa a secondario;
  - "Vedi le uscite" si nasconde.

  Chiuso il voto, la hero torna com'è oggi.

**Caricamento**

- La pagina decide se mostrare la sezione dall'orologio locale e dalla configurazione, e disegna subito l'elenco delle mete.
- Poi chiede lo stato al server, che decide.
- Se il server risponde `haVotato` o `chiuso`, la sezione passa alla classifica.
- Se orologio locale e server non concordano, vince il server.

**Stati**

| Stato | Cosa si vede |
|---|---|
| `prima` | Nessuna sezione. |
| `aperto`, non votato | `fieldset` con legenda, una riga per meta (checkbox nativa con aspetto a riga), contatore "N di 3", bottone "Conferma il voto, non si può cambiare". |
| `aperto`, appena votato | Classifica parziale, "Il tuo voto" sulle tre scelte, totale dei votanti, "Si chiude giovedì alle HH:MM", nota che la si vede solo adesso. |
| `aperto`, votato e pagina riaperta | "Hai già votato" con le tre scelte e l'ora della classifica finale. Nessuna classifica. Nella hero torna l'oro su "Entra nella community". |
| `attesa` | "Il sondaggio è chiuso, la classifica esce venerdì 23 ottobre alle 18:00". Chi ha votato vede anche le sue tre scelte. Nessuna classifica. |
| `chiuso` | Classifica finale, prime tre (o le pari merito) evidenziate come mete di novembre, nota sul pari merito se serve, "Il tuo voto" se hai votato. |

**Scegliere le mete**

- Ogni card ha le stesse righe nello stesso posto: nome (sempre due righe), zona (una riga), `DatiSentiero` (una riga), in fondo `DifficoltaBadge` e il link "Vedi su komoot" alla scheda del percorso (campo `link`, nuova scheda, non seleziona la meta). Tutte le card hanno la stessa altezza. (Modifica del 15 ottobre.)
- Alla terza scelta le righe non scelte si disattivano ma restano leggibili; togliendo una scelta si riattivano.
- Con meno di tre scelte il bottone è disattivato e dice quante ne mancano.
- Su telefono, contatore e bottone stanno in una barra fissa in basso finché la sezione è visibile.
- L'ordine è mescolato con un seme ricavato dal codice del dispositivo: stabile su quel dispositivo, diverso tra dispositivi.

**Classifica**

- Elenco ordinato. Ogni voce ha nome, barra proporzionale alla meta più votata e "N voti".
- Si aggiorna al caricamento della pagina, non in tempo reale.
- Dopo il voto il focus passa al titolo della classifica.

**Messaggi d'errore**

| Caso | Comportamento |
|---|---|
| Rete assente all'invio | Le scelte restano e compare "Riprova". |
| `409 gia-votato` | Passa alla classifica. |
| `403 chiuso` durante la scelta | Messaggio d'attesa (o classifica finale, se già pubblicata) con l'avviso "il voto non è stato contato". |
| `429 tetto` | Spiega il limite e suggerisce di riprovare con la rete dati del telefono. |
| Server irraggiungibile al caricamento | "Sondaggio non raggiungibile, riprova tra poco". Il resto della pagina funziona. |
| `localStorage` non disponibile | Il codice vale solo per la visita in corso. È un limite accettato. |

**Aspetto e accessibilità**

- Design system Pe' Fratte: oro solo sul bottone di conferma e sulla CTA della hero, niente foglie nella sezione.
- Contrasto almeno AA.
- Uso completo da tastiera.
- Contatore ed esiti annunciati con `aria-live="polite"`.
- Barre nascoste ai lettori di schermo: il dato è nel testo "N voti".
- Animazione delle barre solo senza `prefers-reduced-motion`.

**Testi**

I testi in questo documento indicano la funzione di ogni elemento. La formulazione finale si decide in implementazione, nella voce di Pe' Fratte e senza trattini lunghi.

## 8. Privacy

- Il codice nel browser (chiave `pf-sondaggio`) serve solo a far funzionare il voto richiesto da chi visita. È uno strumento tecnico necessario e non passa dal banner cookie.
- Si aggiorna `public/privacy/index.html` con:
  - un paragrafo sul sondaggio: cosa si salva, a cosa serve, per quanto tempo;
  - una riga nella tabella degli strumenti per `pf-sondaggio`.
- Si conservano solo l'hash della rete (cancellato da solo 7 giorni dopo la chiusura) e le schede anonime (tre mete e orario), finché non si decide di cancellarle.

## 9. Sviluppo locale e test

**Sviluppo locale**

- Un plugin in `vite.config.js` monta lo stesso gestore su `/api/sondaggio` durante `npm run dev`, con l'archivio in memoria.
- Non serve Redis e non serve `vercel dev`.
- Una variabile d'ambiente locale permette di forzare l'ora del server di sviluppo per provare i tre stati. Esiste solo nel plugin di sviluppo, mai nella funzione di produzione.

**Test automatici**

Si usa `node --test`, senza nuove dipendenze, con lo script `"test"` in `package.json`. I test coprono:

| Unità | Cosa si verifica |
|---|---|
| Regole | Limiti esatti di apertura, chiusura e pubblicazione; scelte valide e non valide (2 o 4 mete, ripetute, inesistenti); formato del codice; ordinamento; vincitrici con e senza pari merito, anche a cavallo della terza posizione e con mete a zero voti. |
| Gestore, con archivio in memoria | Voto accettato; doppio voto → 409; voto prima e dopo la finestra; tetto per rete; classifica negata a chi non ha votato; classifica negata a tutti durante l'attesa; classifica finale pubblica dopo la pubblicazione; `attivo: false` → 404. |
| Archivio Redis | Non coperto dai test automatici. Script Lua, prefissi e scadenze si verificano contro il database reale durante la prova in anteprima, sotto il prefisso `preview`. |

**Prova in anteprima**

1. Su un branch dedicato, un commit temporaneo imposta id `prova-<data>` e una finestra di pochi minuti.
2. Sull'URL di anteprima si percorrono da telefono e da desktop tutti gli stati e gli errori del §7.
3. Il commit successivo ripristina la configurazione reale.
4. Le chiavi scritte stanno sotto `sondaggio:preview:prova-…`, quindi non toccano la produzione.

**Verifica visiva**

Anteprima del dev server, a 375 px e su desktop, con `prefers-reduced-motion` attivo e non.

## 10. Lancio e gestione

**Dati di lancio, forniti dall'utente prima della pubblicazione**

1. Elenco delle mete, con zona, difficoltà e i dati sentiero disponibili.
2. Ora di apertura di lunedì 19 ottobre.
3. Ora di chiusura di giovedì 22 ottobre. La pubblicazione della classifica è fissata a venerdì 23 ottobre alle 18:00.

Senza questi dati si sviluppa e si prova con valori finti. Non si pubblica in produzione finché non sono nella configurazione.

**Controlli prima del merge in `main`**

- `id` reale.
- Orari con `+02:00`.
- Nessun residuo della prova in anteprima.
- `regions: ["fra1"]` in `vercel.json`.
- Test verdi.
- Build pulita.

**Pubblicazione**

- Merge prima di lunedì. La sezione resta invisibile fino all'apertura; chiusura e pubblicazione della classifica avvengono da sole.
- Durante l'attesa gli organizzatori possono già leggere i voti con lo script (§10, "Controllare le schede").
- Il link `/pe-fratte#sondaggio` lo condivide la community nel gruppo WhatsApp.

**Durante e dopo**

| Azione | Come |
|---|---|
| Cambiare un orario o fermare | Modificare la configurazione e ripubblicare. |
| Controllare le schede | `scripts/sondaggio-schede.mjs` stampa in CSV orario e tre mete per scheda, senza codici. Usa le credenziali scaricate con `vercel env pull .env.local`, già escluso da git con `*.local`. |
| Togliere la sezione | `attivo: false`. |
| Cancellare le schede | Su richiesta. |

**Costi**: funzione e database rientrano nei piani gratuiti di Vercel e Upstash a questi volumi.

## 11. File toccati

| File | Cosa |
|---|---|
| `src/pe-fratte/sondaggio.config.js` | Nuovo |
| `api/sondaggio.js` | Nuovo |
| `api/_lib/regole.js`, `api/_lib/archivio.js`, `api/_lib/gestore.js` | Nuovi |
| `src/pe-fratte/useSondaggio.js`, `src/pe-fratte/Sondaggio.jsx` | Nuovi |
| `src/pe-fratte/PeFratte.jsx` | Montaggio della sezione, hero durante il voto, estrazione di `DifficoltaBadge` e `DatiSentiero` per riusarli |
| `src/pe-fratte/pe-fratte.css` | Stili della sezione |
| `public/privacy/index.html` | Paragrafo e riga di tabella |
| `vercel.json` | `"regions": ["fra1"]` |
| `vite.config.js` | Gestore montato in sviluppo |
| `package.json` | Dipendenza `@upstash/redis`, script `test` |
| `scripts/sondaggio-schede.mjs` | Nuovo |
| Test sotto `api/_lib/` | Nuovi |

## 12. Fuori dal perimetro

- Pagina di amministrazione.
- Aggiornamento dei risultati in tempo reale.
- Modifica o annullamento del voto.
- Voti con peso diverso.
- Captcha.
- Impronta del dispositivo o verifica dell'identità.
- Foto delle mete.
- Annuncio prima dell'apertura.
- Notifiche.
