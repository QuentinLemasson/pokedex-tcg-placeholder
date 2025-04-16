export interface Pokemon {
  name: string;
  "pokedex-id": number;
  sprite: string;
  type: string;
  form_type?: string;
  gen: number;
}
