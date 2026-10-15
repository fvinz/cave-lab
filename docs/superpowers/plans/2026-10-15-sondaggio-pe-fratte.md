# Sondaggio "Le mete di novembre": piano di implementazione

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aggiungere a `/pe-fratte` un sondaggio in cui ogni dispositivo vota una volta tre mete su circa 15. La classifica si vede dopo il voto; alla chiusura sparisce per tutti e diventa pubblica all'ora di pubblicazione (le 18 del giorno dopo).

**Architecture:** Una funzione Vercel (`api/sondaggio.js`, regione `fra1`) è l'unico punto che legge e scrive i voti, su Upstash Redis.
- La logica sta in moduli puri sotto `api/_lib/`: regole, gestore e archivio, quest'ultimo con un'implementazione Redis e una in memoria. Sono testati con `node --test`.
- La pagina React legge la stessa configurazione, mostra lo stato che le dà il server e invia il voto.
- In sviluppo un plugin Vite monta lo stesso gestore con l'archivio in memoria.

**Tech Stack:**
- Vite 8 + React 19 (ESM, `"type": "module"`)
- Funzioni Vercel con firma Web (`GET`/`POST`: Request → Response)
- `@upstash/redis`
- `node:test` su Node 24
- GSAP ScrollTrigger, già presente

**Spec:** `docs/superpowers/specs/2026-10-15-sondaggio-pe-fratte-design.md`

## Global Constraints

- **Branch:** si lavora sul branch `feat/sondaggio-pe-fratte`. Push, preview deploy e merge in `main` solo dopo un ok esplicito dell'utente in chat.
- **Commit:** ogni messaggio termina con la riga `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Nei comandi sotto la riga è passata con un secondo `-m`. I messaggi seguono lo stile del repo: italiano, prefisso `Pe' Fratte:` o `Sondaggio:`.
- **Dipendenze:** l'unica nuova dipendenza è `@upstash/redis`. I test usano `node:test` e `node:assert/strict`, senza framework.
- **Testi visibili:** in italiano, nella voce di Pe' Fratte, **senza trattini lunghi (—)**.
- **Oro:** solo sul bottone di conferma del voto e sulla CTA della hero. Niente foglie nella sezione del sondaggio.
- **Accessibilità:** contrasto almeno AA. Le animazioni rispettano `prefers-reduced-motion`; la regola globale in `pe-fratte.css` azzera già durate e animazioni.
- **Chiave `localStorage`:** `pf-sondaggio`.
- **Prefisso Redis:** `sondaggio:<env>:<id>:`, dove `<env>` è `VERCEL_ENV` oppure `development`.
- **Regione delle funzioni:** `fra1`.
- **Orari in configurazione:** offset esplicito `+02:00`.
- **Dati sentiero:** mai inventati. Un campo mancante non si mostra.
- **Variabili Redis:** già presenti nel progetto Vercel (`KV_REST_API_URL`, `KV_REST_API_TOKEN`). Non vanno stampate né committate.

## Review Focus

1. **Corpo POST malformato.** `mete` non è un array, contiene oggetti, oppure id come `__proto__` o `constructor`; corpo `null`; codice non UUID. Atteso: `400` e nessun voto contato. Test nel Task 1 (regole) e nel Task 3 (gestore).
2. **Due invii simultanei dallo stesso codice.** Atteso: un solo voto contato, l'altro riceve `409`. Test nel Task 2 (archivio in memoria) e nel Task 3 (gestore).
3. **Dispositivo che ha già votato, mentre la sua rete è al tetto.** Atteso: `409` con la classifica, non `429`. Test nel Task 2 e nel Task 3.
4. **Sondaggio chiuso senza voti, o hash Redis vuoti** (`hgetall` restituisce `null`). Atteso: classifica tutta a zero, `vincitrici: []`, nessun crash. Test nel Task 1 (regole) e nel Task 2 (Redis finto).
5. **`localStorage` con un valore non UUID** (manomesso o vecchio). Atteso: si genera e si salva un nuovo codice, così il voto non viene respinto. Test nel Task 5 (`leggiToken`).

---

### Task 1: Configurazione, regole pure e infrastruttura di test

**Files:**
- Create: `src/pe-fratte/sondaggio.config.js`
- Create: `api/_lib/regole.js`
- Test: `api/_lib/regole.test.js`
- Modify: `package.json` (script `test`)
- Add: `docs/superpowers/specs/2026-10-15-sondaggio-pe-fratte-design.md`, `docs/superpowers/plans/2026-10-15-sondaggio-pe-fratte.md` (già scritti, da committare)

**Interfaces:**
- Consumes: niente.
- Produces:
  - `SONDAGGIO`: `{ id: string, attivo: boolean, apertura: string, chiusura: string, pubblicazione: string, voti: number, vincitrici: number, tettoPerRete: number, mete: Array<{ id, nome, zona?, difficolta?, km?, dislivello?, durata? }> }`
  - `statoSondaggio(config, ora: Date) → "prima" | "aperto" | "attesa" | "chiuso"`. `attesa` va da `chiusura` a `pubblicazione` esclusa: non si vota più e la classifica non si vede; `chiuso` è da `pubblicazione` in poi.
  - `tokenValido(token: unknown) → boolean`
  - `sceltaValida(config, mete: unknown) → boolean`
  - `classifica(config, voti: Record<string, number|string>) → Array<{ id: string, voti: number }>`
  - `vincitrici(config, ordinata) → { vincitrici: string[], pariMerito: boolean }`
  - `scadenzaRete(config) → number` (secondi Unix)

- [ ] **Step 1: Creare il branch**

```bash
git switch -c feat/sondaggio-pe-fratte
```

- [ ] **Step 2: Scrivere la configurazione**

Mete e orari sono provvisori. I dati veri arrivano dall'utente nel Task 8.

```js
// src/pe-fratte/sondaggio.config.js
/* Sondaggio "Le mete di novembre" (spec: docs/superpowers/specs/2026-10-15-sondaggio-pe-fratte-design.md).
   Lo leggono sia la pagina sia la funzione api/sondaggio.js: è l'unico posto
   dove cambiare mete e orari.
   - `id` delle mete: stabile, mai rinominato dopo l'apertura (i voti sono legati all'id)
   - orari con offset esplicito: dal 19 al 23 ottobre vale l'ora legale (+02:00)
   - tra `chiusura` e `pubblicazione` non si vota e la classifica non si vede (nemmeno a chi ha votato)
   - km/dislivello/durata facoltativi: un dato non annunciato non si scrive
   - `attivo: false` spegne sezione e API */
export const SONDAGGIO = {
  id: "novembre-2026",
  attivo: true,
  /* PROVVISORI: orari e mete veri arrivano prima del lancio (Task 8) */
  apertura: "2026-10-19T08:00:00+02:00",
  chiusura: "2026-10-22T23:59:00+02:00",
  pubblicazione: "2026-10-23T18:00:00+02:00",
  voti: 3,
  vincitrici: 3,
  tettoPerRete: 10,
  mete: [
    { id: "prova-01", nome: "Meta di prova uno", zona: "Zona di prova", difficolta: "facile", km: "6,2", dislivello: "250", durata: "2 h" },
    { id: "prova-02", nome: "Meta di prova due", zona: "Zona di prova", difficolta: "intermedia", km: "9,4", dislivello: "410", durata: "3–4 h" },
    { id: "prova-03", nome: "Meta di prova con un nome molto lungo", zona: "Zona di prova con un nome lungo", difficolta: "impegnativa", km: "14", dislivello: "900", durata: "6 h" },
    { id: "prova-04", nome: "Meta di prova quattro", zona: "Zona di prova", difficolta: "facile" },
    { id: "prova-05", nome: "Meta di prova cinque", difficolta: "intermedia", km: "8" },
    { id: "prova-06", nome: "Meta di prova sei", zona: "Zona di prova" },
    { id: "prova-07", nome: "Meta di prova sette", zona: "Zona di prova", difficolta: "intermedia", km: "11,5", dislivello: "600", durata: "4:30 h" },
    { id: "prova-08", nome: "Meta di prova otto", zona: "Zona di prova", difficolta: "facile", km: "5", durata: "2 h" },
    { id: "prova-09", nome: "Meta di prova nove", zona: "Zona di prova", difficolta: "impegnativa", dislivello: "1100" },
    { id: "prova-10", nome: "Meta di prova dieci", zona: "Zona di prova", difficolta: "intermedia", km: "10", dislivello: "500", durata: "4 h" },
    { id: "prova-11", nome: "Meta di prova undici", zona: "Zona di prova", difficolta: "facile", km: "7", dislivello: "300", durata: "2:30 h" },
    { id: "prova-12", nome: "Meta di prova dodici", zona: "Zona di prova", difficolta: "intermedia" },
    { id: "prova-13", nome: "Meta di prova tredici", zona: "Zona di prova", difficolta: "impegnativa", km: "16", dislivello: "1200", durata: "7 h" },
    { id: "prova-14", nome: "Meta di prova quattordici", zona: "Zona di prova", difficolta: "facile", km: "4,5" },
    { id: "prova-15", nome: "Meta di prova quindici", zona: "Zona di prova", difficolta: "intermedia", km: "9", dislivello: "450", durata: "3:30 h" },
  ],
};
```

- [ ] **Step 3: Aggiungere lo script di test a `package.json`**

In `"scripts"`, dopo `"lint": "oxlint",`:

```json
    "test": "node --test \"api/_lib/*.test.js\" \"src/pe-fratte/*.test.js\"",
```

- [ ] **Step 4: Scrivere i test che falliscono**

