// import Card from "./Card";
import { Pokemon } from "../types";
import Card from "./Card";

interface CardGridProps {
  pokemons: Pokemon[];
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

const CardGrid = ({
  pokemons,
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
}: CardGridProps) => {
  return (
    <div className="flex items-center justify-center h-full relative">
      {/* Left Arrow (Previous) */}
      <button
        onClick={onPrevPage}
        disabled={currentPage === 1}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 bg-secondary hover:bg-blue-700 text-white p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all z-10"
        aria-label="Previous page"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Right Arrow (Next) */}
      <button
        onClick={onNextPage}
        disabled={currentPage === totalPages}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 bg-secondary hover:bg-blue-700 text-white p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all z-10"
        aria-label="Next page"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <div className="flex flex-col items-center">
        <div className="grid grid-cols-3 grid-rows-3 gap-4">
          {pokemons.map((pokemon, i) => (
            <div
              key={i}
              className="relative w-[160px] aspect-[65/88] bg-gray-300 rounded shadow-md"
            >
              {/* Contenu de la carte ici */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Card pokemon={pokemon} />
              </div>
            </div>
          ))}

          {Array.from({ length: 9 - pokemons.length }).map((_, i) => (
            <div
              key={i}
              className="relative w-[130px] aspect-[65/88] bg-gray-300 rounded shadow-md"
            >
              {/* Contenu de la carte ici */}
              <div className="absolute inset-0 flex items-center justify-center"></div>
            </div>
          ))}
        </div>

        {/* Page Info (Bottom) */}
        <div className="absolute bottom-[-48px] left-1/2 -translate-x-1/2">
          <div className="px-4 py-2 bg-white rounded-lg shadow-inner text-sm font-medium">
            Page <span className="font-bold text-secondary">{currentPage}</span>{" "}
            of <span className="font-bold text-secondary">{totalPages}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardGrid;
