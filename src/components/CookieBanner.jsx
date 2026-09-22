import { useEffect, useState } from "react";

const STORAGE_KEY = "cavelab-cookie-consent";
export const OPEN_EVENT = "cavelab:open-cookie-banner";

function readConsent() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveConsent(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* storage non disponibile: la scelta vale solo per questa visita */
  }
  window.gtag?.("consent", "update", { analytics_storage: value });
}

export function openCookieBanner() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export default function CookieBanner() {
  const [open, setOpen] = useState(() => readConsent() === null);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, show);
    return () => window.removeEventListener(OPEN_EVENT, show);
  }, []);

  if (!open) return null;

  const choose = (value) => {
    saveConsent(value);
    setOpen(false);
  };

  return (
    <section className="cookie-banner" role="region" aria-label="Consenso cookie">
      <p>
        Cookie di statistica (Google Analytics) solo se accetti.{" "}
        <a href="/privacy">Privacy</a>
      </p>
      <div className="cookie-actions">
        <button type="button" className="cookie-btn" onClick={() => choose("denied")}>
          Rifiuta
        </button>
        <button type="button" className="cookie-btn" onClick={() => choose("granted")}>
          Accetta
        </button>
      </div>
    </section>
  );
}
