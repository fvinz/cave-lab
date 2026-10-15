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
