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
