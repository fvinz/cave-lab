import { useCallback, useEffect, useState } from "react";
import { statoSondaggio } from "../../api/_lib/regole.js";
import { leggiToken } from "./sondaggio-utili.js";

/* localStorage può mancare o lanciare (navigazione privata, dati bloccati) */
function memoriaLocale() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/* Stato del sondaggio per la pagina. All'inizio decide l'orologio locale
   (così la sezione non salta), poi decide sempre il server. */
export default function useSondaggio(config) {
  const [token] = useState(() => leggiToken(memoriaLocale()));
  const [s, setS] = useState(() => ({
    stato: statoSondaggio(config, new Date()),
    haVotato: false,
    scelte: [],
    risultati: null,
    caricamento: config.attivo,
    irraggiungibile: false,
    invio: "fermo",
    avviso: null,
  }));

  const applica = useCallback((corpo, extra = {}) => {
    setS((prima) => ({
      ...prima,
      stato: corpo.stato ?? prima.stato,
      haVotato: Boolean(corpo.haVotato),
      scelte: corpo.scelte ?? [],
      risultati: corpo.risultati ?? null,
      caricamento: false,
      irraggiungibile: false,
      ...extra,
    }));
  }, []);

  const ricarica = useCallback(async () => {
    setS((prima) => ({ ...prima, caricamento: true, irraggiungibile: false }));
    try {
      const r = await fetch(`/api/sondaggio?token=${encodeURIComponent(token)}`, { cache: "no-store" });
      if (!r.ok) throw new Error(String(r.status));
      applica(await r.json());
    } catch {
      setS((prima) => ({ ...prima, caricamento: false, irraggiungibile: true }));
    }
  }, [token, applica]);

  useEffect(() => {
    if (config.attivo) ricarica();
  }, [config.attivo, ricarica]);

  const vota = useCallback(
    async (mete) => {
      setS((prima) => ({ ...prima, invio: "in-corso", avviso: null }));
      let r;
      let corpo;
      try {
        r = await fetch("/api/sondaggio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, mete }),
        });
        corpo = await r.json().catch(() => ({}));
      } catch {
        setS((prima) => ({ ...prima, invio: "errore" }));
        return;
      }
      if (r.ok || r.status === 409) applica(corpo, { invio: "fermo" });
      else if (r.status === 403 && corpo.errore === "chiuso") applica(corpo, { invio: "fermo", avviso: "non-contato" });
      else if (r.status === 403) applica(corpo, { invio: "fermo" });
      else if (r.status === 429) setS((prima) => ({ ...prima, invio: "tetto" }));
      else setS((prima) => ({ ...prima, invio: "errore" }));
    },
    [token, applica]
  );

  return {
    ...s,
    token,
    visibile: config.attivo && s.stato !== "prima",
    votoAperto: config.attivo && s.stato === "aperto",
    ricarica,
    vota,
  };
}
