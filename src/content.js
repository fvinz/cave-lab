/* =============================================================
   CONTENUTI DEL SITO CAVE LAB
   Questo è il "pannello di controllo": testi, numeri, eventi e
   link si modificano qui, senza toccare i componenti React.
   ============================================================= */

export const SOCIAL = {
  instagramUrl: "https://www.instagram.com/cave__lab/",
  instagramHandle: "@cave__lab",
  email: "cave.lab2024@gmail.com",
  /* Numero in formato internazionale senza spazi per il link wa.me */
  whatsapp: "393515886518",
  whatsappLabel: "+39 351 588 6518",
  luogo: "Cave (RM), Italia",
};

/* Galleria Instagram: ogni voce ha l'anteprima locale (public/instagram/)
   e il link al post. Per aggiungere un post: salva l'anteprima in
   public/instagram/<codice>.jpg e aggiungi { img, url, caption } qui. */
export const INSTAGRAM_POSTS = [
  { img: "/instagram/DdhBXGHDFrz.jpg", url: "https://www.instagram.com/p/DdhBXGHDFrz/", caption: "Pe' Fratte è partito — prima uscita sul Monte Scalambra" },
  { img: "/instagram/DdUKLtYsHcL.jpg", url: "https://www.instagram.com/p/DdUKLtYsHcL/", caption: "Nasce Pe' Fratte, la community trekking di Cave Lab" },
  { img: "/instagram/DdRw1desnlM.jpg", url: "https://www.instagram.com/reel/DdRw1desnlM/", caption: "È nata la Community Trekking di Cave Lab" },
  { img: "/instagram/DbTKDdysHtX.jpg", url: "https://www.instagram.com/reel/DbTKDdysHtX/", caption: "Cinema sotto le stelle — serata con Mediterraneo di Salvatores" },
  { img: "/instagram/DZPr16lsm_I.jpg", url: "https://www.instagram.com/reel/DZPr16lsm_I/", caption: "Le interviste Cave League, versione meme" },
  { img: "/instagram/DasYAvRsac8.jpg", url: "https://www.instagram.com/p/DasYAvRsac8/", caption: "Cinema sotto le stelle: quattro martedì, quattro film" },
  { img: "/instagram/DZp_P1usxZd.jpg", url: "https://www.instagram.com/reel/DZp_P1usxZd/", caption: "Semplicemente, grazie" },
  { img: "/instagram/DZkMk9HMpwb.jpg", url: "https://www.instagram.com/p/DZkMk9HMpwb/", caption: "Super Bowl Night — Final Day" },
  { img: "/instagram/DZh3-sRMFDS.jpg", url: "https://www.instagram.com/reel/DZh3-sRMFDS/", caption: "Le interviste della Cave League" },
  { img: "/instagram/DZho0TcMUPC.jpg", url: "https://www.instagram.com/p/DZho0TcMUPC/", caption: "2026 is the new 2016" },
  { img: "/instagram/DZfFks9ssDF.jpg", url: "https://www.instagram.com/p/DZfFks9ssDF/", caption: "Cave Lab es otra cosa — latin night" },
  { img: "/instagram/DZcU00GsBKc.jpg", url: "https://www.instagram.com/reel/DZcU00GsBKc/", caption: "Quiz e premi tra il pubblico" },
];

export const NAV_LINKS = [
  { href: "#chi-siamo", label: "Chi siamo" },
  { href: "#attivita", label: "Attività" },
  { href: "#eventi", label: "Eventi" },
  { href: "#cave-league", label: "Cave League" },
  { href: "/pe-fratte/", label: "Pe' Fratte" },
  { href: "#territorio", label: "Territorio" },
  { href: "#galleria", label: "Galleria" },
];

export const HERO = {
  tag: "Cave (RM)",
  tagline: "associazione giovani",
  lead: "Cave Lab è il laboratorio a cielo aperto dei giovani di Cave: eventi, cultura, ambiente e tanta voglia di far succedere le cose. Prendi la provetta, si parte.",
  formula: ["Comunità", "Territorio", "Idee"],
  formulaResult: "Cave Lab",
};

export const VALORI = ["Comunità", "Creatività", "Curiosità", "Sostenibilità"];

/* Foto del borgo di Cave usata nella sezione Territorio.
   Fonte: Wikimedia Commons, licenza CC BY-SA 3.0 — l'attribuzione
   all'autore è obbligatoria e viene mostrata sotto l'immagine. */
