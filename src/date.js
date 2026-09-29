/* Un evento è "in arrivo" fino a tutto il giorno indicato da `iso`
   (AAAA-MM-GG), confrontato con la data locale di chi visita. */
export function isInArrivo(iso) {
  const oggi = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const oggiIso = `${oggi.getFullYear()}-${pad(oggi.getMonth() + 1)}-${pad(oggi.getDate())}`;
  return iso >= oggiIso;
}

/* Giorni che mancano al giorno `iso` (0 = oggi), sulla data locale. */
export function giorniMancanti(iso) {
  const [a, m, g] = iso.split("-").map(Number);
  const oggi = new Date();
  const inizioOggi = new Date(oggi.getFullYear(), oggi.getMonth(), oggi.getDate());
  return Math.round((new Date(a, m - 1, g) - inizioOggi) / 864e5);
}

/* "Mancano 11 giorni" / "Domani" / "Oggi" */
export function etichettaMancanti(iso) {
  const n = giorniMancanti(iso);
  if (n <= 0) return "Oggi";
  if (n === 1) return "Domani";
  return `Mancano ${n} giorni`;
}