```js
// api/_lib/regole.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { statoSondaggio, tokenValido, sceltaValida, classifica, vincitrici, scadenzaRete } from "./regole.js";

const config = {
  id: "prova",
  attivo: true,
  apertura: "2026-10-19T08:00:00+02:00",
  chiusura: "2026-10-22T23:59:00+02:00",
  pubblicazione: "2026-10-23T18:00:00+02:00",
  voti: 3,
  vincitrici: 3,
  tettoPerRete: 10,
  mete: [
    { id: "a", nome: "Alfa" },
    { id: "b", nome: "Beta" },
    { id: "c", nome: "Gamma" },
    { id: "d", nome: "Delta" },
    { id: "e", nome: "Epsilon" },
  ],
};

test("statoSondaggio: prima, aperto, attesa e chiuso ai limiti esatti", () => {
  assert.equal(statoSondaggio(config, new Date("2026-10-19T05:59:59.999Z")), "prima");
  assert.equal(statoSondaggio(config, new Date("2026-10-19T06:00:00.000Z")), "aperto");
  assert.equal(statoSondaggio(config, new Date("2026-10-22T21:58:59.999Z")), "aperto");
  assert.equal(statoSondaggio(config, new Date("2026-10-22T21:59:00.000Z")), "attesa");
  assert.equal(statoSondaggio(config, new Date("2026-10-23T15:59:59.999Z")), "attesa");
  assert.equal(statoSondaggio(config, new Date("2026-10-23T16:00:00.000Z")), "chiuso");
});

test("tokenValido: solo UUID v4", () => {
  assert.equal(tokenValido("3f2b8c1e-9d4a-4b7e-8f21-0c5d6e7a8b9c"), true);
  assert.equal(tokenValido("3F2B8C1E-9D4A-4B7E-8F21-0C5D6E7A8B9C"), true);
  for (const t of ["", null, undefined, 42, "non-un-uuid", "3f2b8c1e-9d4a-1b7e-8f21-0c5d6e7a8b9c"]) {
    assert.equal(tokenValido(t), false, String(t));
  }
});

test("sceltaValida: esattamente tre mete diverse ed esistenti", () => {
  assert.equal(sceltaValida(config, ["a", "b", "c"]), true);
  const sbagliate = [
    ["a", "b"],
    ["a", "b", "c", "d"],
    ["a", "a", "b"],
    ["a", "b", "z"],
    ["a", "b", {}],
    ["a", "b", "__proto__"],
    ["a", "b", "constructor"],
    "abc",
    null,
    undefined,
  ];
  for (const m of sbagliate) assert.equal(sceltaValida(config, m), false, JSON.stringify(m));
});

test("classifica: per voti, poi per nome; ignora id sconosciuti; accetta numeri come stringhe", () => {
  assert.deepEqual(classifica(config, { b: "5", a: 2, c: 2, z: 9 }), [
    { id: "b", voti: 5 },
    { id: "a", voti: 2 },
    { id: "c", voti: 2 },
    { id: "d", voti: 0 },
    { id: "e", voti: 0 },
  ]);
});

test("classifica: senza voti tutte a zero in ordine di nome", () => {
  assert.deepEqual(
    classifica(config, {}).map((m) => m.id),
    ["a", "b", "d", "e", "c"] // Alfa, Beta, Delta, Epsilon, Gamma
  );
});

const voce = (id, voti) => ({ id, voti });

test("vincitrici: le prime tre senza pari merito", () => {
  const o = [voce("b", 5), voce("a", 4), voce("c", 3), voce("d", 2), voce("e", 1)];
  assert.deepEqual(vincitrici(config, o), { vincitrici: ["b", "a", "c"], pariMerito: false });
});

test("vincitrici: pari merito al terzo posto le include tutte", () => {
  const o = [voce("b", 5), voce("a", 4), voce("c", 3), voce("d", 3), voce("e", 1)];
  assert.deepEqual(vincitrici(config, o), { vincitrici: ["b", "a", "c", "d"], pariMerito: true });
});

test("vincitrici: un pari merito dentro le prime tre non è pari merito", () => {
  const o = [voce("b", 5), voce("a", 4), voce("c", 4), voce("d", 2), voce("e", 0)];
  assert.deepEqual(vincitrici(config, o), { vincitrici: ["b", "a", "c"], pariMerito: false });
});

test("vincitrici: una meta a zero voti non vince mai", () => {
  const o = [voce("b", 2), voce("a", 1), voce("c", 0), voce("d", 0), voce("e", 0)];
  assert.deepEqual(vincitrici(config, o), { vincitrici: ["b", "a"], pariMerito: false });
});

test("vincitrici: nessun voto, nessuna vincitrice", () => {
  const o = [voce("a", 0), voce("b", 0), voce("d", 0), voce("e", 0), voce("c", 0)];
  assert.deepEqual(vincitrici(config, o), { vincitrici: [], pariMerito: false });
});

test("scadenzaRete: sette giorni dopo la chiusura, in secondi Unix", () => {
  assert.equal(scadenzaRete(config), Math.floor(Date.parse("2026-10-29T21:59:00Z") / 1000));
});
```

- [ ] **Step 5: Lanciare i test e verificare che falliscano**

Run: `npm test`
Expected: FAIL con `Cannot find module '.../api/_lib/regole.js'`.

- [ ] **Step 6: Scrivere le regole**

```js
// api/_lib/regole.js
/* Regole del sondaggio: funzioni pure, senza Redis né HTTP.
   Le usa il server (gestore.js) e, per lo stato iniziale, anche la pagina. */

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/* Decide solo l'orologio di chi chiama: sul server è quello che conta.
   "attesa": votazione chiusa, classifica non ancora pubblica (per nessuno). */
export function statoSondaggio(config, ora) {
  const t = ora.getTime();
  if (t < Date.parse(config.apertura)) return "prima";
  if (t < Date.parse(config.chiusura)) return "aperto";
  if (t < Date.parse(config.pubblicazione)) return "attesa";
  return "chiuso";
}

export function tokenValido(token) {
  return typeof token === "string" && UUID_V4.test(token);
}

/* Esattamente `config.voti` mete, tutte diverse e presenti in configurazione */
export function sceltaValida(config, mete) {
  if (!Array.isArray(mete) || mete.length !== config.voti) return false;
  const ammesse = new Set(config.mete.map((m) => m.id));
  return mete.every((id) => typeof id === "string" && ammesse.has(id)) && new Set(mete).size === mete.length;
}

/* Tutte le mete della configurazione, dalla più votata; a pari voti per nome.
   I conteggi possono arrivare come stringhe (Redis); id sconosciuti ignorati. */
export function classifica(config, voti) {
  const nome = new Map(config.mete.map((m) => [m.id, m.nome]));
  return config.mete
    .map((m) => ({ id: m.id, voti: Number(Object.hasOwn(voti, m.id) ? voti[m.id] : 0) || 0 }))
    .sort((a, b) => b.voti - a.voti || nome.get(a.id).localeCompare(nome.get(b.id), "it"));
}

/* Vince chi ha almeno i voti della meta in posizione `config.vincitrici`
   (e almeno un voto): a pari merito le vincitrici possono essere di più. */
export function vincitrici(config, ordinata) {
  const soglia = ordinata[config.vincitrici - 1]?.voti ?? 0;
  const vinte = ordinata.filter((m) => m.voti > 0 && m.voti >= soglia).map((m) => m.id);
  return { vincitrici: vinte, pariMerito: vinte.length > config.vincitrici };
}

/* L'hash della rete si cancella da solo sette giorni dopo la chiusura */
export function scadenzaRete(config) {
  return Math.floor(Date.parse(config.chiusura) / 1000) + 7 * 24 * 60 * 60;
}
```

- [ ] **Step 7: Lanciare i test e verificare che passino**

Run: `npm test`
Expected: PASS, 11 test. Il pattern `src/pe-fratte/*.test.js` per ora non trova file: Node 24 lo ignora ed esce con codice 0. Il suo file arriva nel Task 5.

- [ ] **Step 8: Commit**

```bash
git add docs/superpowers/specs/2026-10-15-sondaggio-pe-fratte-design.md docs/superpowers/plans/2026-10-15-sondaggio-pe-fratte.md src/pe-fratte/sondaggio.config.js api/_lib/regole.js api/_lib/regole.test.js package.json
git commit -m "Sondaggio: configurazione e regole del voto" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Archivio (Redis e memoria) e hash della rete

**Files:**
- Create: `api/_lib/archivio.js`
- Create: `api/_lib/rete.js`
- Test: `api/_lib/archivio.test.js`, `api/_lib/rete.test.js`
- Modify: `package.json`, `package-lock.json` (dipendenza `@upstash/redis`)

**Interfaces:**
- Consumes: niente dai task precedenti.
- Produces:
  - `prefissoChiavi(ambiente: string, id: string) → string`, cioè `"sondaggio:<ambiente>:<id>:"`
  - `creaArchivioRedis(redis, prefisso) → Archivio`
  - `creaArchivioMemoria() → Archivio`
  - `Archivio` espone:
    - `leggiScheda(token) → Promise<{ mete: string[], t: string } | null>`
    - `registra({ token, scheda, rete, tetto, scadenzaRete }) → Promise<"ok" | "gia-votato" | "tetto">`
    - `conteggi() → Promise<{ votanti: number, voti: Record<string, number|string> }>`
    - `schede() → Promise<Array<{ mete, t }>>`
  - `ipDa(headers: { get(nome): string|null }) → string`, con `"sconosciuta"` se manca
  - `hashRete(ip: string, segreto: string|undefined, id: string) → string` (32 caratteri esadecimali)

- [ ] **Step 1: Installare il client Upstash**

Run: `npm install @upstash/redis`
Expected: `package.json` contiene `"@upstash/redis": "^1.39.0"` (o successiva) tra le `dependencies`.

- [ ] **Step 2: Scrivere i test che falliscono**

```js
// api/_lib/archivio.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { creaArchivioMemoria, creaArchivioRedis, prefissoChiavi } from "./archivio.js";

const scheda = (mete = ["a", "b", "c"]) => ({ mete, t: "2026-10-20T10:00:00.000Z" });
const voto = (token, rete = "r1", tetto = 10) => ({ token, scheda: scheda(), rete, tetto, scadenzaRete: 1793000000 });

test("prefissoChiavi separa ambiente e sondaggio", () => {
  assert.equal(prefissoChiavi("preview", "novembre-2026"), "sondaggio:preview:novembre-2026:");
});

test("memoria: registra, rilegge e conta", async () => {
  const a = creaArchivioMemoria();
  assert.equal(await a.leggiScheda("t1"), null);
  assert.equal(await a.registra(voto("t1")), "ok");
  assert.deepEqual(await a.leggiScheda("t1"), scheda());
  assert.deepEqual(await a.conteggi(), { votanti: 1, voti: { a: 1, b: 1, c: 1 } });
  assert.deepEqual(await a.schede(), [scheda()]);
});

test("memoria: lo stesso codice non vota due volte", async () => {
  const a = creaArchivioMemoria();
  await a.registra(voto("t1"));
  assert.equal(await a.registra(voto("t1")), "gia-votato");
  assert.deepEqual(await a.conteggi(), { votanti: 1, voti: { a: 1, b: 1, c: 1 } });
});

test("memoria: tetto per rete", async () => {
  const a = creaArchivioMemoria();
  assert.equal(await a.registra(voto("t1", "r1", 2)), "ok");
  assert.equal(await a.registra(voto("t2", "r1", 2)), "ok");
  assert.equal(await a.registra(voto("t3", "r1", 2)), "tetto");
  assert.equal(await a.registra(voto("t3", "r2", 2)), "ok");
  assert.equal((await a.conteggi()).votanti, 3);
});

// Review Focus 3
test("memoria: chi ha già votato riceve gia-votato anche se la rete è al tetto", async () => {
  const a = creaArchivioMemoria();
  await a.registra(voto("t1", "r1", 1));
  assert.equal(await a.registra(voto("t1", "r1", 1)), "gia-votato");
});

// Review Focus 2
test("memoria: due invii simultanei dallo stesso codice contano una volta", async () => {
  const a = creaArchivioMemoria();
  const esiti = await Promise.all([a.registra(voto("t1")), a.registra(voto("t1"))]);
  assert.deepEqual(esiti.sort(), ["gia-votato", "ok"]);
  assert.deepEqual(await a.conteggi(), { votanti: 1, voti: { a: 1, b: 1, c: 1 } });
});

/* Redis finto: registra le chiamate e restituisce quello che gli si dice */
function redisFinto({ hget = null, hgetall = null, hlen = 0, esitoEval = "ok" } = {}) {
  const chiamate = [];
  return {
    chiamate,
    async hget(chiave, campo) { chiamate.push(["hget", chiave, campo]); return hget; },
    async hgetall(chiave) { chiamate.push(["hgetall", chiave]); return hgetall; },
    async hlen(chiave) { chiamate.push(["hlen", chiave]); return hlen; },
    async eval(script, chiavi, argomenti) { chiamate.push(["eval", chiavi, argomenti]); return esitoEval; },
  };
}

const P = "sondaggio:preview:prova:";

// Review Focus 4
test("redis: hash vuoti (null) diventano zero voti", async () => {
  const a = creaArchivioRedis(redisFinto({ hgetall: null, hlen: 0 }), P);
  assert.deepEqual(await a.conteggi(), { votanti: 0, voti: {} });
  assert.deepEqual(await a.schede(), []);
});

test("redis: legge la scheda sia come stringa JSON sia già deserializzata", async () => {
  const stringa = creaArchivioRedis(redisFinto({ hget: JSON.stringify(scheda()) }), P);
  assert.deepEqual(await stringa.leggiScheda("t1"), scheda());
  const oggetto = creaArchivioRedis(redisFinto({ hget: scheda() }), P);
  assert.deepEqual(await oggetto.leggiScheda("t1"), scheda());
  const assente = creaArchivioRedis(redisFinto({ hget: null }), P);
  assert.equal(await assente.leggiScheda("t1"), null);
});

test("redis: registra passa allo script chiavi e argomenti nell'ordine atteso", async () => {
  const r = redisFinto({ esitoEval: "tetto" });
  const a = creaArchivioRedis(r, P);
  assert.equal(await a.registra({ token: "t1", scheda: scheda(), rete: "abc", tetto: 2, scadenzaRete: 1793000000 }), "tetto");
  assert.deepEqual(r.chiamate.at(-1), [
    "eval",
    [P + "schede", P + "conteggi", P + "rete:abc"],
    ["t1", JSON.stringify(scheda()), "2", "1793000000", "a", "b", "c"],
  ]);
});