export const TERRITORIO_FOTO = {
  src: "/cave/panorama.jpg",
  alt: "Il centro storico di Cave arroccato sul crinale, con i Monti Prenestini sullo sfondo",
  credito: "rgiannotti1",
  creditoUrl: "https://commons.wikimedia.org/wiki/File:Cave(rm)_-_panoramio.jpg",
  licenza: "CC BY-SA 3.0",
  licenzaUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
};

/* Tavola periodica delle attività */
export const ELEMENTI = [
  { symbol: "Cu", name: "Cultura", color: "#7C3AED", desc: "Momenti che fanno pensare, confrontare e scoprire qualcosa di nuovo, insieme." },
  { symbol: "Am", name: "Ambiente", color: "#22A55E", desc: "Cura del territorio e attenzione a un futuro più sostenibile per il paese." },
  { symbol: "Ev", name: "Eventi", color: "#FFC53D", dark: true, desc: "Occasioni che riportano vita e movimento nelle piazze del paese." },
  { symbol: "So", name: "Sociale", color: "#FF5C8A", desc: "Iniziative di solidarietà e vicinanza a chi ne ha più bisogno." },
  { symbol: "Te", name: "Territorio", color: "#2CC7C7", desc: "Riscoperta e valorizzazione delle bellezze e degli angoli nascosti di Cave." },
  { symbol: "Cr", name: "Creatività", color: "#8C6BFF", desc: "Progetti ed espressioni creative che nascono a cielo aperto." },
];

/* Community WhatsApp: un canale principale (il "nucleo") e gruppi
   tematici ("gruppi funzionali"). Si entra dal link della community,
   poi dentro WhatsApp ognuno sceglie i gruppi che gli interessano. */
export const COMMUNITY = {
  inviteUrl: "https://chat.whatsapp.com/DpbHhXpPIwR5AaKzbUE7BN",
  membri: "più di 250",
  nucleo: {
    title: "Community Cave Lab",
    desc: "Il canale principale: comunicazioni importanti, aggiornamenti generali e le date di tutti i nostri eventi.",
  },
  gruppi: [
    {
      symbol: "Pf",
      name: "Pe' Fratte",
      tema: "Trekking",
      color: "#3ECF9A",
      desc: "Sentieri, natura e camminate all'aperto. Uno spazio di tutti: fai domande, condividi foto e proponi nuovi percorsi per le prossime uscite.",
      /* Pagina dedicata del gruppo (facoltativa) */
      pagina: "/pe-fratte/",
      /* Tessera con l'identità visiva di Pe' Fratte invece di quella
         della tavola periodica (vedi GruppoPeFratte.jsx) */
      stile: "pe-fratte",
      paginaCta: "Scopri Pe' Fratte",
    },
  ],
  /* Gruppi annunciati ma non ancora attivi: segnaposto onesto,
     niente nomi inventati finché non esistono davvero. */
  prossimamente: "Nuovi gruppi tematici per altre attività sono in arrivo.",
};

/* Pagina /pe-fratte/: la comunità trekking di Cave Lab, con la sua
   identità visiva (design system Pe' Fratte). Le uscite NON stanno
   qui: sono le voci di EVENTI con gruppo "Pf". */
