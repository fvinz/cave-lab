/* Curve di livello come su una carta escursionistica: anelli irregolari
   attorno a due rilievi, una curva "direttrice" più marcata ogni quattro,
   il simbolo di vetta e un sentiero tratteggiato che ci sale.
   Disegno deterministico (niente caso): uguale a ogni caricamento.
   All'apertura la carta si scopre una volta a partire dalla vetta (CSS);
   con prefers-reduced-motion è già tutta lì. Colore da `currentColor`. */

const PUNTI = 48;

/* Anello chiuso e morbido: raggio deformato da tre armoniche, schiacciato
   in verticale come un rilievo visto in pianta, poi Catmull-Rom → Bézier */
function anello(cx, cy, raggio, fase, deformazione) {
  const p = Array.from({ length: PUNTI }, (_, i) => {
    const t = (i / PUNTI) * Math.PI * 2;
    const k =
      1 +
      deformazione *
        (0.13 * Math.sin(3 * t + fase) + 0.08 * Math.sin(5 * t + fase * 1.7) + 0.05 * Math.sin(2 * t + fase * 0.6));
    return [cx + raggio * k * Math.cos(t) * 1.35, cy + raggio * k * Math.sin(t)];
  });
  const f = (n) => n.toFixed(1);
  let d = `M${f(p[0][0])} ${f(p[0][1])}`;
  for (let i = 0; i < PUNTI; i++) {
    const [p0, p1, p2, p3] = [p[(i - 1 + PUNTI) % PUNTI], p[i], p[(i + 1) % PUNTI], p[(i + 2) % PUNTI]];
    d +=
      ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)}` +
      ` ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + "Z";
}

const RILIEVI = [
  { cx: 1090, cy: 300, anelli: 10, passo: 44, fase: 0.4 },
  { cx: 230, cy: 800, anelli: 8, passo: 50, fase: 2.1 },
];

const CURVE = RILIEVI.flatMap((r) =>
  Array.from({ length: r.anelli }, (_, k) => ({
    d: anello(r.cx, r.cy, 26 + k * r.passo, r.fase + k * 0.35, 0.55 + k * 0.07),
    direttrice: k % 4 === 3,
  }))
);

const VETTA = RILIEVI[0];

export default function CurveDiLivello({ className = "" }) {
  return (
    <div className={"pf-curve " + className} aria-hidden="true">
      <svg viewBox="0 0 1440 960" preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke="currentColor" strokeLinejoin="round">
          {CURVE.map((c, i) => (
            <path
              key={i}
              d={c.d}
              className={c.direttrice ? "pf-curva pf-curva-direttrice" : "pf-curva"}
            />
          ))}
        </g>
        {/* Sentiero che sale alla vetta del rilievo principale */}
        <path
          className="pf-curve-sentiero"
          d={`M820 960 C 860 860, 760 790, 860 700 S 1010 560, 990 470 S ${VETTA.cx - 30} ${VETTA.cy + 70}, ${VETTA.cx} ${VETTA.cy + 8}`}
          fill="none"
          strokeWidth="3"
          strokeDasharray="10 9"
          strokeLinecap="round"
        />
        <polygon
          className="pf-curve-vetta"
          points={`${VETTA.cx},${VETTA.cy - 13} ${VETTA.cx + 12},${VETTA.cy + 8} ${VETTA.cx - 12},${VETTA.cy + 8}`}
        />
      </svg>
    </div>
  );
}