test("redis: conteggi e schede usano le chiavi col prefisso", async () => {
  const r = redisFinto({ hgetall: { t1: JSON.stringify(scheda()) }, hlen: 1 });
  const a = creaArchivioRedis(r, P);
  await a.conteggi();
  assert.deepEqual(await a.schede(), [scheda()]);
  assert.ok(r.chiamate.some((c) => c[0] === "hgetall" && c[1] === P + "conteggi"));
  assert.ok(r.chiamate.some((c) => c[0] === "hlen" && c[1] === P + "schede"));
  assert.ok(r.chiamate.some((c) => c[0] === "hgetall" && c[1] === P + "schede"));
});
```

```js
// api/_lib/rete.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { hashRete, ipDa } from "./rete.js";

test("ipDa: prima voce di x-forwarded-for, ripulita", () => {
  assert.equal(ipDa(new Headers({ "x-forwarded-for": " 203.0.113.7 , 10.0.0.1" })), "203.0.113.7");
  assert.equal(ipDa(new Headers({ "x-forwarded-for": "2001:db8::1" })), "2001:db8::1");
});

test("ipDa: senza intestazione la rete è 'sconosciuta'", () => {
  assert.equal(ipDa(new Headers()), "sconosciuta");
  assert.equal(ipDa(new Headers({ "x-forwarded-for": "" })), "sconosciuta");
});

test("hashRete: stabile, 32 caratteri esadecimali, non contiene l'IP", () => {
  const h = hashRete("203.0.113.7", "segreto", "novembre-2026");
  assert.match(h, /^[0-9a-f]{32}$/);
  assert.equal(h, hashRete("203.0.113.7", "segreto", "novembre-2026"));
  assert.ok(!h.includes("203"));
});

test("hashRete: cambia con IP, segreto e sondaggio", () => {
  const h = hashRete("203.0.113.7", "segreto", "novembre-2026");
  assert.notEqual(h, hashRete("203.0.113.8", "segreto", "novembre-2026"));
  assert.notEqual(h, hashRete("203.0.113.7", "altro", "novembre-2026"));
  assert.notEqual(h, hashRete("203.0.113.7", "segreto", "dicembre-2026"));
});
```

- [ ] **Step 3: Lanciare i test e verificare che falliscano**

Run: `npm test`
Expected: FAIL. `archivio.test.js` e `rete.test.js` non trovano i moduli; i test di `regole.test.js` restano verdi.

- [ ] **Step 4: Scrivere l'archivio**

```js
// api/_lib/archivio.js
/* Dove stanno i voti. Due implementazioni con la stessa interfaccia:
   Redis (anteprima e produzione) e memoria (sviluppo locale e test).
   Chiavi, tutte sotto `sondaggio:<ambiente>:<id>:`:
   - schede      hash  codice → {"mete":[…],"t":"<ISO>"}
   - conteggi    hash  id meta → voti
   - rete:<hash> stringa con i voti arrivati da quella rete, scade da sola */

export function prefissoChiavi(ambiente, id) {
  return `sondaggio:${ambiente}:${id}:`;
}

/* Un voto in un colpo solo: o si registra tutto o niente.
   KEYS: schede, conteggi, rete. ARGV: codice, scheda, tetto, scadenza, mete… */
const SCRIPT_VOTO = `
if redis.call('HEXISTS', KEYS[1], ARGV[1]) == 1 then return 'gia-votato' end
local dallaRete = tonumber(redis.call('GET', KEYS[3]) or '0')
if dallaRete >= tonumber(ARGV[3]) then return 'tetto' end
redis.call('HSET', KEYS[1], ARGV[1], ARGV[2])
for i = 5, #ARGV do redis.call('HINCRBY', KEYS[2], ARGV[i], 1) end
redis.call('INCR', KEYS[3])
redis.call('EXPIREAT', KEYS[3], ARGV[4])
return 'ok'
`;

/* Il client Upstash deserializza da solo i JSON: la scheda può arrivare già oggetto */
function comeScheda(valore) {
  if (valore == null) return null;
  return typeof valore === "string" ? JSON.parse(valore) : valore;
}

export function creaArchivioRedis(redis, prefisso) {
  const schede = prefisso + "schede";
  const conteggi = prefisso + "conteggi";
  return {
    async leggiScheda(token) {
      return comeScheda(await redis.hget(schede, token));
    },
    async registra({ token, scheda, rete, tetto, scadenzaRete }) {
      const esito = await redis.eval(
        SCRIPT_VOTO,
        [schede, conteggi, prefisso + "rete:" + rete],
        [token, JSON.stringify(scheda), String(tetto), String(scadenzaRete), ...scheda.mete]
      );
      return String(esito);
    },
    async conteggi() {
      const [voti, votanti] = await Promise.all([redis.hgetall(conteggi), redis.hlen(schede)]);
      return { votanti: Number(votanti) || 0, voti: voti ?? {} };
    },
    async schede() {
      return Object.values((await redis.hgetall(schede)) ?? {}).map(comeScheda);
    },
  };
}

/* Stesso comportamento, in memoria. Nessun await tra controllo e scrittura:
   due voti simultanei dello stesso codice non possono passare entrambi. */
export function creaArchivioMemoria() {
  const schede = new Map();
  const voti = new Map();
  const reti = new Map();
  return {
    async leggiScheda(token) {
      return schede.get(token) ?? null;
    },
    async registra({ token, scheda, rete, tetto }) {
      if (schede.has(token)) return "gia-votato";
      if ((reti.get(rete) ?? 0) >= tetto) return "tetto";
      schede.set(token, scheda);
      for (const id of scheda.mete) voti.set(id, (voti.get(id) ?? 0) + 1);
      reti.set(rete, (reti.get(rete) ?? 0) + 1);
      return "ok";
    },
    async conteggi() {
      return { votanti: schede.size, voti: Object.fromEntries(voti) };
    },
    async schede() {
      return [...schede.values()];
    },
  };
}
```

- [ ] **Step 5: Scrivere `rete.js`**

```js
// api/_lib/rete.js
import { createHmac } from "node:crypto";

/* Su Vercel la prima voce di x-forwarded-for è l'IP di chi chiama */
export function ipDa(headers) {
  const ip = headers.get("x-forwarded-for")?.split(",")[0].trim();
  return ip || "sconosciuta";
}

/* L'IP non si salva mai in chiaro: solo un hash non reversibile, legato
   al sondaggio e a un segreto del server (il token di Redis) */
export function hashRete(ip, segreto, id) {
  return createHmac("sha256", `${segreto ?? ""}:${id}`).update(ip).digest("hex").slice(0, 32);
}
```

- [ ] **Step 6: Lanciare i test e verificare che passino**

Run: `npm test`
Expected: PASS, 11 + 10 + 4 = 25 test.

- [ ] **Step 7: Commit**

```bash
git add api/_lib/archivio.js api/_lib/archivio.test.js api/_lib/rete.js api/_lib/rete.test.js package.json package-lock.json
git commit -m "Sondaggio: archivio dei voti su Redis e in memoria" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Gestore delle richieste

**Files:**
- Create: `api/_lib/gestore.js`
- Test: `api/_lib/gestore.test.js`

**Interfaces:**
- Consumes:
  - dal Task 1: `statoSondaggio`, `tokenValido`, `sceltaValida`, `classifica`, `vincitrici`, `scadenzaRete`;
  - dal Task 2: `creaArchivioMemoria` (solo nei test) e l'interfaccia `Archivio`.
- Produces:
  - `gestisci({ metodo, token, mete, rete, ora }, { config, archivio }) → Promise<{ status: number, corpo: object }>`
  - I corpi delle risposte seguono la spec §6 (con lo stato `attesa`):
    - `{ stato, haVotato, scelte?, risultati?: { votanti, mete, vincitrici?, pariMerito? } }`
    - in caso di errore anche `errore`, uno tra `"non-attivo" | "metodo" | "prima" | "chiuso" | "scelta-non-valida" | "tetto" | "gia-votato"`.

- [ ] **Step 1: Scrivere i test che falliscono**

