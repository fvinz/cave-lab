import { test } from "node:test";
import assert from "node:assert/strict";
import { CHIAVE_TOKEN, contoAllaRovescia, giornoEOra, leggiToken, ordineMescolato, scadenzaPassata } from "./sondaggio-utili.js";

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

const V = new Date("2026-10-21T21:59:00Z"); // mercoledì 21 alle 23:59 ora italiana
const prima = (ms) => new Date(V.getTime() - ms);
const MIN = 60 * 1000;

test("contoAllaRovescia: più di un giorno mostra giorni e ore", () => {
  assert.deepEqual(contoAllaRovescia(V, prima((2 * 24 * 60 + 14 * 60 + 30) * MIN)), {
    parti: [{ valore: 2, unita: "giorni" }, { valore: 14, unita: "ore" }],
    testo: "2 giorni e 14 ore",
  });
});

test("contoAllaRovescia: singolari e parte a zero omessa nel testo", () => {
  assert.deepEqual(contoAllaRovescia(V, prima(24 * 60 * MIN)), {
    parti: [{ valore: 1, unita: "giorno" }, { valore: 0, unita: "ore" }],
    testo: "1 giorno",
  });
  assert.equal(contoAllaRovescia(V, prima(61 * MIN)).testo, "1 ora e 1 minuto");
});

test("contoAllaRovescia: l'ultimo giorno mostra ore e minuti, l'ultima ora solo minuti", () => {
  assert.deepEqual(contoAllaRovescia(V, prima((5 * 60 + 7) * MIN)).parti, [
    { valore: 5, unita: "ore" },
    { valore: 7, unita: "minuti" },
  ]);
  assert.deepEqual(contoAllaRovescia(V, prima(42 * MIN)), { parti: [{ valore: 42, unita: "minuti" }], testo: "42 minuti" });
});

test("contoAllaRovescia: i secondi arrotondano al minuto successivo, mai a zero prima della scadenza", () => {
  assert.equal(contoAllaRovescia(V, prima(20 * 1000)).testo, "1 minuto");
});

test("contoAllaRovescia: alla scadenza e dopo restituisce null", () => {
  assert.equal(contoAllaRovescia(V, V), null);
  assert.equal(contoAllaRovescia(V, new Date(V.getTime() + MIN)), null);
  assert.equal(contoAllaRovescia("2026-10-21T23:59:00+02:00", prima(42 * MIN)).testo, "42 minuti");
});

const CFG = { chiusura: "2026-10-21T23:59:00+02:00", pubblicazione: "2026-10-22T18:00:00+02:00" };

test("scadenzaPassata: durante il voto, solo da chiusura in poi", () => {
  assert.equal(scadenzaPassata("aperto", CFG, new Date("2026-10-21T21:58:59Z")), false);
  assert.equal(scadenzaPassata("aperto", CFG, new Date("2026-10-21T21:59:00Z")), true);
});

test("scadenzaPassata: durante l'attesa, solo dall'annuncio in poi", () => {
  assert.equal(scadenzaPassata("attesa", CFG, new Date("2026-10-22T15:59:59Z")), false);
  assert.equal(scadenzaPassata("attesa", CFG, new Date("2026-10-22T16:00:00Z")), true);
});

test("scadenzaPassata: prima e dopo l'annuncio non c'è nulla da aspettare", () => {
  assert.equal(scadenzaPassata("prima", CFG, new Date("2026-10-30T10:00:00Z")), false);
  assert.equal(scadenzaPassata("chiuso", CFG, new Date("2026-10-30T10:00:00Z")), false);
});
