import { EVENTI, HERO_EVENTI } from "./content.js";
import { isInArrivo } from "./date.js";

/* Gli eventi che la hero "Prossimi esperimenti" mette in primo piano:
   `evidenza` ancora in arrivo, al massimo HERO_EVENTI.max, il più vicino
   per primo e quello `grande` in testa. Condiviso con Eventi, che non
   li ripete nel quaderno. */
export function eventiInEvidenza() {
  return EVENTI
    .filter((e) => e.evidenza && isInArrivo(e.iso))
    .sort((a, b) => a.iso.localeCompare(b.iso))
    .slice(0, HERO_EVENTI.max)
    .sort((a, b) => Number(!!b.evidenza.grande) - Number(!!a.evidenza.grande));
}
