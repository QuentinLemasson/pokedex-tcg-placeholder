import { useState, useEffect } from "react";
import "./App.css";
import CardGrid from "./components/CardGrid";
import Pagination from "./components/Pagination";
import { Pokemon } from "./types";
import { exportToPdf } from "./utils/pdfExport";

function App() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 9; // 3x3 grid
  const totalPages = Math.ceil(pokemons.length / cardsPerPage);

  useEffect(() => {
    // Fetch Pokemon data
    fetch("/pokedex-cleaned.json")
      .then((response) => response.json())
      .then((data) => setPokemons(data))
      .catch((error) => console.error("Error fetching Pokemon data:", error));
  }, []);

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
  };

  // Get current page's Pokemon
  const currentPokemons = pokemons.slice(
    (currentPage - 1) * cardsPerPage,
    currentPage * cardsPerPage
  );

  return (
    <div className="app-container">
      <header>
        <h1>Pokémon TCG Placeholder Cards</h1>
        <div className="controls">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
          />
          <button className="export-btn" onClick={exportToPdf}>
            Export to PDF
          </button>
        </div>
      </header>

      <CardGrid pokemons={currentPokemons} />
    </div>
  );
}

export default App;
