import { useState, useEffect, useRef } from "react";
import CardGrid from "./components/CardGrid";
import Pagination from "./components/Pagination";
import { Pokemon } from "./types";
import { exportToPdf } from "./utils/pdfExport";

function App() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 9; // 3x3 grid
  const totalPages = Math.ceil(pokemons.length / cardsPerPage);
  const mainRef = useRef<HTMLDivElement>(null);

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
    <div className="min-h-screen bg-gradient-to-br from-appBg to-blue-50 py-6 px-4">
      <div className="max-w-6xl mx-auto h-[calc(100vh-48px)] flex flex-col">
        <header className="mb-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-secondary mb-4 drop-shadow-md">
            Pokémon TCG Placeholder Cards
          </h1>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-5 mb-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevPage={handlePrevPage}
              onNextPage={handleNextPage}
            />

            <button
              onClick={exportToPdf}
              className="bg-primary hover:bg-yellow-500 text-textColor font-bold py-2 px-6 rounded-full shadow-md transition-all transform hover:scale-105 flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                  clipRule="evenodd"
                />
              </svg>
              Export to PDF
            </button>
          </div>
        </header>

        <main ref={mainRef} className="flex-1">
          <CardGrid pokemons={currentPokemons} />
        </main>
      </div>
    </div>
  );
}

export default App;
