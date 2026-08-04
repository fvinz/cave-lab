import { useEffect, useRef, useState } from "react";
import { NAV_LINKS } from "../content.js";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const navRef = useRef(null);
  const toggleRef = useRef(null);

  /* Evidenzia in nav la sezione attualmente visibile */
  useEffect(() => {
    const sections = document.querySelectorAll("main section[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive("#" + entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  /* Menu aperto: chiusura con Escape o click fuori, e blocco dello
     scroll della pagina sottostante. */
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onPointerDown = (e) => {
      if (navRef.current?.contains(e.target) || toggleRef.current?.contains(e.target)) return;
      setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    /* Nota: niente `overflow: hidden` sul body — romperebbe l'header
       sticky a cui il menu è ancorato. Lo scrim assorbe i click e il
       menu segue l'header durante lo scroll. */
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <header className="site-header" id="top">
      <div className="container header-inner">
        <a href="#top" className="brand" aria-label="Cave Lab, torna in cima">
          <span className="brand-tile" aria-hidden="true">
            <img src="/logo.svg" alt="" className="brand-logo-img" width="120" height="70" />
          </span>
          <span className="brand-name">
            Cave<span className="brand-name-accent">Lab</span>
          </span>
        </a>

        <button
          ref={toggleRef}
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="primaryNav"
          aria-label={open ? "Chiudi il menu di navigazione" : "Apri il menu di navigazione"}
          onClick={() => setOpen(!open)}
        >
          <span className="nav-toggle-bar"></span>
          <span className="nav-toggle-bar"></span>
          <span className="nav-toggle-bar"></span>
        </button>

        {/* Velo che isola il menu dal contenuto sottostante */}
        <div className={"nav-scrim" + (open ? " is-visible" : "")} aria-hidden="true"></div>

        <nav
          className={"primary-nav" + (open ? " is-open" : "")}
          id="primaryNav"
          aria-label="Navigazione principale"
          ref={navRef}
        >
          <ul className="nav-list">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={"nav-link" + (active === link.href ? " is-active" : "")}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a href="#contatti" className="nav-link nav-cta" onClick={() => setOpen(false)}>
                Unisciti a noi
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
