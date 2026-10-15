/* Sondaggio "Le mete di novembre" (spec: docs/superpowers/specs/2026-10-15-sondaggio-pe-fratte-design.md).
   Lo leggono sia la pagina sia la funzione api/sondaggio.js: è l'unico posto
   dove cambiare mete e orari.
   - `id` delle mete: stabile, mai rinominato dopo l'apertura (i voti sono legati all'id)
   - orari con offset esplicito: dal 19 al 23 ottobre vale l'ora legale (+02:00)
   - tra `chiusura` e `pubblicazione` non si vota e la classifica non si vede (nemmeno a chi ha votato)
   - km/dislivello/durata facoltativi: un dato non annunciato non si scrive
   - `attivo: false` spegne sezione e API */
export const SONDAGGIO = {
  id: "novembre-2026",
  attivo: true,
  /* Orari PROVVISORI: da confermare prima del merge */
  apertura: "2026-10-19T08:00:00+02:00",
  chiusura: "2026-10-22T23:59:00+02:00",
  pubblicazione: "2026-10-23T18:00:00+02:00",
  voti: 3,
  vincitrici: 3,
  tettoPerRete: 10,
  /* Candidate scelte dalle guide komoot del Lazio (ottobre 2026). Dati
     sentiero come li riporta komoot: km, salita e tempo di cammino stimato;
     difficoltà komoot Facile/Moderato/Difficile → facile/intermedia/impegnativa. */
  mete: [
    { id: "monte-catillo", nome: "Monte Catillo", zona: "Riserva di Monte Catillo, Tivoli", difficolta: "intermedia", km: "8,45", dislivello: "330", durata: "2:37 h" },
    { id: "lago-albano", nome: "Giro del Lago Albano", zona: "Parco dei Castelli Romani", difficolta: "intermedia", km: "15,8", dislivello: "380", durata: "4:33 h" },
    { id: "anello-di-veio", nome: "Grande anello di Veio", zona: "Parco di Veio", difficolta: "intermedia", km: "10", dislivello: "150", durata: "2:44 h" },
    { id: "monte-viglio", nome: "Monte Viglio", zona: "Serra Sant'Antonio, Monti Simbruini", difficolta: "impegnativa", km: "12,7", dislivello: "700", durata: "4:28 h" },
    { id: "monte-semprevisa", nome: "Monte Semprevisa ed Erdigheta", zona: "Monti Lepini", difficolta: "intermedia", km: "12,5", dislivello: "670", durata: "4:23 h" },
    { id: "rifugio-rinaldi", nome: "Rifugio Rinaldi", zona: "Pian de' Valli, Terminillo", difficolta: "intermedia", km: "7,4", dislivello: "530", durata: "3:26 h" },
    { id: "cascate-vallepietra", nome: "Cascate di Vallepietra", zona: "Vallepietra, Monti Simbruini", difficolta: "intermedia", km: "10,4", dislivello: "610", durata: "3:42 h" },
    { id: "colle-campitellino", nome: "Colle Campitellino", zona: "Monti Simbruini", difficolta: "intermedia", km: "9,7", dislivello: "190", durata: "2:43 h" },
    { id: "monte-tarino", nome: "Monte Tarino", zona: "Fiumata, Monti Simbruini", difficolta: "impegnativa", km: "13,5", dislivello: "660", durata: "4:34 h" },
    { id: "grotta-san-benedetto", nome: "Grotta di San Benedetto", zona: "Guadagnolo, Monti Prenestini", difficolta: "intermedia", km: "11,6", dislivello: "410", durata: "4:14 h" },
    { id: "acquedotti-san-gregorio", nome: "Acquedotti romani di San Gregorio", zona: "San Gregorio da Sassola", difficolta: "intermedia", km: "15,5", dislivello: "410", durata: "4:30 h" },
    { id: "cascate-monte-gelato", nome: "Cascate di Monte Gelato", zona: "Calcata, Parco Valle del Treja", difficolta: "intermedia", km: "16,5", dislivello: "270", durata: "4:34 h" },
    { id: "gole-di-lacerno", nome: "Gole di Lacerno", zona: "Parco Nazionale d'Abruzzo, Lazio e Molise", difficolta: "facile", km: "4,1", dislivello: "180", durata: "1:18 h" },
    { id: "piramide-etrusca", nome: "Piramide etrusca e necropoli di Santa Cecilia", zona: "Bomarzo, Tuscia", difficolta: "facile", km: "5,6", dislivello: "220", durata: "1:46 h" },
    { id: "torre-fico", nome: "Sentiero di Torre Fico", zona: "Parco Nazionale del Circeo", difficolta: "facile", km: "6,5", dislivello: "100", durata: "1:47 h" },
  ],
};
