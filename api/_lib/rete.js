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
