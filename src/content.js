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

/* Quaderno degli esperimenti: eventi e progetti in corso */
export const EVENTI = [
  { date: "Martedì 18 agosto", title: "Cinema sotto le stelle — Il sorpasso", desc: "Ultima serata della rassegna, giardino di Liberty Photo, ore 21:15. Ingresso gratuito." },
  { date: "Martedì 11 agosto", title: "Cinema sotto le stelle — Un sacco bello", desc: "Proiezione all'aperto nel giardino di Liberty Photo, Piazza Guglielmo Marconi 8, ore 21:15. Ingresso gratuito." },
  { date: "Martedì 28 luglio", title: "Cinema sotto le stelle — Mediterraneo", desc: "Il capolavoro Premio Oscar di Gabriele Salvatores, nel giardino di Liberty Photo, ore 21:15. Ingresso gratuito." },
  { date: "Martedì 14 luglio", title: "Cinema sotto le stelle — L'incredibile storia dell'Isola delle Rose", desc: "Proiezione all'aperto nel giardino di Liberty Photo, Piazza Guglielmo Marconi 8, ore 21:15. Ingresso gratuito." },
  { date: "5–14 giugno · concluso", title: "Cave League 2026", desc: "Il torneo tra i rioni di Cave si è chiuso con la Super Bowl Night finale e le premiazioni all'Anfiteatro del Calcio." },
];

export const CAVE_LEAGUE = {
  kicker: "Elemento 04 · L'esperimento più esplosivo",
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
  siteNote: "Classifica, calendario, squadre, marcatori e statistiche: tutto l'universo del torneo vive nel sito dedicato.",

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
