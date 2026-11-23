/* Slitta con le renne della storia "Pranzo di Natale" (22 novembre):
   stesso disegno di sorgenti/slitta.svg, pittogramma a tratto unico con
   punte arrotondate come gli uccellini dello striscione. Il colore viene
   da `currentColor` (sabbia nella carta). Solo decorazione. */
export default function Slitta({ className }) {
  return (
    <svg className={className} viewBox="-10 -20 400 170" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {/* scia tratteggiata: il sentiero del brand */}
        <path d="M -10 140 C 20 132, 40 124, 62 116" strokeWidth="3" strokeDasharray="8 9" opacity="0.75" />
        {/* briglie */}
        <path d="M 95 80 C 150 70, 200 66, 230 66" strokeWidth="2" />
        <path d="M 230 66 C 270 54, 305 42, 334 35" strokeWidth="2" />
      </g>
      <g transform="translate(78 104) rotate(-12)" fill="currentColor" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M -40 22 L 30 22 C 44 22, 48 10, 38 6" fill="none" strokeWidth="4" />
        <path d="M -26 22 L -26 13 M 14 22 L 14 13" fill="none" strokeWidth="4" />
        <path d="M -44 -6 C -46 -16, -36 -18, -34 -8 L 22 -8 C 32 -8, 36 -2, 33 13 L -38 13 C -46 13, -46 4, -44 -6 Z" strokeWidth="2" />
        {/* sacco dei regali */}
        <path d="M -40 -8 C -44 -24, -30 -32, -24 -22 C -22 -16, -22 -12, -24 -8 Z" strokeWidth="2" />
        {/* Babbo Natale */}
        <ellipse cx="-6" cy="-14" rx="12" ry="10" strokeWidth="2" />
        <circle cx="-4" cy="-30" r="6.5" strokeWidth="2" />
        <path d="M -11 -33 L 3 -34 L 9 -46 Z" strokeWidth="2" />
        <circle cx="10" cy="-47" r="2.6" stroke="none" />
        <path d="M 4 -16 L 22 -20" fill="none" strokeWidth="4" />
      </g>
      <Renna x={214} y={74} r={-14} />
      <Renna x={318} y={44} r={-16} />
    </svg>
  );
}

function Renna({ x, y, r }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`} fill="currentColor" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M -26 0 C -27 -11, 18 -13, 23 -4 C 26 5, -18 9, -26 0 Z" strokeWidth="2" />
      <path d="M 17 -5 L 28 -21" fill="none" strokeWidth="7" />
      <ellipse cx="34" cy="-23" rx="8.5" ry="5" transform="rotate(18 34 -23)" strokeWidth="1.5" />
      <path d="M 29 -27 L 24 -41 M 26 -34 L 18 -37 M 33 -28 L 35 -43 M 34 -36 L 41 -40" fill="none" strokeWidth="2.6" />
      <path d="M 15 3 L 27 9 L 33 4 M 11 4 L 22 14" fill="none" strokeWidth="3.6" />
      <path d="M -19 4 L -33 9 M -23 2 L -38 1" fill="none" strokeWidth="3.6" />
      <path d="M -26 -2 L -32 -8" fill="none" strokeWidth="3" />
    </g>
  );
}
