---
target: cave-lab-react/src/App.jsx
total_score: 21
max_score: 36
na_heuristics: 10
p0_count: 3
p1_count: 2
timestamp: 2026-07-27T14-27-44Z
slug: cave-lab-react-src-app-jsx
---
`Method: dual-agent (A: ad2fdac5b5de5acfa · B: ad362c33d2a916686)` · Mode: **Persuade**

## Design Health Score

| # | Euristica | Voto | Problema chiave |
|---|-----------|------|-----------------|
| 1 | Visibilità dello stato | 2 | Il form dichiara "Reazione riuscita!" per un invio che non parte mai; nessuno stato di attesa |
| 2 | Corrispondenza col mondo reale | 3 | Metafora chimica fluente; incrinata da un h1 sgrammaticato e tre sistemi di numerazione concorrenti |
| 3 | Controllo e libertà | 2 | Menu mobile senza Escape, senza click-fuori, senza scroll lock; reset form cancella il messaggio senza undo |
| 4 | Coerenza e standard | 2 | Due linguaggi visivi conviventi; .btn:hover diagonale contro Y-only; .stat-card opaca contro vetro; .league-cta senza stile |
| 5 | Prevenzione errori | 2 | Validazione on-blur sensata, ma noValidate toglie il fallback browser, nessun campo obbligatorio marcato, nessun consenso privacy |
| 6 | Riconoscere > ricordare | 3 | Etichette nav identiche ai titoli; ma il menu mobile è traslucido e il testo sottostante lo attraversa |
| 7 | Flessibilità ed efficienza | 2 | Skip link, back-to-top e ancore presenti; ma nessuna CTA sticky su 10.105px e nessun ritorno da /league/ |
| 8 | Design estetico e minimale | 3 | Sistema minerale e blocco League ben costruiti; 8 scelte di nav e 9 tessere Instagram non filtrate lo abbassano |
| 9 | Recupero dagli errori | 2 | Messaggi specifici; ma nessun riepilogo, focus fuori schermo, nessun aria-describedby |
| 10 | Aiuto e documentazione | n/a | Superficie Persuade senza flusso multi-step da documentare |
| **Totale** | | **21/36 (58%)** | **Acceptable** |

## Design Specificity Verdict

La superficie è autoriale, la composizione è template.

Specifico: l'IA chimica vive nel linguaggio (Elemento 01–07, "quaderno degli esperimenti", "Reazione riuscita!", provetta come scroll-cue). Il mondo ametista è costruito a livello di sistema: due strati di scintillii a periodi non armonici (390px/5s vs 570px/7s invertito) su campo radiale a 5 stop, regge 8.000px di scroll.

Template: Territorio.jsx è clip art nella sezione che È il brief. La .periodic-grid non forma mai la geometria di una tavola periodica. La .lab-timeline non ha spina dorsale.

Scansione deterministica: detector CLI 1 finding statico (side-tab, styles.css:799); detector live nel browser 43 findings — low-contrast ×11, dark-glow ×13, gpt-thin-border-wide-shadow ×12.

Falso positivo: i 2 img senza alt sono i logo.svg con alt="" intenzionale (decorativi, brand name come testo accanto). Pratica corretta.

## Overall Impression

C'è un sito bellissimo dentro questo sito e dura ~1.500px: il blocco Cave League. È l'unico momento in cui la pagina appartiene a persone reali. Il picco emotivo è a metà pagina e porta fuori dal sito; da lì si scende. Peak-end violata duramente.

## What's Working

1. Il blocco Cave League si merita la rottura tonale: l'inversione di palette funziona perché è l'unico blocco con contenuto interamente reale a sostenerlo. Avvolgere il podio in un solo <a> è l'istinto giusto.
2. Lo sfondo minerale è un sistema, non un'immagine: periodi non armonici significa che il luccichio non forma mai griglia percepibile; la vignetta completa la sensazione di essere dentro qualcosa.
3. L'accessibilità del movimento è gestita a ogni livello (reset globale, gsap.matchMedia, CountUp, marquee scrollabile) e gli elementi partono visibili: la pagina funziona senza JS.

## Priority Issues

### [P0] Il form di contatto è un'esca
handleSubmit in Contatti.jsx chiama setSent(true) e svuota i campi senza alcuna richiesta di rete. È l'unico meccanismo di conversione del sito.
Fix: collegare a Formspree/Netlify Forms con stato submitting/error reali, oppure sostituire con mail + DM + WhatsApp.
Comando: /impeccable harden

