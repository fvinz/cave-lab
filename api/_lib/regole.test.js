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
