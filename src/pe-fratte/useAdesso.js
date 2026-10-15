import { useEffect, useState } from "react";

/* L'ora corrente, aggiornata ogni `ogniMs`: per i conti alla rovescia */
export default function useAdesso(ogniMs = 30000) {
  const [ora, setOra] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setOra(new Date()), ogniMs);
    return () => clearInterval(id);
  }, [ogniMs]);
  return ora;
}
