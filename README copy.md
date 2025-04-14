# Pokemon TCG Placeholders

A tool for importing and organizing Pokémon data from the PokeAPI, with special handling for evolution lines and forms.

## Project Structure

The project is organized into the following structure:

```
pokemon-tcg-placeholders/
├── utils/                          # Utility modules
│   ├── apiUtils.js                 # API-related utilities (fetching, retry logic)
│   ├── fileUtils.js                # File system utilities (loading, saving, backups)
│   ├── evolutionUtils.js           # Evolution chain organization utilities
│   └── importUtils.js              # Main import functionality
├── scripts/                        # Utility modules
│   ├── import-base-pokedex.js      # Script to import Pokémon species and forms
│   ├── import-evolution-chains.js  # Script to import evolution chains
│   ├── reorganize-pokedex.js       # Script to reorganize Pokédex using other data
│   └── import-all.js               # Convenience script to run all steps in sequence
├── backups/                # Backup files (created automatically)
└── README.md               # This documentation file
```

## Features

- Imports Pokémon data from the PokeAPI
- Handles all forms of Pokémon (base forms, regional variants, special forms)
- Organizes Pokémon by evolution lines
- Groups Pokémon by form variant across evolution lines
- Keeps all forms of a Pokémon together with their base species
- Supports incremental imports (can resume from where it left off)
- Creates automatic backups before saving new data
- Handles API rate limiting with retry logic and delays

## Usage

You can run the entire import process with a single command:

```bash
node import-all.js
```

This will run all three steps in sequence and is the easiest way to use the tool.

Alternatively, you can run each step individually:

### 1. Import Base Pokédex

```bash
node import-base-pokedex.js
```

This script imports all Pokémon species and their forms with French translations and saves them to `base-pokedex.json`.

### 2. Import Evolution Chains

```bash
node import-evolution-chains.js
```

This script imports all evolution chains from the PokeAPI and saves them to `evolution-chains.json`.

### 3. Reorganize Pokédex

```bash
node reorganize-pokedex.js
```

This script uses the `base-pokedex.json` and `evolution-chains.json` files to create a reorganized Pokédex in `pokedex-reorganized.json`, where Pokémon are grouped by evolution lines and form variants.

## Organization Logic

The reorganized Pokédex is organized as follows:

1. First, Pokémon are grouped by evolution chains
2. Within each evolution chain, Pokémon are further organized by form variants:
   - All base forms are grouped together first, in evolution order
   - Then, each regional/special form variant group is added in evolution order

Example organization:

```
Caninos            (Base form, first evolution stage)
Arcanin            (Base form, second evolution stage)
Caninos de Hisui   (Hisui form, first evolution stage)
Arcanin de Hisui   (Hisui form, second evolution stage)
```

## Output Files

- **base-pokedex.json**: Contains all Pokémon species and forms with French translations
- **evolution-chains.json**: Contains evolution chain data including the correct order of evolutions
- **pokedex-reorganized.json**: Contains the final reorganized Pokédex with Pokémon grouped by evolution lines and form variants

## Utility Modules

### apiUtils.js

Contains utilities for making API requests with retry logic and handling delays between requests.

### fileUtils.js

Contains utilities for file operations including loading existing data, saving data incrementally, and creating backups.

### evolutionUtils.js

Contains utilities for organizing Pokémon by their evolution chains, ensuring that related Pokémon and their forms are grouped together correctly.

### importUtils.js

Contains the main import functionality, which is now used by the separate script files.

## Output Format

The output files contain Pokémon entries, each with the following structure:

```json
{
  "name": "Pokemon Name",
  "pokedex-id": 123
}
```

In the final reorganized Pokédex (`pokedex-reorganized.json`), the entries are organized by evolution lines and form variants as described above.