export const PE_FRATTE = {
  tagline: "Un'idea Cave Lab",
  titolo: "Se cammina",
  intro: "Pe' Fratte è la comunità trekking di Cave Lab: camminate di gruppo, senza fretta, sui monti del Lazio e dintorni.",
  /* Ritrovo comune per chi parte da Cave (l'orario cambia a ogni uscita) */
  ritrovo: {
    luogo: "Parcheggio delle scuole medie, Cave",
    maps: "https://maps.app.goo.gl/WqX4xPUDS5wZcbtE8",
  },
  /* Scala usata negli annunci del gruppo. `tono` sceglie il colore. */
  difficolta: {
    facile: { label: "Facile", nota: "Adatta a tutti", tono: "facile" },
    intermedia: { label: "Intermedia", nota: "Serve un minimo di allenamento", tono: "intermedia" },
    impegnativa: { label: "Impegnativa", nota: "Per chi cammina spesso", tono: "impegnativa" },
  },
  regole: [
    { titolo: "Si entra dal gruppo", testo: "Ogni uscita viene annunciata nel gruppo WhatsApp Pe' Fratte, con ritrovo, orari e posizione della partenza. Per esserci basta scriverlo lì." },
    { titolo: "Due punti d'incontro", testo: "Per ogni uscita c'è un ritrovo a Cave, per chi parte con il gruppo, e l'inizio del sentiero, per chi arriva direttamente: scegli quello che ti è più comodo." },
    { titolo: "Ognuno è responsabile", testo: "Ciascun partecipante è responsabile della propria sicurezza, della valutazione del proprio stato fisico e del proprio equipaggiamento." },
  ],
  /* Galleria: foto e video delle uscite, raggruppati per uscita (`uscita`
     è l'`iso` della voce in EVENTI). File in public/pe-fratte/galleria/:
     - foto: `src` è il .jpg, accanto serve il .webp con lo stesso nome;
       `w`/`h` sono le dimensioni reali (evitano salti di layout)
     - video: brevi, senza audio (partono da soli in loop quando sono
       visibili), con `poster`; `largo: true` lo mette a tutta larghezza
     Solo materiale vero delle uscite. Con la lista vuota la sezione non compare. */
  galleria: [
    { uscita: "2026-09-19", tipo: "video", largo: true, src: "/pe-fratte/galleria/scalambra-drone.mp4", poster: "/pe-fratte/galleria/scalambra-drone-poster.jpg", w: 848, h: 478, alt: "Il gruppo in vetta al Monte Scalambra ripreso dal drone, con la valle sotto" },
    { uscita: "2026-09-19", tipo: "foto", src: "/pe-fratte/galleria/scalambra-gruppo-panchina.jpg", w: 1200, h: 904, alt: "Foto di gruppo sulla panchina gigante in cima al Monte Scalambra" },
    { uscita: "2026-09-19", tipo: "foto", src: "/pe-fratte/galleria/scalambra-bosco-gruppo.jpg", w: 900, h: 1200, alt: "Il gruppo cammina nel bosco di faggi, visto di spalle" },
    { uscita: "2026-09-19", tipo: "video", src: "/pe-fratte/galleria/scalambra-bosco-salita.mp4", poster: "/pe-fratte/galleria/scalambra-bosco-salita-poster.jpg", w: 464, h: 832, alt: "Salita nel bosco lungo il sentiero" },
    { uscita: "2026-09-19", tipo: "foto", src: "/pe-fratte/galleria/scalambra-sentiero-valle.jpg", w: 904, h: 1200, alt: "Tre escursionisti sul sentiero, con la valle alle spalle" },
    { uscita: "2026-09-19", tipo: "foto", src: "/pe-fratte/galleria/scalambra-crinale.jpg", w: 904, h: 1200, alt: "Il gruppo risale il crinale verso la cima" },
    { uscita: "2026-09-19", tipo: "video", src: "/pe-fratte/galleria/scalambra-mucche.mp4", poster: "/pe-fratte/galleria/scalambra-mucche-poster.jpg", w: 540, h: 960, alt: "Mucche al pascolo lungo la strada verso la cima" },
    { uscita: "2026-09-19", tipo: "foto", src: "/pe-fratte/galleria/scalambra-rocce.jpg", w: 904, h: 1200, alt: "Escursionisti tra le rocce sopra il paese" },
    { uscita: "2026-09-19", tipo: "foto", src: "/pe-fratte/galleria/scalambra-salita-cane.jpg", w: 904, h: 1200, alt: "Salita sulla scalinata verso la vetta, con un cane in primo piano" },
    { uscita: "2026-09-19", tipo: "foto", src: "/pe-fratte/galleria/scalambra-scalinata-vetta.jpg", w: 904, h: 1200, alt: "Gli ultimi gradini verso la statua in cima" },
    { uscita: "2026-09-19", tipo: "video", src: "/pe-fratte/galleria/scalambra-vetta-gruppo.mp4", poster: "/pe-fratte/galleria/scalambra-vetta-gruppo-poster.jpg", w: 960, h: 540, alt: "Il gruppo saluta dalla vetta" },
    { uscita: "2026-09-19", tipo: "foto", src: "/pe-fratte/galleria/scalambra-sasso-1420.jpg", w: 904, h: 1200, alt: "Il sasso dipinto con la scritta Monte Scalambra 1420 metri" },
    { uscita: "2026-09-19", tipo: "foto", src: "/pe-fratte/galleria/scalambra-panorama.jpg", w: 1200, h: 904, alt: "Panorama dalla cima sulla valle e sui monti" },
  ],
};

