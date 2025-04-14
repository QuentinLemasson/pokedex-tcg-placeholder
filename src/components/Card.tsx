import { Pokemon } from "../types";

interface CardProps {
  pokemon: Pokemon;
}

const Card = ({ pokemon }: CardProps) => {
  return (
    <div className="card">
      <div className="card-inner">
        <div className="card-image">
          <img src={pokemon.sprite} alt={pokemon.name} />
        </div>
        <div className="card-info">
          <h2>{pokemon.name}</h2>
          <div className="card-details">
            <p>Pokédex: #{pokemon["pokedex-id"]}</p>
            <p>Type: {pokemon.type}</p>
            {pokemon.form_type && <p>Form: {pokemon.form_type}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
