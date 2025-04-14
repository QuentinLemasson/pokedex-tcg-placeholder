import Card from "./Card";
import { Pokemon } from "../types";

interface CardGridProps {
  pokemons: Pokemon[];
}

const CardGrid = ({ pokemons }: CardGridProps) => {
  return (
    <div className="card-grid">
      {pokemons.map((pokemon, index) => (
        <Card key={`${pokemon["pokedex-id"]}-${index}`} pokemon={pokemon} />
      ))}
    </div>
  );
};

export default CardGrid;