/* Quaderno degli esperimenti: eventi e progetti.
   `iso` è la data (di fine, per eventi su più giorni) in formato
   AAAA-MM-GG: dopo quel giorno l'evento passa da solo tra i conclusi.
   `gruppo` (facoltativo) è il simbolo di un gruppo in COMMUNITY. */
export const EVENTI = [
  /* Le uscite di Pe' Fratte (gruppo "Pf") hanno in più la scheda
     `percorso`, letta dalla pagina /pe-fratte/. Campi tutti facoltativi:
     quelli assenti non vengono mostrati (mai inventare dati di un
     sentiero). `difficolta` è una chiave di PE_FRATTE.difficolta.
     `partecipazione` (es. "Gratuita" o una quota) vale per la singola
     uscita: le condizioni possono cambiare da un'uscita all'altra. */
  {
    iso: "2026-09-19", date: "Sabato 19 settembre", gruppo: "Pf",
    title: "Pe' Fratte — Monte Scalambra",
    desc: "La prima uscita della community trekking: 6,3 km e 270 m di dislivello da Serrone, adatta a tutti.",
    percorso: {
      zona: "Serrone",
      difficolta: "facile",
      partecipazione: "Gratuita",
      km: "6,3",
      dislivello: "270",
      durata: "2–3 h",
      ritrovoOra: "08:30",
      partenzaOra: "09:30",
      partenzaMaps: "https://maps.app.goo.gl/AcmZktbCA8rkhuaH9",
      programma: "Saliamo insieme verso la cima, pranzo al sacco panoramico tutti insieme e poi rientro con calma.",
      portare: ["Scarpe da trekking o trail", "Pranzo al sacco", "Giacca antipioggia", "Scorta d'acqua"],
    },
  },
  {
    iso: "2026-09-26", date: "Sabato 26 settembre", gruppo: "Pf",
    title: "Pe' Fratte — Monte Gennaro",
    desc: "Seconda uscita: 9,4 km e 410 m di dislivello da Palombara. Ritrovo a Cave alle 08:15, partecipazione gratuita.",
    percorso: {
      zona: "Palombara Sabina",
      difficolta: "intermedia",
      partecipazione: "Gratuita",
      km: "9,4",
      dislivello: "410",
      durata: "3–4 h",
      ritrovoOra: "08:15",
      partenzaOra: "09:30",
      partenzaMaps: "https://maps.app.goo.gl/yvbj2twsXchqBSdbA",
      programma: "Saliamo insieme verso la cima, pranzo al sacco panoramico tutti insieme e poi rientro con calma. Per chi vuole, al ritorno ricarica di zuccheri da “Le Dolci Tentazioni” a Palombara.",
      portare: ["Scarpe da trekking o trail", "Pranzo al sacco", "Scorta d'acqua"],
    },
  },
  { iso: "2026-10-10", date: "Sabato 10 ottobre", title: "Evento segreto", desc: "Per ora è top secret: stiamo preparando qualcosa di speciale. Tutti i dettagli arrivano prima nella community." },
  {
    iso: "2026-10-03", date: "Sabato 3 ottobre", gruppo: "Pf",
    title: "Pe' Fratte — Monte Cavo",
    desc: "Terza uscita del calendario trekking. Percorso, orari e ritrovo arrivano presto nel gruppo Pe' Fratte.",
    /* Dettagli del percorso non ancora disponibili */
    percorso: { partecipazione: "Gratuita" },
  },
  { iso: "2026-08-18", date: "Martedì 18 agosto", title: "Cinema sotto le stelle — Il sorpasso", desc: "Ultima serata della rassegna, giardino di Liberty Photo, ore 21:15. Ingresso gratuito." },
  { iso: "2026-08-11", date: "Martedì 11 agosto", title: "Cinema sotto le stelle — Un sacco bello", desc: "Proiezione all'aperto nel giardino di Liberty Photo, Piazza Guglielmo Marconi 8, ore 21:15. Ingresso gratuito." },
  { iso: "2026-07-28", date: "Martedì 28 luglio", title: "Cinema sotto le stelle — Mediterraneo", desc: "Il capolavoro Premio Oscar di Gabriele Salvatores, nel giardino di Liberty Photo, ore 21:15. Ingresso gratuito." },
  { iso: "2026-07-14", date: "Martedì 14 luglio", title: "Cinema sotto le stelle — L'incredibile storia dell'Isola delle Rose", desc: "Proiezione all'aperto nel giardino di Liberty Photo, Piazza Guglielmo Marconi 8, ore 21:15. Ingresso gratuito." },
  { iso: "2026-06-14", date: "5–14 giugno", title: "Cave League 2026", desc: "Il torneo tra i rioni di Cave si è chiuso con la Super Bowl Night finale e le premiazioni all'Anfiteatro del Calcio." },
];

