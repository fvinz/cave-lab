/* =============================================================
   Elementi naturalistici della pagina Pe' Fratte: crinali, pini,
   sole, sentiero, stormo e foglie. Tutto piatto, a tinte piene,
   come una stampa (niente gradienti, niente blur).
   Si muovono con lo scroll tramite GSAP ScrollTrigger:
   - [data-parallax="n"]  sposta il livello di n px lungo la sezione
   - [data-deriva="n"]    sposta in orizzontale (stormo)
   - [data-foglia]        cade e ruota mentre la sezione attraversa lo schermo
   - [data-sentiero]      il tracciato si disegna man mano che si scende
   Con prefers-reduced-motion resta tutto fermo (e visibile).
   ============================================================= */

/* Pino stilizzato a tre palchi con tronco: base al punto (x, y), alto h */
function pino(x, y, h) {
  const p = (dx, dy) => `${(x + dx * h).toFixed(1)},${(y - dy * h).toFixed(1)}`;
  return [
    p(0, 1), p(0.2, 0.62), p(0.12, 0.62), p(0.28, 0.3), p(0.16, 0.3), p(0.34, 0.08),
    p(0.05, 0.08), p(0.05, 0), p(-0.05, 0), p(-0.05, 0.08), p(-0.34, 0.08),
    p(-0.16, 0.3), p(-0.28, 0.3), p(-0.12, 0.62), p(-0.2, 0.62),
  ].join(" ");
}

/* Posizioni dei pini sul colle in primo piano [x, altezza] */
const PINI_COLLE = [
  [40, 70], [78, 52], [120, 88], [300, 60], [338, 84], [372, 50],
  [610, 66], [648, 92], [1010, 58], [1046, 86], [1088, 64], [1300, 76], [1340, 56], [1400, 90],
];

export function Paesaggio({ variante = "alba" }) {
  const tramonto = variante === "tramonto";
  return (
    <div className={"pf-paesaggio pf-paesaggio-" + variante} aria-hidden="true">
      {/* Sole: dietro ai crinali, scende più piano di tutto */}
      <svg className="pf-livello pf-sole" data-parallax={tramonto ? "110" : "140"} viewBox="0 0 1440 520" preserveAspectRatio="xMidYMax slice">
        <circle cx={tramonto ? 330 : 1110} cy={tramonto ? 250 : 190} r="52" fill="#E8A93C" />
      </svg>

      {/* Stormo che attraversa il cielo */}
      {!tramonto && (
        <svg className="pf-livello pf-stormo" data-deriva="260" data-parallax="40" viewBox="0 0 1440 520" preserveAspectRatio="xMidYMax slice">
          <g fill="none" stroke="#DCE6DC" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M560 150 q9 -9 18 0 q9 -9 18 0" />
            <path d="M602 128 q7 -7 14 0 q7 -7 14 0" />
            <path d="M536 122 q6 -6 12 0 q6 -6 12 0" />
          </g>
        </svg>
      )}

      {/* Crinale lontano */}
      <svg className="pf-livello" data-parallax="90" viewBox="0 0 1440 520" preserveAspectRatio="xMidYMax slice">
        <path
          fill="#33573F"
          d="M0 300 L90 252 L160 276 L262 190 L330 232 L420 150 L500 212 L560 186 L650 242 L742 170 L822 118 L902 186 L982 160 L1062 222 L1152 150 L1242 202 L1332 170 L1440 232 V520 H0Z"
        />
      </svg>

      {/* Crinale medio, con il sentiero chiaro che sale alla cima */}
      <svg className="pf-livello" data-parallax="45" viewBox="0 0 1440 520" preserveAspectRatio="xMidYMax slice">
        <path
          fill="#1C3325"
          d="M0 382 L120 302 L212 342 L332 252 L432 322 L522 282 L642 352 L762 262 L852 302 L962 228 L1072 312 L1182 272 L1302 332 L1440 292 V520 H0Z"
        />
        <defs>
          <mask id={"pf-sentiero-maschera-" + variante} maskUnits="userSpaceOnUse">
            <path
              data-sentiero
              d="M812 520 C 860 478, 770 450, 858 408 S 902 336, 928 306 S 950 256, 962 232"
              pathLength="1"
              fill="none"
              stroke="#fff"
              strokeWidth="14"
              strokeDasharray="1 1"
              strokeDashoffset="0"
            />
          </mask>
        </defs>
        <path
          d="M812 520 C 860 478, 770 450, 858 408 S 902 336, 928 306 S 950 256, 962 232"
          fill="none"
          stroke="#F4EEE2"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="12 10"
          mask={`url(#pf-sentiero-maschera-${variante})`}
        />
      </svg>

      {/* Colle in primo piano con i pini: stesso colore della sezione sotto */}
      <svg className="pf-livello" viewBox="0 0 1440 520" preserveAspectRatio="xMidYMax slice">
        <g fill="#16271D">
          <path d="M0 444 Q 180 404 360 428 T 720 418 T 1080 432 T 1440 408 V520 H0Z" />
          {PINI_COLLE.map(([x, h]) => (
            <polygon key={x} points={pino(x, 450, h)} />
          ))}
        </g>
      </svg>
    </div>
  );
}

/* Fila di pini che fa da confine tra due sezioni: sul `fondo` della
   sezione sopra, i pini hanno il `colore` di quella sotto, così il bosco
   "sale" dalla sezione successiva. Con lo scroll i pini crescono. */
const PINI_FILA = [
  [20, 60], [60, 90], [104, 70], [150, 110], [196, 76], [236, 96], [290, 64], [330, 100],
  [380, 80], [430, 118], [476, 72], [520, 94], [572, 66], [612, 104], [660, 84], [712, 120],
  [760, 74], [806, 96], [856, 68], [900, 112], [948, 82], [1000, 100], [1046, 70], [1096, 116],
  [1142, 78], [1190, 98], [1240, 66], [1286, 108], [1334, 84], [1384, 102], [1426, 72],
];

export function FilaDiPini({ colore, fondo }) {
  return (
    <div className="pf-fila-pini" style={{ background: fondo }} aria-hidden="true">
      <svg viewBox="0 0 1440 130" preserveAspectRatio="xMidYMax slice">
        <g fill={colore}>
          <g data-cresci>
            {PINI_FILA.map(([x, h]) => (
              <polygon key={x} points={pino(x, 122, h)} />
            ))}
          </g>
          <rect x="0" y="118" width="1440" height="12" />
        </g>
      </svg>
    </div>
  );
}

/* Foglia piatta con nervatura. `tono` sceglie il colore. */
const TONI_FOGLIA = { oro: "#E8A93C", sabbia: "#D8B27F", bosco: "#4A7157", salvia: "#9DB5A2" };

export function Foglia({ x, y, size = 36, tono = "oro", velocita = 1, giro = 180, soloDesktop = false }) {
  return (
    <span
      className={"pf-foglia" + (soloDesktop ? " pf-foglia-desktop" : "")}
      data-foglia
      data-velocita={velocita}
      data-giro={giro}
      style={{ left: x, top: y, width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24">
        <path d="M12 1.5 C 19.5 6.5 19.5 15 12 22.5 C 4.5 15 4.5 6.5 12 1.5 Z" fill={TONI_FOGLIA[tono]} />
        <path d="M12 4.5 V 21 M12 10 L 15.2 7.6 M12 14 L 8.8 11.4 M12 17.4 L 14.8 15.2" fill="none" stroke="#16271D" strokeOpacity=".45" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
    </span>
  );
}