### [P0] Tutte le CTA primarie falliscono il contrasto
.btn-primary bianco su #9D7BFF = 3,13:1 (serve 4,5:1). .btn-league #ECE8F6 su gradiente ambra = 1,33:1, illeggibile, ed è la CTA del blocco migliore.
Fix: .btn-primary { color: #17131F } (9,6:1) o scurire --color-violet a #6B45D9; .btn-league { color: #1B1226 }.
Comando: /impeccable audit

### [P0] Il menu mobile è traslucido e non si chiude
.primary-nav rgba(28,22,46,0.72) senza backdrop-filter: si legge "REAL MADRINK" attraverso le voci. inset:72px contro header di 88px. Nessuno scrim, nessun scroll lock, nessun handler Escape né click esterno. Da chiuso i link restano focusabili (visibility visible, opacity 0).
Fix: alpha ~0.94 + backdrop-filter blur(18px), top:100%, scrim, chiusura su Escape e click esterno, visibility:hidden da chiuso.
Comando: /impeccable harden

### [P1] Il layout si rompe a tre larghezze precise (tutte verificate)
- .league-cta non ha alcuna regola in styles.css (grep: assente) — cancellata da una sostituzione di blocco durante il retheme. Payoff allineato a sinistra a x:84 in sezione centrata.
- 768–1023px (ogni tablet in verticale): .nav-toggle compare solo sotto 768px (riga 1155), la nav a 8 voci va a capo, header cresce a 125px.
- Esattamente 1440px: .container{max-width:1320px} (riga 1191) batte .hero-inner{max-width:860px} (riga 364) per ordine di sorgente; misura del titolo +54% in un pixel.
Comando: /impeccable adapt

### [P1] Il finale è la parte più debole e i numeri non sono veri
Dopo il marquee: clip art, tessere Instagram 109×109px su mobile (una è uno screenshot ChatGPT), form piatto. .stat-panel presenta tre numeri inventati nello stesso trattamento dei quattro dati verificati della League.
Fix: foto vera di Cave al posto dell'illustrazione; foto di gruppo in #contatti; numeri veri o eliminare .stat-panel.
Comando: /impeccable polish

## Persona Red Flags

Jordan (primo visitatore): l'h1 "Mescoliamo idee, reazioni di comunità" non regge grammaticalmente (due complementi oggetto senza secondo verbo) ed è la prima frase del sito. Tre etichette diverse per lo stesso form. Da nessuna parte il sito dice cosa comporta iscriversi.

Riley (stress tester): form vuoto → focus su #name che può stare sopra il viewport. DevTools dopo "Reazione riuscita!" → zero richieste di rete. Escape sul menu → niente. Screen reader sul podio → l'aria-label sovrascrive tutti i 296 caratteri di contenuto ("Real Madrink", "5–2", "28 gol" mai annunciati).

Casey (mobile distratto): legge "L'ALBO D'ORO 2026" attraverso il menu aperto. Pagina che scorre dietro al menu. .insta-gallery a 3 colonne a ogni breakpoint = 109×109px. 10.105px senza CTA sticky. background-attachment:fixed + due strati fissi = costo di repaint su iOS Safari, contro un brief che chiedeva velocità.

## Minor Observations

- public/logo.svg dichiara font-family 'Nunito' ma index.html non lo carica più (0 occorrenze): il marchio renderizza in Arial ovunque.
- 35 img senza width/height né aspect-ratio: rischio CLS sulle gallerie.
- Nessun og:image, canonical o JSON-LD: anteprima senza immagine su Instagram/WhatsApp.
- Nessuna informativa privacy né consenso sul form: lacuna di compliance per una APS.
- .hero-formula è aria-hidden: la proposta di valore è invisibile agli assistivi.
- .element-number in alto a destra; in una vera tavola periodica il numero atomico sta a sinistra.
- CountUp anima 2019 partendo da 0: sembra un bug.
- 11 elementi interattivi sotto 44×44px.

## Questions to Consider

1. Il blocco più bello e più vero del sito è un link che porta altrove. Perché è l'Elemento 04 invece che l'eroe?
2. Tre dei quattro numeri in .stat-panel sono inventati. Quanto vale la credibilità nel momento in cui qualcuno di Cave se ne accorge?
3. La sezione "Territorio" non contiene nessuna immagine del territorio. Qual è l'argomento?
4. La Cave League è una sezione del sito di Cave Lab, o il sito è il preambolo della Cave League? Design e IA sostengono cose diverse.