```js
// api/_lib/gestore.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { gestisci } from "./gestore.js";
import { creaArchivioMemoria } from "./archivio.js";

const config = {
  id: "prova",
  attivo: true,
  apertura: "2026-10-19T08:00:00+02:00",
  chiusura: "2026-10-22T23:59:00+02:00",
  pubblicazione: "2026-10-23T18:00:00+02:00",
  voti: 3,
  vincitrici: 3,
  tettoPerRete: 2,
  mete: [
    { id: "a", nome: "Alfa" },
    { id: "b", nome: "Beta" },
    { id: "c", nome: "Gamma" },
    { id: "d", nome: "Delta" },
    { id: "e", nome: "Epsilon" },
  ],
};

const T1 = "11111111-1111-4111-8111-111111111111";
const T2 = "22222222-2222-4222-8222-222222222222";
const T3 = "33333333-3333-4333-8333-333333333333";
const PRIMA = new Date("2026-10-18T10:00:00Z");
const APERTO = new Date("2026-10-20T10:00:00Z");
const ATTESA = new Date("2026-10-23T10:00:00Z");
const CHIUSO = new Date("2026-10-24T10:00:00Z");

const contesto = (cfg = config) => ({ config: cfg, archivio: creaArchivioMemoria() });
const vota = (ctx, token, mete, { ora = APERTO, rete = "r1" } = {}) =>
  gestisci({ metodo: "POST", token, mete, rete, ora }, ctx);
const leggi = (ctx, token, ora = APERTO) => gestisci({ metodo: "GET", token, ora }, ctx);

test("GET aperto, non votato: stato senza classifica", async () => {
  const r = await leggi(contesto(), T1);
  assert.deepEqual(r, { status: 200, corpo: { stato: "aperto", haVotato: false } });
});

test("POST valido: voto registrato e classifica parziale senza vincitrici", async () => {
  const ctx = contesto();
  const r = await vota(ctx, T1, ["a", "b", "c"]);
  assert.equal(r.status, 200);
  assert.equal(r.corpo.stato, "aperto");
  assert.equal(r.corpo.haVotato, true);
  assert.deepEqual(r.corpo.scelte, ["a", "b", "c"]);
  assert.equal(r.corpo.risultati.votanti, 1);
  assert.deepEqual(r.corpo.risultati.mete.slice(0, 3), [
    { id: "a", voti: 1 },
    { id: "b", voti: 1 },
    { id: "c", voti: 1 },
  ]);
  assert.equal("vincitrici" in r.corpo.risultati, false);
});

test("GET dopo il voto: classifica e scelte", async () => {
  const ctx = contesto();
  await vota(ctx, T1, ["a", "b", "c"]);
  const r = await leggi(ctx, T1);
  assert.equal(r.corpo.haVotato, true);
  assert.deepEqual(r.corpo.scelte, ["a", "b", "c"]);
  assert.equal(r.corpo.risultati.votanti, 1);
});

test("doppio voto: 409 con le scelte originali, conteggi invariati", async () => {
  const ctx = contesto();
  await vota(ctx, T1, ["a", "b", "c"]);
  const r = await vota(ctx, T1, ["c", "d", "e"]);
  assert.equal(r.status, 409);
  assert.equal(r.corpo.errore, "gia-votato");
  assert.deepEqual(r.corpo.scelte, ["a", "b", "c"]);
  assert.equal(r.corpo.risultati.votanti, 1);
});

test("prima dell'apertura: POST 403, GET senza classifica", async () => {
  const ctx = contesto();
  assert.deepEqual(await vota(ctx, T1, ["a", "b", "c"], { ora: PRIMA }), {
    status: 403,
    corpo: { errore: "prima", stato: "prima", haVotato: false },
  });
  assert.deepEqual(await leggi(ctx, T1, PRIMA), { status: 200, corpo: { stato: "prima", haVotato: false } });
});

test("dopo la pubblicazione: POST 403 con la classifica finale, nessun voto contato", async () => {
  const ctx = contesto();
  await vota(ctx, T1, ["a", "b", "c"]);
  const r = await vota(ctx, T2, ["c", "d", "e"], { ora: CHIUSO });
  assert.equal(r.status, 403);
  assert.equal(r.corpo.errore, "chiuso");
  assert.equal(r.corpo.stato, "chiuso");
  assert.equal(r.corpo.haVotato, false);
  assert.equal(r.corpo.risultati.votanti, 1);
  assert.deepEqual(r.corpo.risultati.vincitrici, ["a", "b", "c"]);
  assert.equal(r.corpo.risultati.pariMerito, false);
});

test("attesa: chi ha votato vede le sue scelte ma non la classifica", async () => {
  const ctx = contesto();
  await vota(ctx, T1, ["a", "b", "c"]);
  assert.deepEqual(await leggi(ctx, T1, ATTESA), {
    status: 200,
    corpo: { stato: "attesa", haVotato: true, scelte: ["a", "b", "c"] },
  });
  assert.deepEqual(await leggi(ctx, T2, ATTESA), { status: 200, corpo: { stato: "attesa", haVotato: false } });
});

test("attesa: POST 403 senza classifica, nessun voto contato", async () => {
  const ctx = contesto();
  await vota(ctx, T1, ["a", "b", "c"]);
  assert.deepEqual(await vota(ctx, T2, ["c", "d", "e"], { ora: ATTESA }), {
    status: 403,
    corpo: { errore: "chiuso", stato: "attesa", haVotato: false },
  });
  assert.equal((await ctx.archivio.conteggi()).votanti, 1);
});

test("dopo la pubblicazione: la classifica è pubblica anche senza codice", async () => {
  const ctx = contesto();
  await vota(ctx, T1, ["a", "b", "c"]);
  const r = await leggi(ctx, undefined, CHIUSO);
  assert.equal(r.status, 200);
  assert.equal(r.corpo.haVotato, false);
  assert.deepEqual(r.corpo.risultati.vincitrici, ["a", "b", "c"]);
});

test("tetto per rete: 429 oltre il tetto, un'altra rete passa", async () => {
  const ctx = contesto();
  assert.equal((await vota(ctx, T1, ["a", "b", "c"])).status, 200);
  assert.equal((await vota(ctx, T2, ["a", "b", "c"])).status, 200);
  assert.deepEqual(await vota(ctx, T3, ["a", "b", "c"]), { status: 429, corpo: { errore: "tetto" } });
  assert.equal((await vota(ctx, T3, ["a", "b", "c"], { rete: "r2" })).status, 200);
});

// Review Focus 3
test("chi ha già votato da una rete al tetto riceve 409, non 429", async () => {
  const ctx = contesto();
  await vota(ctx, T1, ["a", "b", "c"]);
  await vota(ctx, T2, ["a", "b", "c"]);
  const r = await vota(ctx, T1, ["a", "b", "c"]);
  assert.equal(r.status, 409);
  assert.ok(r.corpo.risultati);
});

// Review Focus 1
test("corpo malformato o codice non valido: 400 e nessun voto contato", async () => {
  const ctx = contesto();
  const sbagliate = [null, undefined, "a,b,c", ["a", "b"], ["a", "a", "b"], ["a", "b", {}], ["a", "b", "__proto__"], ["a", "b", "constructor"]];
  for (const mete of sbagliate) {
    assert.deepEqual(await vota(ctx, T1, mete), { status: 400, corpo: { errore: "scelta-non-valida" } }, JSON.stringify(mete));
  }
  for (const token of [undefined, null, "x", 42]) {
    assert.equal((await vota(ctx, token, ["a", "b", "c"])).status, 400, String(token));
  }
  assert.deepEqual(await ctx.archivio.conteggi(), { votanti: 0, voti: {} });
});

// Review Focus 2
test("due POST simultanei dallo stesso codice: uno 200, uno 409", async () => {
  const ctx = contesto();
  const [x, y] = await Promise.all([vota(ctx, T1, ["a", "b", "c"]), vota(ctx, T1, ["a", "b", "c"])]);
  assert.deepEqual([x.status, y.status].sort(), [200, 409]);
  assert.equal((await ctx.archivio.conteggi()).votanti, 1);
});

test("GET con codice non valido: stato senza errori", async () => {
  assert.deepEqual(await leggi(contesto(), "x"), { status: 200, corpo: { stato: "aperto", haVotato: false } });
});

test("sondaggio spento: 404 per GET e POST", async () => {
  const ctx = contesto({ ...config, attivo: false });
  assert.deepEqual(await leggi(ctx, T1), { status: 404, corpo: { errore: "non-attivo" } });
  assert.equal((await vota(ctx, T1, ["a", "b", "c"])).status, 404);
});

test("metodo non previsto: 405", async () => {
  const r = await gestisci({ metodo: "PUT", token: T1, ora: APERTO }, contesto());
  assert.deepEqual(r, { status: 405, corpo: { errore: "metodo" } });
});
```

- [ ] **Step 2: Lanciare i test e verificare che falliscano**

Run: `npm test`
Expected: FAIL con `Cannot find module '.../api/_lib/gestore.js'`.

- [ ] **Step 3: Scrivere il gestore**

```js
// api/_lib/gestore.js
import { classifica, sceltaValida, scadenzaRete, statoSondaggio, tokenValido, vincitrici } from "./regole.js";

/* Una richiesta al sondaggio, senza HTTP né Redis: li mettono
   api/sondaggio.js (Vercel) e vite.config.js (sviluppo).
   La classifica esce solo per chi ha votato mentre il voto è aperto, e per
   tutti dopo la pubblicazione. Durante l'attesa non esce per nessuno. */
export async function gestisci({ metodo, token, mete, rete, ora }, { config, archivio }) {
  if (!config.attivo) return { status: 404, corpo: { errore: "non-attivo" } };
  const stato = statoSondaggio(config, ora);
  const scheda = () => (tokenValido(token) ? archivio.leggiScheda(token) : null);

  if (metodo === "GET") {
    return { status: 200, corpo: await corpoStato(config, archivio, stato, await scheda()) };
  }
  if (metodo !== "POST") return { status: 405, corpo: { errore: "metodo" } };

  if (stato === "prima") return { status: 403, corpo: { errore: "prima", stato, haVotato: false } };
  if (stato === "attesa" || stato === "chiuso") {
    return { status: 403, corpo: { errore: "chiuso", ...(await corpoStato(config, archivio, stato, await scheda())) } };
  }
  if (!tokenValido(token) || !sceltaValida(config, mete)) {
    return { status: 400, corpo: { errore: "scelta-non-valida" } };
  }

  const nuova = { mete: [...mete], t: ora.toISOString() };
  const esito = await archivio.registra({
    token,
    scheda: nuova,
    rete: rete || "sconosciuta",
    tetto: config.tettoPerRete,
    scadenzaRete: scadenzaRete(config),
  });
  if (esito === "tetto") return { status: 429, corpo: { errore: "tetto" } };
  if (esito === "gia-votato") {
    return { status: 409, corpo: { errore: "gia-votato", ...(await corpoStato(config, archivio, stato, await scheda())) } };
  }
  return { status: 200, corpo: await corpoStato(config, archivio, stato, nuova) };
}

async function corpoStato(config, archivio, stato, scheda) {
  const corpo = { stato, haVotato: Boolean(scheda) };
  if (scheda) corpo.scelte = scheda.mete;
  if ((scheda && stato === "aperto") || stato === "chiuso") {
    const { votanti, voti } = await archivio.conteggi();
    const mete = classifica(config, voti);
    corpo.risultati = { votanti, mete, ...(stato === "chiuso" ? vincitrici(config, mete) : {}) };
  }
  return corpo;
}
```

- [ ] **Step 4: Lanciare i test e verificare che passino**

Run: `npm test`
Expected: PASS, 25 + 16 = 41 test.

- [ ] **Step 5: Commit**

```bash
git add api/_lib/gestore.js api/_lib/gestore.test.js
git commit -m "Sondaggio: gestore delle richieste di voto e classifica" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Funzione Vercel, regione e sondaggio in sviluppo locale

**Files:**
- Create: `api/sondaggio.js`
- Modify: `vercel.json` (aggiungere `regions`)
- Modify: `vite.config.js` (plugin `sondaggioInSviluppo`)
- Modify: `.claude/launch.json` (configurazione `pe-fratte-sondaggio`)

**Interfaces:**
- Consumes:
  - `SONDAGGIO` (Task 1);
  - `gestisci` (Task 3);
  - `creaArchivioRedis`, `creaArchivioMemoria`, `prefissoChiavi`, `hashRete`, `ipDa` (Task 2).
- Produces:
  - `GET /api/sondaggio?token=<uuid>` e `POST /api/sondaggio` con corpo JSON `{ token, mete }`, con le risposte del gestore e `Cache-Control: no-store`;
  - errore interno (Redis irraggiungibile): `503 { errore: "servizio" }`;
  - solo in sviluppo, `GET /__sondaggio?ora=<ISO>&guasto=1` imposta l'orologio del server di sviluppo (senza `ora` torna all'ora reale) e, con `guasto=1`, fa rispondere `/api/sondaggio` con `503`. Ogni chiamata reimposta entrambi.

- [ ] **Step 1: Scrivere la funzione Vercel**

```js
// api/sondaggio.js
import { Redis } from "@upstash/redis";
import { SONDAGGIO } from "../src/pe-fratte/sondaggio.config.js";
import { gestisci } from "./_lib/gestore.js";
import { creaArchivioRedis, prefissoChiavi } from "./_lib/archivio.js";
import { hashRete, ipDa } from "./_lib/rete.js";

/* Sondaggio di Pe' Fratte: unico punto che legge e scrive i voti.
   Anteprima e produzione condividono il database ma non le chiavi
   (prefisso con VERCEL_ENV). Regione fra1, vicino a Redis (vercel.json). */
const redis = new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN });
const archivio = creaArchivioRedis(redis, prefissoChiavi(process.env.VERCEL_ENV || "development", SONDAGGIO.id));