export const CAVE_LEAGUE = {
  kicker: "Elemento 05 · L'esperimento più esplosivo",
  edition: "Edizione 2026 · 5–14 giugno · Anfiteatro del Calcio",
  /* Riassunto dell'evento (dati reali dal torneo 2026) */
  /* I numeri vivono nelle statistiche qui sotto: il recap racconta,
     non ripete. */
  recap:
    "Dieci giorni all'Anfiteatro, le squadre schierate una contro l'altra e una piazza che non ha mai smesso di tifare: la Cave League ha acceso l'estate di Cave.",

  /* Podio finale 2026 */
  podium: {
    title: "L'albo d'oro 2026",
    places: [
      {
        rank: 1,
        medal: "Campione",
        team: "REAL MADRINK",
        color: "#CCFF00",
        detail: "Finale vinta 5–2 su La Pizzicata",
      },
      {
        rank: 2,
        medal: "Finalista",
        team: "LA PIZZICATA",
        color: "#4169E1",
        detail: "Sconfitta in finale il 14 giugno",
      },
      {
        rank: 3,
        medal: "Terzo posto",
        team: "ATLETICO GIGLIETTO",
        color: "#98FF98",
        detail: "Finalina vinta 13–9 su Ocho Ar Mocho",
      },
    ],
    topScorer: { name: "Francesco di Santo", team: "Ocho Ar Mocho", goals: 28 },
  },

  stats: [
    { value: 12, suffix: "", label: "Squadre" },
    { value: 158, suffix: "", label: "Giocatori" },
    { value: 32, suffix: "", label: "Partite" },
    { value: 508, suffix: "", label: "Gol segnati" },
  ],

  /* Link al sito dedicato (l'app montata su /league/) */
  siteUrl: "/league/",
  siteCta: "Entra nella Cave League",
  siteNote: "Il podio finale e i marcatori del torneo, in un'unica pagina dedicata.",

  /* Foto della finalissima (dal Drive dell'associazione, cartella
     CaveLeague 2K26 › DAY 10 › Finalissima). Sono in public/league-foto/. */
  photos: [
    { src: "/league-foto/finale-1.jpg", caption: "La finalissima" },
    { src: "/league-foto/finale-5.jpg", caption: "In campo" },
    { src: "/league-foto/finale-9.jpg", caption: "Il pubblico" },
    { src: "/league-foto/finale-13.jpg", caption: "L'Anfiteatro" },
    { src: "/league-foto/finale-17.jpg", caption: "La sfida" },
    { src: "/league-foto/finale-21.jpg", caption: "Cuore e grinta" },
    { src: "/league-foto/finale-25.jpg", caption: "Momenti di gioco" },
    { src: "/league-foto/finale-29.jpg", caption: "Sotto i riflettori" },
    { src: "/league-foto/finale-33.jpg", caption: "La tensione" },
    { src: "/league-foto/finale-37.jpg", caption: "L'ultimo atto" },
    { src: "/league-foto/finale-41.jpg", caption: "La festa" },
    { src: "/league-foto/finale-45.jpg", caption: "Fuochi sul campo" },
    { src: "/league-foto/finale-48.jpg", caption: "I campioni" },
    { src: "/league-foto/finale-50.jpg", caption: "Notte da ricordare" },
  ],
};

export const GALLERIA_FALLBACK = [
  { icon: "flask", color: "#7C3AED", caption: "Eventi in piazza" },
  { icon: "testtube", color: "#22A55E", caption: "Laboratori creativi" },
  { icon: "plant", color: "#FFC53D", dark: true, caption: "Volontariato ambientale" },
  { icon: "spark", color: "#FF5C8A", caption: "Feste di comunità" },
  { icon: "map", color: "#2CC7C7", caption: "Il territorio" },
  { icon: "palette", color: "#8C6BFF", caption: "Arte e creatività" },
];
