/* Un evento è "in arrivo" fino a tutto il giorno indicato da `iso`
   (AAAA-MM-GG), confrontato con la data locale di chi visita. */
export function isInArrivo(iso) {
  const oggi = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const oggiIso = `${oggi.getFullYear()}-${pad(oggi.getMonth() + 1)}-${pad(oggi.getDate())}`;
  return iso >= oggiIso;
}