async function rispondi(richiesta) {
  try {
    const { status, corpo } = await gestisci(richiesta, { config: SONDAGGIO, archivio });
    return Response.json(corpo, { status, headers: { "Cache-Control": "no-store" } });
  } catch (errore) {
    console.error("sondaggio:", errore);
    return Response.json({ errore: "servizio" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

export function GET(request) {
  const token = new URL(request.url).searchParams.get("token");
  return rispondi({ metodo: "GET", token, ora: new Date() });
}

export async function POST(request) {
  const corpo = await request.json().catch(() => null);
  const rete = hashRete(ipDa(request.headers), process.env.KV_REST_API_TOKEN, SONDAGGIO.id);
  return rispondi({ metodo: "POST", token: corpo?.token, mete: corpo?.mete, rete, ora: new Date() });
}
```

- [ ] **Step 2: Fissare la regione in `vercel.json`**

Aggiungere come prima proprietà dell'oggetto, prima di `"rewrites"`:

```json
  "regions": ["fra1"],
```

- [ ] **Step 3: Montare il gestore nel dev server di Vite**

In `vite.config.js`, sotto `import react from '@vitejs/plugin-react'`, aggiungere:

```js
import { SONDAGGIO } from './src/pe-fratte/sondaggio.config.js'
import { gestisci } from './api/_lib/gestore.js'
import { creaArchivioMemoria } from './api/_lib/archivio.js'
import { hashRete } from './api/_lib/rete.js'
```

Prima di `// https://vite.dev/config/`, aggiungere il plugin:

```js
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
```

Poi registrarlo:

```js
  plugins: [react(), leagueSpaFallback(), stripImpeccableLive(), sondaggioInSviluppo()],
```

- [ ] **Step 4: Aggiungere la configurazione di anteprima a `.claude/launch.json`**

In fondo all'array `configurations`:

```json
    {
      "name": "pe-fratte-sondaggio",
      "runtimeExecutable": "npx",
      "runtimeArgs": ["vite", "--port", "5196", "--strictPort"],
      "port": 5196
    }
```

- [ ] **Step 5: Avviare il dev server e verificare l'API a mano**

Avviare con lo strumento di anteprima (`preview_start` con `name: "pe-fratte-sondaggio"`), poi:

```bash
curl -s "http://localhost:5196/__sondaggio?ora=2026-10-20T10:00:00Z"
```
Expected: `{"ora":"2026-10-20T10:00:00.000Z","finta":true,"guasto":false}`

```bash
curl -s "http://localhost:5196/api/sondaggio?token=11111111-1111-4111-8111-111111111111"
```
Expected: `{"stato":"aperto","haVotato":false}`

```bash
curl -s -X POST -H "Content-Type: application/json" -d '{"token":"11111111-1111-4111-8111-111111111111","mete":["prova-01","prova-02","prova-03"]}' http://localhost:5196/api/sondaggio
```
Expected: JSON con `"haVotato":true`, `"scelte":["prova-01","prova-02","prova-03"]` e `"votanti":1`.

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST -H "Content-Type: application/json" -d '{"token":"11111111-1111-4111-8111-111111111111","mete":["prova-01","prova-02","prova-03"]}' http://localhost:5196/api/sondaggio
```
Expected: `409`

```bash
curl -s "http://localhost:5196/__sondaggio?ora=2026-10-23T10:00:00Z" && curl -s "http://localhost:5196/api/sondaggio?token=11111111-1111-4111-8111-111111111111"
```
Expected: la seconda risposta è `{"stato":"attesa","haVotato":true,"scelte":["prova-01","prova-02","prova-03"]}`, senza classifica.

```bash
curl -s "http://localhost:5196/__sondaggio?ora=2026-10-24T10:00:00Z" && curl -s "http://localhost:5196/api/sondaggio"
```
Expected: la seconda risposta ha `"stato":"chiuso"` e `"vincitrici":["prova-03","prova-02","prova-01"]`. Le tre mete votate hanno un voto ciascuno, quindi l'ordine segue il nome: "Meta di prova con un nome molto lungo", "Meta di prova due", "Meta di prova uno".

```bash
curl -s "http://localhost:5196/__sondaggio?ora=2026-10-20T10:00:00Z&guasto=1" && curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:5196/api/sondaggio"
```
Expected: `503`. Poi `curl -s "http://localhost:5196/__sondaggio?ora=2026-10-20T10:00:00Z"` toglie il guasto.

Infine `npm test` deve restare verde e `npm run build` deve completare senza errori.

- [ ] **Step 6: Commit**

```bash
git add api/sondaggio.js vercel.json vite.config.js .claude/launch.json
git commit -m "Sondaggio: funzione Vercel a Francoforte e API in sviluppo locale" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Utilità della pagina, componenti condivisi e hook

**Files:**
- Create: `src/pe-fratte/sondaggio-utili.js`
- Test: `src/pe-fratte/sondaggio-utili.test.js`
- Create: `src/pe-fratte/Sentiero.jsx` (spostamento di `DifficoltaBadge` e `DatiSentiero` da `PeFratte.jsx`)
- Modify: `src/pe-fratte/PeFratte.jsx:31-72` (rimuovere le due funzioni e importarle)
- Modify: `src/pe-fratte/PfIcon.jsx` (icona `check`)
- Create: `src/pe-fratte/useSondaggio.js`

**Interfaces:**
- Consumes: `tokenValido` e `statoSondaggio` (Task 1); l'API del Task 4.
- Produces:
  - `CHIAVE_TOKEN = "pf-sondaggio"`
  - `leggiToken(storage: Storage|null, nuovo?: () => string) → string`
  - `ordineMescolato<T>(elementi: T[], seme: string) → T[]`
  - `giornoEOra(iso: string) → string`, ad esempio `"giovedì 22 ottobre alle 23:59"`
  - `DifficoltaBadge({ chiave })` e `DatiSentiero({ p })`, esportati da `Sentiero.jsx`
  - `useSondaggio(config)` restituisce:
    - lo stato: `stato`, `haVotato`, `scelte: string[]`, `risultati | null`;
    - il caricamento: `caricamento`, `irraggiungibile`;
    - l'invio: `invio: "fermo" | "in-corso" | "errore" | "tetto"`, `avviso: null | "non-contato"`;
    - i derivati: `token`, `visibile`, `votoAperto`;
    - le azioni: `ricarica()`, `vota(mete)`.

- [ ] **Step 1: Scrivere i test che falliscono**

```js
// src/pe-fratte/sondaggio-utili.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { CHIAVE_TOKEN, giornoEOra, leggiToken, ordineMescolato } from "./sondaggio-utili.js";

const VALIDO = "3f2b8c1e-9d4a-4b7e-8f21-0c5d6e7a8b9c";
const NUOVO = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function memoria(iniziale) {
  const dati = new Map(iniziale === undefined ? [] : [[CHIAVE_TOKEN, iniziale]]);
  return { dati, getItem: (k) => dati.get(k) ?? null, setItem: (k, v) => dati.set(k, v) };
}

test("leggiToken: riusa un codice valido già salvato", () => {
  const m = memoria(VALIDO);
  assert.equal(leggiToken(m, () => NUOVO), VALIDO);
});

test("leggiToken: senza codice ne crea uno e lo salva", () => {
  const m = memoria();
  assert.equal(leggiToken(m, () => NUOVO), NUOVO);
  assert.equal(m.dati.get(CHIAVE_TOKEN), NUOVO);
});

// Review Focus 5
test("leggiToken: un valore non UUID viene sostituito", () => {
  const m = memoria("manomesso");
  assert.equal(leggiToken(m, () => NUOVO), NUOVO);
  assert.equal(m.dati.get(CHIAVE_TOKEN), NUOVO);
});

test("leggiToken: memoria assente o che lancia errori", () => {
  assert.equal(leggiToken(null, () => NUOVO), NUOVO);
  const rotta = { getItem() { throw new Error("SecurityError"); }, setItem() { throw new Error("SecurityError"); } };
  assert.equal(leggiToken(rotta, () => NUOVO), NUOVO);
});

test("leggiToken: di default genera un UUID v4", () => {
  assert.match(leggiToken(null), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

const QUINDICI = Array.from({ length: 15 }, (_, i) => `m${i + 1}`);

test("ordineMescolato: è una permutazione e non tocca l'originale", () => {
  const copia = [...QUINDICI];
  const o = ordineMescolato(QUINDICI, VALIDO);
  assert.deepEqual([...o].sort(), [...QUINDICI].sort());
  assert.deepEqual(QUINDICI, copia);
});

test("ordineMescolato: stesso seme stesso ordine, semi diversi ordini diversi", () => {
  assert.deepEqual(ordineMescolato(QUINDICI, VALIDO), ordineMescolato(QUINDICI, VALIDO));
  assert.notDeepEqual(ordineMescolato(QUINDICI, VALIDO), ordineMescolato(QUINDICI, NUOVO));
});

test("giornoEOra: data e ora italiane", () => {
  assert.equal(giornoEOra("2026-10-22T23:59:00+02:00"), "giovedì 22 ottobre alle 23:59");
  assert.equal(giornoEOra("2026-10-19T08:00:00+02:00"), "lunedì 19 ottobre alle 08:00");
});
```

- [ ] **Step 2: Lanciare i test e verificare che falliscano**

Run: `npm test`
Expected: FAIL con `Cannot find module '.../src/pe-fratte/sondaggio-utili.js'`.

- [ ] **Step 3: Scrivere le utilità**

```js
// src/pe-fratte/sondaggio-utili.js
import { tokenValido } from "../../api/_lib/regole.js";

/* Codice casuale del dispositivo per il sondaggio (vedi informativa privacy).
   Se la memoria del browser manca o è bloccata, il codice vale per questa visita. */
export const CHIAVE_TOKEN = "pf-sondaggio";

export function leggiToken(storage, nuovo = () => crypto.randomUUID()) {
  try {
    const salvato = storage?.getItem(CHIAVE_TOKEN);
    if (tokenValido(salvato)) return salvato;
    const token = nuovo();
    storage?.setItem(CHIAVE_TOKEN, token);
    return token;
  } catch {
    return nuovo();
  }
}

/* Ordine delle mete mescolato una volta per dispositivo: chi sta in cima a una
   lista lunga prende voti in più, così il vantaggio si distribuisce */
function hash32(testo) {
  let h = 0x811c9dc5;
  for (let i = 0; i < testo.length; i++) {
    h ^= testo.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function generatore(seme) {
  let a = seme;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function ordineMescolato(elementi, seme) {
  const caso = generatore(hash32(String(seme)));
  const copia = [...elementi];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(caso() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/* "giovedì 22 ottobre alle 23:59", sempre in ora italiana */
const GIORNO = new Intl.DateTimeFormat("it-IT", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Rome" });
const ORA = new Intl.DateTimeFormat("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" });

export function giornoEOra(iso) {
  const d = new Date(iso);
  return `${GIORNO.format(d)} alle ${ORA.format(d)}`;
}
```

- [ ] **Step 4: Lanciare i test e verificare che passino**

Run: `npm test`
Expected: PASS, 41 + 8 = 49 test.

Se `semi diversi ordini diversi` fallisse perché due semi danno per caso lo stesso ordine (improbabile con 15 elementi), sostituisci `NUOVO` con un altro UUID v4 in quel test. Non toccare l'algoritmo.

- [ ] **Step 5: Spostare `DifficoltaBadge` e `DatiSentiero` in `Sentiero.jsx`**

```jsx
// src/pe-fratte/Sentiero.jsx
import PfIcon from "./PfIcon.jsx";
import { PE_FRATTE } from "../content.js";

/* Pezzi comuni alle card delle uscite e alle mete del sondaggio */
export function DifficoltaBadge({ chiave }) {
  const d = PE_FRATTE.difficolta[chiave];
  if (!d) return null;
  return (
    <span className={"pf-diff pf-diff-" + d.tono} title={d.nota}>
      {d.label}
    </span>
  );
}

/* Dati sentiero in mono, formato fisso: 9,4 KM · ↑ 410 M · 3–4 H */
export function DatiSentiero({ p }) {
  const dati = [
    p.km && { icon: "route", testo: `${p.km} km`, label: "Lunghezza" },
    p.dislivello && { icon: "mountain", testo: `↑ ${p.dislivello} m`, label: "Dislivello" },
    p.durata && { icon: "clock", testo: p.durata, label: "Durata camminata" },
  ].filter(Boolean);
  if (dati.length === 0) return null;
  return (
    <dl className="pf-dati">
      {dati.map((d) => (
        <div key={d.icon} className="pf-dato">
          <dt className="pf-visually-hidden">{d.label}</dt>
          <dd>
            <PfIcon name={d.icon} />
            {d.testo}
          </dd>
        </div>
      ))}
    </dl>
  );
}
```

In `src/pe-fratte/PeFratte.jsx`:
- eliminare le righe 31-39 (`function DifficoltaBadge…`) e 51-72 (commento e `function DatiSentiero…`), lasciando `Partecipazione`;
- aggiungere, dopo `import PfIcon from "./PfIcon.jsx";`:

```jsx
import { DatiSentiero, DifficoltaBadge } from "./Sentiero.jsx";
```

- [ ] **Step 6: Aggiungere l'icona `check`**

In `src/pe-fratte/PfIcon.jsx`, dentro `PATHS`, dopo la riga di `externalLink`:

```jsx
  check: <path d="M20 6 9 17l-5-5" />,
```

- [ ] **Step 7: Scrivere l'hook**

```js
// src/pe-fratte/useSondaggio.js
import { useCallback, useEffect, useState } from "react";
import { statoSondaggio } from "../../api/_lib/regole.js";
import { leggiToken } from "./sondaggio-utili.js";

/* localStorage può mancare o lanciare (navigazione privata, dati bloccati) */
function memoriaLocale() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/* Stato del sondaggio per la pagina. All'inizio decide l'orologio locale
   (così la sezione non salta), poi decide sempre il server. */
export default function useSondaggio(config) {
  const [token] = useState(() => leggiToken(memoriaLocale()));
  const [s, setS] = useState(() => ({
    stato: statoSondaggio(config, new Date()),
    haVotato: false,
    scelte: [],
    risultati: null,
    caricamento: config.attivo,
    irraggiungibile: false,
    invio: "fermo",
    avviso: null,
  }));

  const applica = useCallback((corpo, extra = {}) => {
    setS((prima) => ({
      ...prima,
      stato: corpo.stato ?? prima.stato,
      haVotato: Boolean(corpo.haVotato),
      scelte: corpo.scelte ?? [],
      risultati: corpo.risultati ?? null,
      caricamento: false,
      irraggiungibile: false,
      ...extra,
    }));
  }, []);

  const ricarica = useCallback(async () => {
    setS((prima) => ({ ...prima, caricamento: true, irraggiungibile: false }));
    try {
      const r = await fetch(`/api/sondaggio?token=${encodeURIComponent(token)}`, { cache: "no-store" });
      if (!r.ok) throw new Error(String(r.status));
      applica(await r.json());
    } catch {
      setS((prima) => ({ ...prima, caricamento: false, irraggiungibile: true }));
    }
  }, [token, applica]);

  useEffect(() => {
    if (config.attivo) ricarica();
  }, [config.attivo, ricarica]);

  const vota = useCallback(
    async (mete) => {
      setS((prima) => ({ ...prima, invio: "in-corso", avviso: null }));
      let r;
      let corpo;
      try {
        r = await fetch("/api/sondaggio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, mete }),
        });
        corpo = await r.json().catch(() => ({}));
      } catch {
        setS((prima) => ({ ...prima, invio: "errore" }));
        return;
      }
      if (r.ok || r.status === 409) applica(corpo, { invio: "fermo" });
      else if (r.status === 403 && corpo.errore === "chiuso") applica(corpo, { invio: "fermo", avviso: "non-contato" });
      else if (r.status === 403) applica(corpo, { invio: "fermo" });
      else if (r.status === 429) setS((prima) => ({ ...prima, invio: "tetto" }));
      else setS((prima) => ({ ...prima, invio: "errore" }));
    },
    [token, applica]
  );

  return {
    ...s,
    token,
    visibile: config.attivo && s.stato !== "prima",
    votoAperto: config.attivo && s.stato === "aperto",
    ricarica,
    vota,
  };
}
```

- [ ] **Step 8: Verificare che la pagina sia invariata**

Run: `npm test && npm run lint && npm run build`
Expected: test verdi, nessun errore di lint (eventuali avvisi già presenti prima vanno bene), build completata.

Poi, con il dev server del Task 4, aprire `http://localhost:5196/pe-fratte`. Le card delle uscite e l'archivio devono mostrare badge di difficoltà e dati sentiero come prima. Controllare con `read_console_messages` che non ci siano errori.

- [ ] **Step 9: Commit**

```bash
git add src/pe-fratte/sondaggio-utili.js src/pe-fratte/sondaggio-utili.test.js src/pe-fratte/Sentiero.jsx src/pe-fratte/PeFratte.jsx src/pe-fratte/PfIcon.jsx src/pe-fratte/useSondaggio.js
git commit -m "Sondaggio: codice del dispositivo, ordine delle mete e hook della pagina" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Sezione del sondaggio nella pagina

**Files:**
- Create: `src/pe-fratte/Sondaggio.jsx`
- Modify: `src/pe-fratte/PeFratte.jsx` (hero e montaggio della sezione)
- Modify: `src/pe-fratte/pe-fratte.css` (blocco "Sondaggio" e ancora `#sondaggio`)

**Interfaces:**
- Consumes:
  - `useSondaggio` restituisce `s` (Task 5);
  - `SONDAGGIO` (Task 1);
  - `DifficoltaBadge`, `DatiSentiero`, `ordineMescolato`, `giornoEOra` (Task 5);
  - `PfIcon` con `check` e `mapPin`.
- Produces:
  - `<Sondaggio config={SONDAGGIO} s={s} />`, che non rende nulla se `s.visibile` è falso;
  - `Hero({ votoAperto })`.

- [ ] **Step 1: Scrivere il componente**

```jsx
// src/pe-fratte/Sondaggio.jsx
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PfIcon from "./PfIcon.jsx";
import { DatiSentiero, DifficoltaBadge } from "./Sentiero.jsx";
import { giornoEOra, ordineMescolato } from "./sondaggio-utili.js";

/* Sondaggio "Le mete di novembre". Non applica regole: mostra quello che
   dice il server (useSondaggio) e gli manda le tre scelte. */
export default function Sondaggio({ config, s }) {
  const titoloRisultati = useRef(null);
  const appenaVotato = useRef(false);
  const montato = useRef(false);
  const fase = s.caricamento
    ? "caricamento"
    : s.irraggiungibile
      ? "irraggiungibile"
      : s.risultati
        ? "risultati"
        : s.stato === "attesa"
          ? "attesa"
          : "scheda";

  /* cambiando fase la sezione cambia altezza: i trigger più in basso vanno ricalcolati */
  useEffect(() => {
    if (montato.current) ScrollTrigger.refresh();
    montato.current = true;
  }, [fase, s.visibile]);

  /* dopo il voto il focus passa alla classifica */
  useEffect(() => {
    if (fase === "risultati" && appenaVotato.current) {
      appenaVotato.current = false;
      titoloRisultati.current?.focus();
    }
  }, [fase]);

  if (!s.visibile) return null;
  const votoFinito = s.stato === "attesa" || s.stato === "chiuso";

  return (
    <section className="pf-section pf-sondaggio" id="sondaggio" aria-labelledby="sondaggio-titolo">
      <div className="pf-container">
        <p className="pf-meta">Sondaggio</p>
        <h2 className="pf-h2" id="sondaggio-titolo">
          {votoFinito ? "Le mete di novembre" : "Dove andiamo a novembre?"}
        </h2>

        {fase === "caricamento" && (
          <p className="pf-sondaggio-nota" role="status">
            Carico il sondaggio…
          </p>
        )}
        {fase === "irraggiungibile" && (
          <div className="pf-sondaggio-nota" role="status">
            <p>Sondaggio non raggiungibile, riprova tra poco.</p>
            <button type="button" className="pf-btn pf-btn-secondary" onClick={s.ricarica}>
              Riprova
            </button>
          </div>
        )}
        {fase === "scheda" && (
          <Scheda
            config={config}
            s={s}
            onInvio={() => {
              appenaVotato.current = true;
            }}
          />
        )}
        {fase === "attesa" && <Attesa config={config} s={s} />}
        {fase === "risultati" && <Risultati config={config} s={s} titoloRef={titoloRisultati} />}
      </div>
    </section>
  );
}

function Scheda({ config, s, onInvio }) {
  const [scelte, setScelte] = useState([]);
  const mete = useMemo(() => ordineMescolato(config.mete, s.token), [config.mete, s.token]);
  const idBase = useId();
  const piene = scelte.length === config.voti;
  const inCorso = s.invio === "in-corso";

  const cambia = (id) =>
    setScelte((prima) =>
      prima.includes(id) ? prima.filter((x) => x !== id) : prima.length < config.voti ? [...prima, id] : prima
    );

  const invia = (evento) => {
    evento.preventDefault();
    if (!piene || inCorso) return;
    onInvio();
    s.vota(scelte);
  };

  return (
    <form className="pf-sondaggio-form" onSubmit={invia}>
      <p className="pf-lead">
        Scegli le {config.voti} mete che vorresti fare: le {config.vincitrici} più votate diventano le uscite di
        novembre. Si vota fino a {giornoEOra(config.chiusura)}.
      </p>
      <fieldset className="pf-sondaggio-mete">
        <legend className="pf-visually-hidden">Scegli {config.voti} mete</legend>
        <ul>
          {mete.map((m) => {
            const scelta = scelte.includes(m.id);
            const spenta = !scelta && piene;
            const id = `${idBase}-${m.id}`;
            return (
              <li key={m.id} className={"pf-voce" + (scelta ? " is-scelta" : "") + (spenta ? " is-spenta" : "")}>
                <input
                  id={id}
                  type="checkbox"
                  className="pf-voce-check"
                  checked={scelta}
                  disabled={spenta || inCorso}
                  onChange={() => cambia(m.id)}
                  aria-describedby={id + "-dati"}
                />
                <label htmlFor={id} className="pf-voce-etichetta">
                  <span className="pf-voce-segno" aria-hidden="true">
                    <PfIcon name="check" />
                  </span>
                  <span className="pf-voce-nome">{m.nome}</span>
                  <DifficoltaBadge chiave={m.difficolta} />
                </label>
                <div id={id + "-dati"} className="pf-voce-dati">
                  {m.zona && (
                    <p className="pf-zona">
                      <PfIcon name="mapPin" />
                      {m.zona}
                    </p>
                  )}
                  <DatiSentiero p={m} />
                </div>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <div className="pf-sondaggio-barra">
        <p className="pf-sondaggio-conta" aria-live="polite">
          {scelte.length} di {config.voti}
        </p>
        <button type="submit" className="pf-btn pf-btn-accent" disabled={!piene || inCorso}>
          {inCorso
            ? "Invio in corso…"
            : piene
              ? "Conferma il voto, non si può cambiare"
              : `Scegline ancora ${config.voti - scelte.length}`}
        </button>
      </div>
      {s.invio === "errore" && (
        <p className="pf-sondaggio-errore" role="alert">
          Il voto non è arrivato. Le tue scelte sono ancora qui: riprova.
        </p>
      )}
      {s.invio === "tetto" && (
        <p className="pf-sondaggio-errore" role="alert">
          Da questa rete sono già arrivati molti voti. Se sei sulla Wi-Fi di casa o di un locale, riprova con la rete
          dati del telefono.
        </p>
      )}
    </form>
  );
}

function NonContato() {
  return (
    <p className="pf-sondaggio-avviso" role="status">
      Il sondaggio si è chiuso prima che il tuo voto arrivasse: non è stato contato.
    </p>
  );
}

/* Tra chiusura e pubblicazione: la classifica non esce dal server per nessuno */
function Attesa({ config, s }) {
  const nome = new Map(config.mete.map((m) => [m.id, m.nome]));
  return (
    <div className="pf-risultati">
      {s.avviso === "non-contato" && <NonContato />}
      <p className="pf-lead">
        Il sondaggio è chiuso. La classifica esce {giornoEOra(config.pubblicazione)}.
      </p>
      {s.haVotato && (
        <p className="pf-risultati-nota">Il tuo voto: {s.scelte.map((id) => nome.get(id) ?? id).join(", ")}.</p>
      )}
      <p className="pf-note">Riapri la pagina dopo quell'ora per vederla.</p>
    </div>
  );
}

function Risultati({ config, s, titoloRef }) {
  const { risultati } = s;
  const chiuso = s.stato === "chiuso";
  const perId = new Map(config.mete.map((m) => [m.id, m]));
  const vincenti = new Set(risultati.vincitrici ?? []);
  const massimo = Math.max(1, ...risultati.mete.map((m) => m.voti));
  const votanti =
    risultati.votanti === 1 ? "Ha votato 1 persona" : `Hanno votato ${risultati.votanti} persone`;

  return (
    <div className="pf-risultati">
      {s.avviso === "non-contato" && <NonContato />}
      <h3 className="pf-risultati-titolo" ref={titoloRef} tabIndex={-1}>
        {chiuso ? "Classifica finale" : "Come sta andando"}
      </h3>
      <p className="pf-risultati-nota">
        {votanti}. {chiuso ? "Il sondaggio è chiuso." : `Si chiude ${giornoEOra(config.chiusura)}.`}
      </p>
      {chiuso && risultati.pariMerito && (
        <p className="pf-risultati-nota">
          Pari merito al terzo posto: le mete evidenziate sono più di {config.vincitrici}, si decide nel gruppo.
        </p>
      )}
      <ol className="pf-classifica">
        {risultati.mete.map((m) => {
          const meta = perId.get(m.id);
          if (!meta) return null;
          return (
            <li key={m.id} className={"pf-classifica-voce" + (vincenti.has(m.id) ? " is-vincitrice" : "")}>
              <div className="pf-classifica-testa">
                <span className="pf-classifica-nome">{meta.nome}</span>
                {vincenti.has(m.id) && <span className="pf-classifica-tag">Si va</span>}
                {s.scelte.includes(m.id) && <span className="pf-classifica-tuo">Il tuo voto</span>}
                <span className="pf-classifica-voti">{m.voti === 1 ? "1 voto" : `${m.voti} voti`}</span>
              </div>
              <span className="pf-classifica-barra" aria-hidden="true">
                <span style={{ "--quota": m.voti / massimo }} />
              </span>
            </li>
          );
        })}
      </ol>
      {!chiuso && <p className="pf-note">La classifica si aggiorna quando riapri la pagina.</p>}
    </div>
  );
}
```

- [ ] **Step 2: Montare la sezione e cambiare la hero in `PeFratte.jsx`**

Import, dopo quello di `Sentiero.jsx`:

```jsx
import Sondaggio from "./Sondaggio.jsx";
import useSondaggio from "./useSondaggio.js";
import { SONDAGGIO } from "./sondaggio.config.js";
```

`function Hero()` diventa `function Hero({ votoAperto })`. Il blocco `<div className="pf-hero-actions" data-reveal>…</div>` diventa:

```jsx
          <div className="pf-hero-actions" data-reveal>
            {/* Nei giorni del voto l'oro va al sondaggio */}
            {votoAperto ? (
              <>
                <a href="#sondaggio" className="pf-btn pf-btn-accent">
                  Vota le mete di novembre
                </a>
                <BottoneGruppo variant="secondary" />
              </>
            ) : (
              <>
                <BottoneGruppo />
                <a href={ANCORA_USCITE} className="pf-btn pf-btn-secondary">
                  Vedi le uscite
                </a>
              </>
            )}
          </div>
```

In `export default function PeFratte()`, dopo `const scope = useNatura();`:

```jsx
  const sondaggio = useSondaggio(SONDAGGIO);
```

Nel `<main>` sostituire `<Hero />` con:

```jsx
        <Hero votoAperto={sondaggio.votoAperto} />
        <Sondaggio config={SONDAGGIO} s={sondaggio} />
```

`<Uscite />` resta subito dopo.

- [ ] **Step 3: Aggiungere gli stili**

In `src/pe-fratte/pe-fratte.css`, nella regola delle ancore sotto `/* ---------- Sezioni ---------- */`, aggiungere `#sondaggio`:

```css
#galleria, .pf-galleria-gruppo, #fatte-titolo, #sondaggio { scroll-margin-top: 88px; }
```

Poi, subito prima di `/* ---------- CTA finale: paesaggio al tramonto ---------- */`, inserire:

```css
/* ---------- Sondaggio (Sondaggio.jsx) ---------- */
.pf-sondaggio-nota {
  display: grid;
  gap: var(--space-4);
  justify-items: start;
  margin-top: var(--space-5);
  font: 700 13px/1.4 var(--font-mono);
  letter-spacing: .04em;
  color: var(--su-verde-3);
}
.pf-sondaggio-form { margin-top: var(--space-5); }
.pf-sondaggio-mete { margin: 0; padding: 0; border: 0; min-width: 0; }
.pf-sondaggio-mete ul { display: grid; gap: var(--space-4); margin-top: var(--space-5); }
@media (min-width: 860px) {
  .pf-sondaggio-mete ul { grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start; }
}

/* Meta da votare: carta su verde. L'etichetta si allarga a tutta la riga,
   così si tocca ovunque; la casella vera resta per tastiera e lettori. */
.pf-voce {
  position: relative;
  display: grid;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-4) var(--space-4) calc(var(--space-4) + 40px);
  background: var(--bg-surface);
  color: var(--fg-2);
  border: var(--border-w-strong) solid var(--border-strong);
  border-radius: var(--radius-md);
  box-shadow: 4px 4px 0 var(--pf-bosco-600);
  transition: box-shadow var(--dur-fast) var(--ease-out), opacity var(--dur-fast) var(--ease-out);
}
.pf-voce.is-scelta { box-shadow: var(--shadow-stamp-oro); }
.pf-voce.is-spenta { opacity: .5; }
.pf-voce:has(.pf-voce-check:focus-visible) { box-shadow: var(--focus-ring); }
.pf-voce-check { position: absolute; width: 1px; height: 1px; opacity: 0; }
.pf-voce-etichetta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2) var(--space-3);
  cursor: pointer;
}
.pf-voce-etichetta::after { content: ""; position: absolute; inset: 0; border-radius: inherit; }
.is-spenta .pf-voce-etichetta { cursor: not-allowed; }
.pf-voce-segno {
  position: absolute;
  left: var(--space-4);
  top: var(--space-4);
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  background: var(--pf-carta-50);
  color: var(--pf-bosco-900);
  border: var(--border-w-strong) solid var(--pf-bosco-900);
  border-radius: var(--radius-xs);
}
.pf-voce-segno .pf-icon { width: 18px; height: 18px; opacity: 0; }
.is-scelta .pf-voce-segno { background: var(--pf-oro-500); }
.is-scelta .pf-voce-segno .pf-icon { opacity: 1; }
.pf-voce-nome {
  font: 900 clamp(24px, 3.4vw, 30px)/.95 var(--font-display);
  text-transform: uppercase;
  color: var(--fg-brand);
}
.pf-voce-dati { display: grid; gap: var(--space-2); }
.pf-voce .pf-dati { padding-top: var(--space-2); border-top: var(--border-w) dashed var(--border-1); }

/* Contatore e conferma: su telefono restano in fondo allo schermo
   finché la lista è in vista */
.pf-sondaggio-barra {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-top: var(--space-6);
  padding: var(--space-4) 0;
  background: var(--verde-notte);
  border-top: var(--border-w) solid rgba(244, 238, 226, .18);
}
@media (max-width: 859px) {
  .pf-sondaggio-barra {
    position: sticky;
    bottom: 0;
    z-index: 3;
    margin-inline: calc(-1 * var(--space-4));
    padding-inline: var(--space-4);
  }
  .pf-sondaggio-barra .pf-btn { flex: 1 1 auto; }
}
.pf-sondaggio-conta { font: 700 15px/1 var(--font-mono); letter-spacing: .06em; color: var(--su-verde-1); }
.pf-sondaggio-barra .pf-btn:disabled { opacity: .55; cursor: not-allowed; box-shadow: none; }
.pf-sondaggio-errore { margin-top: var(--space-3); font-weight: 600; color: var(--pf-oro-200); }

/* Classifica */
.pf-risultati { display: grid; gap: var(--space-3); margin-top: var(--space-5); }
.pf-sondaggio-avviso {
  padding: var(--space-3) var(--space-4);
  border: var(--border-w-strong) solid var(--pf-oro-500);
  border-radius: var(--radius-sm);
  color: var(--su-verde-1);
}
.pf-risultati-titolo {
  font: 900 clamp(26px, 3.6vw, 34px)/1 var(--font-display);
  text-transform: uppercase;
  color: var(--su-verde-1);
  scroll-margin-top: 88px;
}
.pf-risultati-nota { color: var(--su-verde-2); }
.pf-classifica { display: grid; gap: var(--space-4); margin-top: var(--space-3); }
.pf-classifica-voce { display: grid; gap: var(--space-2); }
.pf-classifica-testa { display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--space-2) var(--space-3); }
.pf-classifica-nome { font: 800 22px/1.05 var(--font-display); text-transform: uppercase; color: var(--su-verde-1); }
.pf-classifica-voti { margin-left: auto; font: 700 14px/1 var(--font-mono); color: var(--su-verde-2); }
.pf-classifica-tag,
.pf-classifica-tuo {
  padding: 4px 7px;
  border-radius: var(--radius-xs);
  font: 800 13px/1 var(--font-display);
  letter-spacing: .05em;
  text-transform: uppercase;
}
.pf-classifica-tag { background: var(--pf-oro-500); color: var(--pf-bosco-900); }
.pf-classifica-tuo { border: var(--border-w-strong) solid var(--pf-sabbia-400); color: var(--pf-sabbia-200); }
.pf-classifica-barra {
  display: block;
  height: 10px;
  overflow: hidden;
  background: rgba(244, 238, 226, .12);
  border-radius: var(--radius-xs);
}
.pf-classifica-barra span {
  display: block;
  height: 100%;
  width: calc(var(--quota) * 100%);
  background: var(--pf-bosco-300);
  transform-origin: left;
  animation: pf-cresce .9s var(--ease-trail) both;
}
.is-vincitrice .pf-classifica-barra span { background: var(--pf-oro-500); }
@keyframes pf-cresce { from { transform: scaleX(0); } }
```

- [ ] **Step 4: Verificare nel browser tutti gli stati**

**Preparazione.** Oggi l'orologio del browser è prima dell'apertura, quindi la sezione partirebbe nascosta. Per tutta la verifica, **solo in locale e senza committarlo**, porta `apertura` in `sondaggio.config.js` a `"2026-10-01T08:00:00+02:00"`. Così l'orologio locale dice "aperto" e gli stati si pilotano dal server.

Vite si riavvia da solo quando cambia la configurazione, e il riavvio azzera i voti in memoria. Per simulare un dispositivo nuovo: `localStorage.removeItem("pf-sondaggio")` da `javascript_tool`, poi ricaricare.

1. **Prima, ma decide il server**: `curl -s "http://localhost:5196/__sondaggio?ora=2026-09-30T10:00:00Z"`, poi ricaricare `/pe-fratte`. La sezione compare un istante ("Carico il sondaggio…") e poi sparisce; la hero torna con l'oro su "Entra nella community".
2. **Aperto**: `…/__sondaggio?ora=2026-10-20T10:00:00Z` e ricaricare.
   - Compare la sezione.
   - La hero ha "Vota le mete di novembre" in oro.
   - Le 15 mete sono in ordine mescolato, stabile ricaricando.
   - Il contatore va da "0 di 3" a "3 di 3". Alla terza scelta le altre si spengono; togliendone una si riaccendono.
   - Il bottone dice "Scegline ancora N", poi "Conferma il voto, non si può cambiare".
3. **Errore all'invio**: scegliere tre mete, poi `…/__sondaggio?ora=2026-10-20T10:00:00Z&guasto=1` e confermare. Compare "Il voto non è arrivato…" e le scelte restano. Togliere il guasto con `…/__sondaggio?ora=2026-10-20T10:00:00Z` e confermare di nuovo: il voto passa.
4. **Dopo il voto**: "Come sta andando", tre mete con "Il tuo voto", "Ha votato 1 persona", "Si chiude giovedì 22 ottobre alle 23:59". Il focus è sul titolo della classifica: `document.activeElement.textContent` in `javascript_tool`.
5. **Ricarica**: la classifica resta (`haVotato` arriva dal server).
6. **Tetto**: votare con 9 codici diversi via `curl` (in sviluppo il tetto vale per tutto `localhost`). Il decimo voto, da un dispositivo nuovo nella pagina, passa; l'undicesimo mostra il messaggio sulla rete dati.
7. **Chiusura durante la scelta**: da un dispositivo nuovo scegliere tre mete senza confermare, passare a `…/__sondaggio?ora=2026-10-23T10:00:00Z` (attesa), poi confermare. Compare il messaggio d'attesa con l'avviso "non è stato contato".
8. **Attesa**: ricaricare con l'orologio al 23 ottobre, ore 10 UTC.
   - Titolo "Le mete di novembre" e "Il sondaggio è chiuso. La classifica esce venerdì 23 ottobre alle 18:00."
   - Il dispositivo che ha votato vede "Il tuo voto: …" con i nomi delle tre mete. Nessuna classifica e nessuna barra.
   - Un dispositivo nuovo vede solo il messaggio.
   - La hero è tornata com'era.
   - In `read_network_requests` la risposta di `/api/sondaggio` non contiene `risultati`.
9. **Chiuso**: `…/__sondaggio?ora=2026-10-24T10:00:00Z` e ricaricare.
   - Titolo "Le mete di novembre", poi "Classifica finale".
   - Le prime tre hanno "Si va" e barre oro.
   - La hero è tornata com'era.
   - Un dispositivo nuovo vede la classifica senza aver votato.
10. **Pari merito**: dopo un riavvio (salvare di nuovo `sondaggio.config.js`), con l'orologio al 20 ottobre, votare via `curl` in modo che la terza e la quarta meta abbiano gli stessi voti. Poi passare al 24 e ricaricare: c'è la nota del pari merito e le vincitrici sono quattro.
11. **Server irraggiungibile**: `…/__sondaggio?ora=2026-10-20T10:00:00Z&guasto=1` e ricaricare. Compare "Sondaggio non raggiungibile" con "Riprova". Togliere il guasto e premere "Riprova": torna lo stato giusto.

Per tutti gli stati:
- `resize_window` mobile (375×812): la barra di conferma resta in fondo mentre si scorre la lista, nessuno scroll orizzontale (`document.documentElement.scrollWidth <= innerWidth`).
- Desktop: due colonne.
- Tastiera: Tab arriva alle caselle, Spazio seleziona, l'anello di focus si vede sulla riga.
- `read_console_messages` senza errori.

Fare uno screenshot di scheda, classifica parziale, attesa e classifica finale, su mobile e desktop.

**Alla fine** riportare `apertura` a `"2026-10-19T08:00:00+02:00"`. Verifica: `git diff src/pe-fratte/sondaggio.config.js` deve risultare vuoto.

- [ ] **Step 5: Lint, test e build**

Run: `npm test && npm run lint && npm run build`
Expected: tutto verde.

- [ ] **Step 6: Commit**

```bash
git add src/pe-fratte/Sondaggio.jsx src/pe-fratte/PeFratte.jsx src/pe-fratte/pe-fratte.css
git commit -m "Pe' Fratte: sezione del sondaggio sulle mete di novembre" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Informativa privacy e script di controllo delle schede

**Files:**
- Modify: `public/privacy/index.html`
- Create: `scripts/sondaggio-schede.mjs`

**Interfaces:**
- Consumes:
  - `SONDAGGIO` (Task 1);
  - `creaArchivioRedis`, `prefissoChiavi` (Task 2);
  - `classifica` (Task 1).
- Produces: il comando `node --env-file=.env.local scripts/sondaggio-schede.mjs [production|preview|development]`, che stampa il CSV delle schede.

- [ ] **Step 1: Aggiornare l'informativa**

In `public/privacy/index.html`:

1. In `<p class="updated">` mettere la data del giorno del commit, ad esempio `Ultimo aggiornamento: 16 ottobre 2026`.

2. In "Quali dati raccogliamo", come penultimo `<li>`, prima di "Messaggi che ci mandi":

```html
        <li>
          <strong>Sondaggi della pagina Pe' Fratte</strong>: quando voti salviamo le mete che
          hai scelto e l'orario del voto, legati a un codice casuale creato dal tuo browser.
          Per limitare i voti ripetuti dalla stessa rete conserviamo anche una versione
          cifrata e non reversibile del tuo indirizzo IP. Non chiediamo nome, email o telefono.
        </li>
```

3. In "Perché e su quale base", come ultimo `<li>`:

```html
        <li>
          <strong>Far funzionare i sondaggi</strong> e tenerne il risultato libero da voti
          ripetuti: la tua richiesta di votare (art. 6.1.b GDPR) e il nostro legittimo
          interesse (art. 6.1.f GDPR).
        </li>
```

4. Nella tabella dei cookie, dopo la riga `cavelab-cookie-consent`:

```html
            <tr>
              <td><code>pf-sondaggio</code></td>
              <td>Tecnico (memoria locale del browser)</td>
              <td>Codice casuale che permette di votare una sola volta ai sondaggi della pagina Pe' Fratte</td>
              <td>Finché non lo cancelli</td>
            </tr>
```

5. In "A chi arrivano i dati", come ultimo `<li>`:

```html
        <li>
          <strong>Upstash, Inc.</strong>, che conserva i voti dei sondaggi su server a
          Francoforte (Germania).
          <a href="https://upstash.com/trust/privacy.pdf" target="_blank" rel="noopener noreferrer">Informativa di Upstash</a>.
        </li>
```

6. In "Per quanto tempo", in coda al paragrafo esistente, prima di `</p>`:

```html
        La versione cifrata dell'indirizzo IP usata per i sondaggi si cancella da sola
        sette giorni dopo la chiusura del sondaggio; le schede di voto, che contengono solo
        le mete scelte e l'orario, restano finché non decidiamo di cancellarle.
```

Verifica: aprire `http://localhost:5196/privacy` nel browser. La tabella mostra la nuova riga e il link a Upstash risponde: `curl -sI https://upstash.com/trust/privacy.pdf | head -1` deve dare `HTTP/2 200`.

- [ ] **Step 2: Scrivere lo script di controllo**

```js
// scripts/sondaggio-schede.mjs
/* Stampa le schede del sondaggio (orario e tre mete, senza codici) in CSV,
   e su stderr il riepilogo dei voti.
   Uso:
     vercel env pull .env.local        (scarica le credenziali; .env.local non va in git)
     node --env-file=.env.local scripts/sondaggio-schede.mjs [production|preview|development] > schede.csv */
import { Redis } from "@upstash/redis";
import { SONDAGGIO } from "../src/pe-fratte/sondaggio.config.js";
import { creaArchivioRedis, prefissoChiavi } from "../api/_lib/archivio.js";
import { classifica } from "../api/_lib/regole.js";

const ambiente = process.argv[2] ?? "production";
if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
  console.error("Mancano KV_REST_API_URL e KV_REST_API_TOKEN: lancia prima `vercel env pull .env.local`.");
  process.exit(1);
}

const redis = new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN });
const archivio = creaArchivioRedis(redis, prefissoChiavi(ambiente, SONDAGGIO.id));

const schede = (await archivio.schede()).sort((a, b) => a.t.localeCompare(b.t));
console.log(["orario", ...Array.from({ length: SONDAGGIO.voti }, (_, i) => `meta${i + 1}`)].join(","));
for (const s of schede) console.log([s.t, ...s.mete].join(","));

const { votanti, voti } = await archivio.conteggi();
console.error(`\n${ambiente} · ${SONDAGGIO.id} · ${votanti} schede`);
for (const m of classifica(SONDAGGIO, voti)) console.error(`${String(m.voti).padStart(4)}  ${m.id}`);
```

Verifica, senza credenziali: `node scripts/sondaggio-schede.mjs` deve uscire con il messaggio "Mancano KV_REST_API_URL…" e codice 1. La verifica con i dati veri si fa nel Task 8.

- [ ] **Step 3: Commit**

```bash
git add public/privacy/index.html scripts/sondaggio-schede.mjs
git commit -m "Sondaggio: informativa privacy e script per controllare le schede" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Prova in anteprima e lancio

Questo task richiede l'utente in tre punti: ok al push, dati di lancio e ok al merge. Le prime verifiche si possono fare con i dati provvisori.

**Files:**
- Modify: `src/pe-fratte/sondaggio.config.js` (prova temporanea, poi dati veri)

**Interfaces:**
- Consumes: tutto il lavoro precedente.
- Produces: il sondaggio in produzione, invisibile fino all'apertura.

- [ ] **Step 1: Chiedere all'utente l'ok per il push del branch.** Il push crea un'anteprima Vercel pubblica (anche se protetta). Senza ok ci si ferma qui.

- [ ] **Step 2: Commit temporaneo di prova**

In `sondaggio.config.js`:
- `id: "prova-<AAAAMMGG>"`;
- `apertura` = adesso + 10 minuti;
- `chiusura` = adesso + 40 minuti;
- `pubblicazione` = adesso + 50 minuti.

Tutti gli orari in ISO con `+02:00`.

```bash
git add src/pe-fratte/sondaggio.config.js
git commit -m "Sondaggio: PROVA in anteprima (da annullare)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push -u origin feat/sondaggio-pe-fratte
```

- [ ] **Step 3: Verificare l'anteprima**

Recuperare l'URL di anteprima del deploy del branch (`vercel ls` o la dashboard). Se l'anteprima è protetta da Vercel Authentication, aprirla nel browser dove l'utente è già autenticato, oppure usare `vercel curl`.

1. Regione: `vercel curl /api/sondaggio --deployment <url>` oppure `curl -sI <url>/api/sondaggio`. L'intestazione `x-vercel-id` deve contenere `fra1`.
2. Prima dell'apertura: sezione assente, GET con `"stato":"prima"`.
3. Dopo l'apertura: percorrere da mobile (375×812) e da desktop la scheda, il voto, la classifica, la ricarica e il doppio voto (`409`, si vede la classifica).
4. Redis: `vercel env pull .env.local`, poi `node --env-file=.env.local scripts/sondaggio-schede.mjs preview`. Si vedono le schede della prova e i conteggi giusti. In `production` non c'è nulla: `0 schede`.
5. Tra chiusura e pubblicazione: messaggio d'attesa, nessuna classifica nemmeno per chi ha votato (controllare la risposta di `/api/sondaggio`). Nel frattempo lo script `preview` mostra già i conteggi.
6. Dopo la pubblicazione: classifica finale pubblica, vincitrici evidenziate.

Annotare per l'utente gli esiti, con screenshot.

- [ ] **Step 4: Annullare la prova**

```bash
git revert --no-edit HEAD
```

Il messaggio generato da `git revert` va integrato con la riga Co-Authored-By: usare `git commit --amend -m "Sondaggio: annulla la prova in anteprima" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`.

- [ ] **Step 5: Inserire i dati di lancio (dall'utente)**

In `sondaggio.config.js`:
- `id: "novembre-2026"`;
- le mete vere, con id slug stabili e solo i dati sentiero forniti;
- `apertura`, `chiusura` e `pubblicazione` (venerdì `2026-10-23T18:00:00+02:00`) con `+02:00`. Per "giovedì notte" suggerire all'utente `2026-10-22T23:59:00+02:00`: la mezzanotte cadrebbe su venerdì 23 e la pagina scriverebbe "venerdì 23 ottobre alle 00:00";
- togliere il commento `PROVVISORI`.

- [ ] **Step 6: Controlli prima del merge (spec §10)**

- [ ] `id` è `novembre-2026`, nessun residuo di `prova` (`git grep -n "prova-" src/pe-fratte/sondaggio.config.js` vuoto)
- [ ] orari con `+02:00` e giusti rispetto a quelli dati dall'utente
- [ ] `"regions": ["fra1"]` in `vercel.json`
- [ ] `npm test`, `npm run lint`, `npm run build` verdi
- [ ] verifica visiva con le mete vere (stato aperto via `/__sondaggio?ora=…` e `apertura` anticipata solo in locale, come nel Task 6), su mobile e desktop

```bash
git add src/pe-fratte/sondaggio.config.js
git commit -m "Sondaggio: mete e orari di novembre" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 7: PR e merge, con ok dell'utente**

Push, poi apertura della PR verso `main` con descrizione e la riga `🤖 Generated with [Claude Code](https://claude.com/claude-code)` in fondo. Il merge avviene prima di lunedì 19 ottobre e solo con ok esplicito.

Dopo il deploy di produzione:
- `curl -s https://www.cave-lab.it/api/sondaggio` dà `{"stato":"prima","haVotato":false}`;
- `/pe-fratte` non mostra la sezione;
- l'header `x-vercel-id` contiene `fra1`.

- [ ] **Step 8: Consegna all'utente**

Il link da condividere è `https://www.cave-lab.it/pe-fratte#sondaggio`. Vanno spiegati anche:
- come controllare le schede (`scripts/sondaggio-schede.mjs production`);
- come spostare un orario (configurazione e ripubblicazione);
- come spegnere la sezione (`attivo: false`).
