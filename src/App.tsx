import { useState, useEffect, useRef, useMemo } from "react";
import CardGrid from "./components/CardGrid";
import { Pokemon } from "./types";
import { exportToPdf } from "./utils/pdfExport";
import { FormFilterContainer } from "./components/form-filter.container";

function App() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 9; // 3x3 grid
  const mainRef = useRef<HTMLDivElement>(null);

  const [selectedForms, setSelectedForms] = useState<string[]>([]);

  const handleFilterChange = (selectedForms: string[]) => {
    // Reset to first page when filters change
    setCurrentPage(1);
    setSelectedForms(selectedForms);
  };

  useEffect(() => {
    // Fetch Pokemon data
    fetch("/pokedex-cleaned.json")
      .then((response) => response.json())
      .then((data) => setPokemons(data))
      .catch((error) => console.error("Error fetching Pokemon data:", error));
  }, []);

  // Filter Pokemon based on selection criteria
  const filteredPokemons = useMemo(() => {
    // If no forms are selected, return all Pokemon
    if (selectedForms.length === 0) {
      return pokemons;
    }

    // Otherwise, return Pokemon that either:
    // 1. Have no form_type property (always show these)
    // 2. Have a form_type that's included in the selectedForms
    return pokemons.filter(
      (pokemon) =>
        !pokemon.form_type || selectedForms.includes(pokemon.form_type)
    );
  }, [pokemons, selectedForms]);

  // Calculate total pages based on filtered Pokemon
  const totalPages = Math.max(
    1,
    Math.ceil(filteredPokemons.length / cardsPerPage)
  );

  // Make sure current page is valid after filtering
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
  };

  // Get current page's Pokemon
  const currentPokemons = filteredPokemons.slice(
    (currentPage - 1) * cardsPerPage,
    currentPage * cardsPerPage
  );

  return (
    <div className="h-full flex flex-col">
      <header className="my-4 mx-4 text-center relative">
        <h1 className="text-3xl sm:text-4xl font-bold text-secondary mb-4 drop-shadow-md">
          Pokémon TCG Placeholder Cards
          <button
            onClick={exportToPdf}
            className="bg-primary absolute top-0 right-0 hover:bg-yellow-500 text-textColor font-bold py-2 px-6 rounded-full shadow-md transition-all transform hover:scale-105 flex items-center gap-2 h-8 text-xs"
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
        </h1>
      </header>
      <div className="relative h-full w-full">
        {/* Fixed position filter sidebar */}
        <div className="fixed left-4 top-8xl w-64 z-20">
          <FormFilterContainer
            onFilterChange={handleFilterChange}
            selection={selectedForms}
          />
          {selectedForms.length > 0 && (
            <div className="mt-2 bg-white p-2 rounded-lg shadow text-sm">
              <p>
                Showing:{" "}
                <span className="font-bold">{filteredPokemons.length}</span>{" "}
                Pokémon
              </p>
            </div>
          )}
        </div>

        {/* Main content with left padding to accommodate sidebar */}
        <div className="w-full h-full">
          <main ref={mainRef} className="flex-1 w-full mx-auto max-w-4xl">
            <CardGrid
              pokemons={currentPokemons}
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevPage={handlePrevPage}
              onNextPage={handleNextPage}
            />
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
