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
