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
  assert.equal("votanti" in r.corpo.risultati, false);
  assert.deepEqual(r.corpo.risultati.mete, [
    { id: "a", percentuale: 33.3 },
    { id: "b", percentuale: 33.3 },
    { id: "c", percentuale: 33.3 },
    { id: "d", percentuale: 0 },
    { id: "e", percentuale: 0 },
  ]);
  assert.equal("vincitrici" in r.corpo.risultati, false);
});

test("GET dopo il voto: solo le scelte, la classifica parziale non torna", async () => {
  const ctx = contesto();
  await vota(ctx, T1, ["a", "b", "c"]);
  assert.deepEqual(await leggi(ctx, T1), {
    status: 200,
    corpo: { stato: "aperto", haVotato: true, scelte: ["a", "b", "c"] },
  });
});

test("doppio voto: 409 con le scelte originali, senza classifica, conteggi invariati", async () => {
  const ctx = contesto();
  await vota(ctx, T1, ["a", "b", "c"]);
  assert.deepEqual(await vota(ctx, T1, ["c", "d", "e"]), {
    status: 409,
    corpo: { errore: "gia-votato", stato: "aperto", haVotato: true, scelte: ["a", "b", "c"] },
  });
  assert.equal((await ctx.archivio.conteggi()).votanti, 1);
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
  assert.equal("votanti" in r.corpo.risultati, false);
  assert.equal(r.corpo.risultati.mete.some((m) => "voti" in m), false);
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
  assert.deepEqual(r.corpo.scelte, ["a", "b", "c"]);
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
