// import Card from "./Card";
import { Pokemon } from "../types";
import Card from "./Card";

interface CardGridProps {
  pokemons: Pokemon[];
}

const CardGrid = ({ pokemons }: CardGridProps) => {
  return (
    <div className="flex items-center justify-center h-full">
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
    </div>
  );
};

export default CardGrid;
