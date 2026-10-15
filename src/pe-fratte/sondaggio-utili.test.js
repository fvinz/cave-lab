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
