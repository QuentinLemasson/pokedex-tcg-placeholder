import { Pokemon } from "../types";

interface CardProps {
  pokemon: Pokemon;
}

// Helper function to get color based on Pokémon type
const getTypeColor = (type: string): string => {
  const primaryType = type.split("/")[0].trim().toLowerCase();

  const typeColors: Record<string, string> = {
    normal: "bg-gray-300",
    fire: "bg-orange-500",
    water: "bg-blue-400",
    electric: "bg-yellow-300",
    grass: "bg-green-500",
    ice: "bg-blue-200",
    fighting: "bg-red-700",
    poison: "bg-purple-600",
    ground: "bg-yellow-600",
    flying: "bg-indigo-300",
    psychic: "bg-pink-500",
    bug: "bg-lime-500",
    rock: "bg-yellow-800",
    ghost: "bg-purple-800",
    dragon: "bg-indigo-600",
    dark: "bg-gray-800",
    steel: "bg-gray-400",
    fairy: "bg-pink-300",
  };

  return typeColors[primaryType] || "bg-gray-300";
};

const getTypeGradient = (type: string): string => {
  const primaryType = type.split("/")[0].trim().toLowerCase();

  const typeGradients: Record<string, string> = {
    normal: "from-gray-200 to-gray-300",
    fire: "from-orange-300 to-orange-500",
    water: "from-blue-300 to-blue-500",
    electric: "from-yellow-200 to-yellow-400",
    grass: "from-green-300 to-green-600",
    ice: "from-blue-100 to-blue-300",
    fighting: "from-red-500 to-red-700",
    poison: "from-purple-400 to-purple-700",
    ground: "from-yellow-500 to-yellow-700",
    flying: "from-indigo-200 to-indigo-400",
    psychic: "from-pink-300 to-pink-600",
    bug: "from-lime-300 to-lime-600",
    rock: "from-yellow-600 to-yellow-800",
    ghost: "from-purple-600 to-purple-900",
    dragon: "from-indigo-400 to-indigo-700",
    dark: "from-gray-600 to-gray-900",
    steel: "from-gray-300 to-gray-500",
    fairy: "from-pink-200 to-pink-400",
  };

  return typeGradients[primaryType] || "from-gray-200 to-gray-300";
};

const Card = ({ pokemon }: CardProps) => {
  const typeColor = getTypeColor(pokemon.type);
  const typeGradient = getTypeGradient(pokemon.type);

  return (
    <div className="h-full w-full">
      <div className="relative w-full h-full rounded-lg overflow-hidden shadow-md bg-white border-2 border-secondary aspect-tcg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        {/* Card header with Pokémon name */}
        <div
          className={`px-3 py-1 ${typeColor} text-white font-bold text-xs sm:text-sm flex justify-between items-center`}
        >
          <span className="truncate max-w-[70%]">{pokemon.name}</span>
          <span>#{pokemon["pokedex-id"]}</span>
        </div>

        {/* Card image - the main focus */}
        <div
          className={`flex justify-center items-center p-2 bg-gradient-to-b ${typeGradient} h-[60%]`}
        >
          <div className="bg-white/30 rounded-full p-1 sm:p-2 w-4/5 h-4/5 flex justify-center items-center">
            <img
              src={pokemon.sprite}
              alt={pokemon.name}
              className="max-w-full max-h-full object-contain drop-shadow-md transition-transform hover:scale-110"
              loading="lazy"
            />
          </div>
        </div>

        {/* Card info */}
        <div className="p-1 sm:p-2 bg-white flex flex-col justify-between h-[36%]">
          {/* Type badges */}
          <div className="flex flex-wrap gap-1 text-[0.6rem] sm:text-xs">
            {pokemon.type.split("/").map((type, index) => (
              <span
                key={index}
                className={`px-1.5 py-0.5 rounded-full text-white font-semibold ${getTypeColor(
                  type
                )}`}
              >
                {type.trim()}
              </span>
            ))}
          </div>

          {/* Additional details */}
          <div className="text-[0.6rem] sm:text-xs text-gray-700 mt-1">
            {pokemon.form_type && (
              <p className="text-center bg-gray-100 rounded py-0.5 font-medium">
                {pokemon.form_type}
              </p>
            )}
          </div>
        </div>

        {/* Card footer - like a holographic effect */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"></div>
      </div>
    </div>
  );
};

export default Card;
