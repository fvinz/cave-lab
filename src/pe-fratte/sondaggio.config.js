/* Sondaggio "Le mete di novembre" (spec: docs/superpowers/specs/2026-10-15-sondaggio-pe-fratte-design.md).
   Lo leggono sia la pagina sia la funzione api/sondaggio.js: è l'unico posto
   dove cambiare mete e orari.
   - `id` delle mete: stabile, mai rinominato dopo l'apertura (i voti sono legati all'id)
   - orari con offset esplicito: dal 19 al 23 ottobre vale l'ora legale (+02:00)
   - tra `chiusura` e `pubblicazione` non si vota e la classifica non si vede (nemmeno a chi ha votato)
   - km/dislivello/durata facoltativi: un dato non annunciato non si scrive
   - `attivo: false` spegne sezione e API */
export const SONDAGGIO = {
  id: "prova-20261015",
  attivo: true,
  /* PROVVISORI: orari e mete veri arrivano prima del lancio (Task 8) */
  apertura: "2026-10-15T14:39:00+02:00",
  chiusura: "2026-10-15T15:09:00+02:00",
  pubblicazione: "2026-10-15T15:19:00+02:00",
  voti: 3,
  vincitrici: 3,
  tettoPerRete: 10,
  mete: [
    { id: "prova-01", nome: "Meta di prova uno", zona: "Zona di prova", difficolta: "facile", km: "6,2", dislivello: "250", durata: "2 h" },
    { id: "prova-02", nome: "Meta di prova due", zona: "Zona di prova", difficolta: "intermedia", km: "9,4", dislivello: "410", durata: "3–4 h" },
    { id: "prova-03", nome: "Meta di prova con un nome molto lungo", zona: "Zona di prova con un nome lungo", difficolta: "impegnativa", km: "14", dislivello: "900", durata: "6 h" },
    { id: "prova-04", nome: "Meta di prova quattro", zona: "Zona di prova", difficolta: "facile" },
    { id: "prova-05", nome: "Meta di prova cinque", difficolta: "intermedia", km: "8" },
    { id: "prova-06", nome: "Meta di prova sei", zona: "Zona di prova" },
    { id: "prova-07", nome: "Meta di prova sette", zona: "Zona di prova", difficolta: "intermedia", km: "11,5", dislivello: "600", durata: "4:30 h" },
    { id: "prova-08", nome: "Meta di prova otto", zona: "Zona di prova", difficolta: "facile", km: "5", durata: "2 h" },
    { id: "prova-09", nome: "Meta di prova nove", zona: "Zona di prova", difficolta: "impegnativa", dislivello: "1100" },
    { id: "prova-10", nome: "Meta di prova dieci", zona: "Zona di prova", difficolta: "intermedia", km: "10", dislivello: "500", durata: "4 h" },
    { id: "prova-11", nome: "Meta di prova undici", zona: "Zona di prova", difficolta: "facile", km: "7", dislivello: "300", durata: "2:30 h" },
    { id: "prova-12", nome: "Meta di prova dodici", zona: "Zona di prova", difficolta: "intermedia" },
    { id: "prova-13", nome: "Meta di prova tredici", zona: "Zona di prova", difficolta: "impegnativa", km: "16", dislivello: "1200", durata: "7 h" },
    { id: "prova-14", nome: "Meta di prova quattordici", zona: "Zona di prova", difficolta: "facile", km: "4,5" },
    { id: "prova-15", nome: "Meta di prova quindici", zona: "Zona di prova", difficolta: "intermedia", km: "9", dislivello: "450", durata: "3:30 h" },
  ],
};
