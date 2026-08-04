/* Libreria di icone SVG interna: stroke coerente (1.6-2), 24x24.
   Uso: <Icon name="flask" className="gallery-icon" /> */

const PATHS = {
  flask: <path d="M9 3h6M10 3v6l-6 10a2 2 0 002 3h12a2 2 0 002-3l-6-10V3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />,
  testtube: (
    <>
      <rect x="9" y="2.5" width="6" height="5" rx="1" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 7v6.5L4.5 20a1.6 1.6 0 001.3 2.5h12.4a1.6 1.6 0 001.3-2.5L14 13.5V7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </>
  ),
  plant: <path d="M12 3v4M9 21h6M8 21c-1-3 0-6 2-7.5V9a2 2 0 114 0v4.5c2 1.5 3 4.5 2 7.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
  spark: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />,
  map: (
    <>
      <path d="M9 4L4 6v14l5-2 6 2 5-2V4l-5 2-6-2z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 4v14M15 6v14" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </>
  ),
  palette: (
    <>
      <path d="M12 3a9 9 0 100 18c1.2 0 1.7-.7 1.7-1.5s-.5-1.2-.5-2 .6-1.3 1.5-1.3h1.6A3.7 3.7 0 0020 12.7C20 7.4 16.4 3 12 3z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="8.2" cy="10.5" r="1.1" fill="currentColor" />
      <circle cx="11.5" cy="7.8" r="1.1" fill="currentColor" />
      <circle cx="15.2" cy="9.2" r="1.1" fill="currentColor" />
    </>
  ),
  trophy: (
    <>
      <path d="M7 4h10v3a5 5 0 01-10 0V4z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M7 5H4.5c0 3 1.5 4.5 3 4.5M17 5h2.5c0 3-1.5 4.5-3 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 12v4M9 20h6M10 16h4v4h-4z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </>
  ),
  team: (
    <>
      <circle cx="9" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16.5" cy="9.5" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 19c0-2.8 2.2-5 5-5s5 2.2 5 5M14.5 15.5c.9-.9 2-1.4 3.2-1.4 1.7 0 3.3 1.4 3.3 3.4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  megaphone: (
    <>
      <path d="M4 14V8l9-4v14l-9-4z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M13 8.5c2.5.7 4 1.9 4 3.5s-1.5 2.8-4 3.5M6 14v5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  ball: (
    <>
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 3.5c2.5 2.3 4 5.2 4 8.5s-1.5 6.2-4 8.5c-2.5-2.3-4-5.2-4-8.5s1.5-6.2 4-8.5zM3.5 12h17" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </>
  ),
  camera: (
    <>
      <rect x="3.5" y="6" width="17" height="13" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 6l1.2-2h3.6L15 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="12.5" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </>
  ),
  heart: <path d="M12 21s7-5.2 7-10.5a4.2 4.2 0 00-7-3.1 4.2 4.2 0 00-7 3.1C5 15.8 12 21 12 21z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.5v4.5l3 2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  flag: (
    <>
      <path d="M8 21v-4M8 13V3l8 2.5L8 8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 21h8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M3.8 20.2l1.2-4.2a8 8 0 113.1 3l-4.3 1.2z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9.2 8.4c.2-.5.4-.5.7-.5h.6c.2 0 .4 0 .6.5l.7 1.7c.1.3 0 .5-.1.7l-.4.5c-.1.2-.2.3 0 .6a7 7 0 002.9 2.4c.3.1.5.1.7-.1l.5-.6c.2-.2.4-.2.6-.1l1.6.8c.3.1.4.3.4.5v.7c0 .4-.3.8-.7 1-.5.3-1.1.4-1.8.2a9.4 9.4 0 01-5.9-5.5c-.3-.9-.2-1.7-.4-2.8z" fill="currentColor" />
    </>
  ),
  mail: (
    <>
      <path d="M4 6h16v12H4z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 7l8 6 8-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="9" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </>
  ),
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />,
  arrowUp: <path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />,
  send: <path d="M4 12l16-8-6 16-3-7-7-1z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />,
};

export default function Icon({ name, className = "icon", ...props }) {
  const content = PATHS[name];
  if (!content) return null;
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...props}>
      {content}
    </svg>
  );
}
