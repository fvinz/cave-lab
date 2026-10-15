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
