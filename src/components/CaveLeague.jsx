import Icon from "./Icon.jsx";
import CountUp from "./CountUp.jsx";
import useReveal from "../hooks/useReveal.js";
import { CAVE_LEAGUE } from "../content.js";

const { podium, siteUrl } = CAVE_LEAGUE;

function PhotoTile({ photo }) {
  return (
    <figure className="league-photo">
      <picture>
        <source srcSet={photo.src.replace(/\.jpg$/, ".webp")} type="image/webp" />
        <img src={photo.src} alt={photo.caption} width="1000" height="750" loading="lazy" />
      </picture>
    </figure>
  );
}

export default function CaveLeague() {
  const scope = useReveal();

  return (
    <section className="section section-atto section-league" id="cave-league" ref={scope}>
      <div className="league-glow" aria-hidden="true"></div>

      <div className="container">
        <div className="league-header" data-reveal>
          <p className="kicker kicker-center">{CAVE_LEAGUE.kicker}</p>
          <h2 className="section-title section-title-center league-title">
            <img
              src="/cave-league/logo-badge-white.png"
              alt=""
              aria-hidden="true"
              className="league-badge"
              width="105"
              height="144"
            />
            Cave League
          </h2>
          <p className="league-edition">{CAVE_LEAGUE.edition}</p>
          <p className="section-text section-text-center league-recap">{CAVE_LEAGUE.recap}</p>
        </div>

        {/* Podio: l'intero blocco è un link al sito del torneo */}
        <a
          href={siteUrl}
          className="league-podium"
          data-reveal
          aria-label="Vai alla classifica completa, calendario e statistiche della Cave League"
        >
          <h3 className="league-podium-title">{podium.title}</h3>

          <ol className="podium-list">
            {podium.places.map((p) => (
              <li
                key={p.team}
                className={"podium-place podium-place-" + p.rank}
                style={{ "--team-color": p.color }}
              >
                <span className="podium-rank" aria-hidden="true">
                  {p.rank === 1 ? <Icon name="trophy" className="podium-trophy" /> : p.rank}
                </span>
                <span className="podium-body">
                  <span className="podium-medal">{p.medal}</span>
                  <span className="podium-team">{p.team}</span>
                  <span className="podium-detail">{p.detail}</span>
                </span>
              </li>
            ))}
          </ol>

          <div className="podium-extra">
            <span className="podium-scorer">
              <Icon name="ball" className="podium-scorer-icon" />
              <span>
                <strong>Capocannoniere:</strong> {podium.topScorer.name} ({podium.topScorer.team}) —{" "}
                {podium.topScorer.goals} gol
              </span>
            </span>
            <span className="podium-hint">
              Tutte le partite, la classifica e le statistiche
              <Icon name="arrowRight" className="podium-hint-icon" />
            </span>
          </div>
        </a>

        <div className="league-stats" data-reveal aria-label="Cave League in numeri">
          {CAVE_LEAGUE.stats.map((stat) => (
            <div className="league-stat" key={stat.label}>
              <span className="league-stat-box">
                <CountUp value={stat.value} className="league-stat-number" />
                <span className="league-stat-suffix">{stat.suffix}</span>
              </span>
              <span className="league-stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Carosello foto della finalissima (in pausa su hover,
          statico con prefers-reduced-motion) */}
      <div className="league-marquee" data-reveal aria-label="Foto della finalissima Cave League 2026">
        <div className="league-marquee-track">
          {CAVE_LEAGUE.photos.map((photo) => (
            <PhotoTile photo={photo} key={photo.src} />
          ))}
          <div style={{ display: "contents" }} aria-hidden="true">
            {CAVE_LEAGUE.photos.map((photo) => (
              <PhotoTile photo={photo} key={photo.src + "-bis"} />
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        <div className="league-cta" data-reveal>
          <p className="league-note">{CAVE_LEAGUE.siteNote}</p>
          <a href={siteUrl} className="btn btn-league">
            {CAVE_LEAGUE.siteCta}
            <Icon name="arrowRight" />
          </a>
        </div>
      </div>
    </section>
  );
}
