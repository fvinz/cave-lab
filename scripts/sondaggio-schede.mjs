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
