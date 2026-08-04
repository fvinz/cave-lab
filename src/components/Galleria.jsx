import Icon from "./Icon.jsx";
import useReveal from "../hooks/useReveal.js";
import { GALLERIA_FALLBACK, INSTAGRAM_POSTS, SOCIAL } from "../content.js";

/* Galleria fotografica: anteprime locali dei post, tessere pulite
   integrate nel tema. Ogni tessera apre il post su Instagram. */
export default function Galleria() {
  const scope = useReveal();

  return (
    <section className="section section-continua section-galleria" id="galleria" ref={scope}>
      <div className="container">
        <p className="kicker kicker-center" data-reveal>Elemento 06 · Scatti dal campo</p>
        <h2 className="section-title section-title-center" data-reveal>Galleria</h2>
        <p className="section-text section-text-center" data-reveal>
          Gli ultimi scatti dal laboratorio: tocca una foto per aprire il post su Instagram.
        </p>

        {INSTAGRAM_POSTS.length > 0 ? (
          <div className="insta-gallery" data-reveal-stagger>
            {INSTAGRAM_POSTS.map((post) => (
              <a
                key={post.url}
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="insta-tile"
                aria-label={`${post.caption} — apri il post su Instagram`}
              >
                <picture>
                  <source srcSet={post.img.replace(/\.jpg$/, ".webp")} type="image/webp" />
                  <img src={post.img} alt={post.caption} width="640" height="640" loading="lazy" />
                </picture>
                <span className="insta-tile-overlay" aria-hidden="true">
                  <Icon name="instagram" className="insta-tile-icon" />
                  <span className="insta-tile-caption">{post.caption}</span>
                </span>
              </a>
            ))}
          </div>
        ) : (
          <div className="gallery-grid" data-reveal-stagger>
            {GALLERIA_FALLBACK.map((tile) => (
              <figure
                className="gallery-tile"
                key={tile.caption}
                style={{ "--tile-bg": tile.color, ...(tile.dark ? { color: "#241B00" } : {}) }}
              >
                <Icon name={tile.icon} className="gallery-icon" />
                <figcaption>{tile.caption}</figcaption>
              </figure>
            ))}
          </div>
        )}

        <div className="ig-cta" data-reveal>
          <a href={SOCIAL.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            <Icon name="instagram" />
            Segui {SOCIAL.instagramHandle} su Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
