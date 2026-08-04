import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import ChiSiamo from "./components/ChiSiamo.jsx";
import Attivita from "./components/Attivita.jsx";
import Eventi from "./components/Eventi.jsx";
import CaveLeague from "./components/CaveLeague.jsx";
import Territorio from "./components/Territorio.jsx";
import Galleria from "./components/Galleria.jsx";
import Contatti from "./components/Contatti.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">Vai al contenuto principale</a>
      <Header />
      <main id="main">
        <Hero />
        <ChiSiamo />
        <Attivita />
        <Eventi />
        <CaveLeague />
        <Territorio />
        <Galleria />
        <Contatti />
      </main>
      <Footer />
    </>
  );
}
