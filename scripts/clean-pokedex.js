/**
 * Pokemon TCG Placeholders - Clean Pokédex
 *
 * This script transforms the pokedex-reorganized.json into pokedex-cleaned.json
 * by reorganizing the forms of each Pokémon species in a consistent way.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { saveIncrementalData } from "./__utils__/fileUtils.js";

// Get the current file's directory path (required for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the path to the public directory
const PUBLIC_DIR = path.join(path.resolve(__dirname, ".."), "public");

/**
 * Clean and reorganize the Pokédex by applying consistent ordering to forms
 *
 * @returns {Promise<Array>} - The cleaned Pokédex data
 */
const cleanPokedex = async () => {
  try {
    // Check for the input file
    const reorganizedPath = path.join(PUBLIC_DIR, "pokedex-reorganized.json");
    if (!fs.existsSync(reorganizedPath)) {
      throw new Error(
        "pokedex-reorganized.json not found in public directory! Run reorganize-pokedex.js first."
      );
    }

    // Load the reorganized Pokédex data
    console.log("Loading reorganized Pokédex data...");
    const pokedexData = JSON.parse(fs.readFileSync(reorganizedPath, "utf8"));
    console.log(`Loaded ${pokedexData.length} Pokémon entries`);

    // Load evolution chains if available - helps with ordering
    let evolutionChains = {};
    const evolutionChainsPath = path.join(PUBLIC_DIR, "evolution-chains.json");
    if (fs.existsSync(evolutionChainsPath)) {
      console.log("Loading evolution chain data for improved ordering...");
      const evolutionData = JSON.parse(
        fs.readFileSync(evolutionChainsPath, "utf8")
      );
      evolutionChains = evolutionData.evolutionGroups || {};
    }

    // Normalize form types
    console.log("Normalizing form types...");
    pokedexData.forEach((pokemon) => {
      if (pokemon.form_type) {
        // Normalize totem forms
        if (pokemon.form_type.includes("totem")) {
          pokemon.form_type = "totem";
        }

        // Normalize Pikachu cap forms
        if (
          pokemon.form_type.includes("-cap") ||
          [
            "original-cap",
            "hoenn-cap",
            "sinnoh-cap",
            "unova-cap",
            "kalos-cap",
            "alola-cap",
            "partner-cap",
            "world-cap",
          ].includes(pokemon.form_type)
        ) {
          pokemon.form_type = "cap";
        }

        // Normalize Pikachu cosplay forms
        if (
          [
            "rock-star",
            "belle",
            "pop-star",
            "phd",
            "libre",
            "cosplay",
          ].includes(pokemon.form_type)
        ) {
          pokemon.form_type = "cosplay";
        }

        // Fix specific name issues found during comparison
        if (pokemon.name === "Leviator Gigamax") {
          pokemon.name = "Krabboss Gigamax";
        }
      }
    });

    // Group Pokémon by Pokédex ID
    console.log("Grouping Pokémon by Pokédex ID...");
    const groupedByDexId = {};
    pokedexData.forEach((pokemon) => {
      const id = pokemon["pokedex-id"];
      if (!groupedByDexId[id]) {
        groupedByDexId[id] = [];
      }
      groupedByDexId[id].push(pokemon);
    });

    // Define form type priorities for sorting
    // Lower number = higher priority (appears first in the list)
    const formTypePriority = {
      base: 1, // Base form always comes first
      mega: 2, // Mega evolutions next
      "mega-x": 3,
      "mega-y": 4,
      gmax: 5, // Gigantamax forms
      alola: 6, // Regional forms
      galar: 7,
      hisui: 8,
      paldea: 9,
      cap: 10, // Pikachu cap forms
      cosplay: 11, // Pikachu cosplay forms
      starter: 12, // Partner/starter forms
      totem: 13, // Totem forms
      // Other form types would get higher numbers
    };

    // Get form type for a Pokémon
    const getFormType = (pokemon) => {
      // If explicit form_type exists, use it
      if (pokemon.form_type) {
        return pokemon.form_type;
      }

      // Otherwise detect from name
      const name = pokemon.name;
      if (name.includes("Méga-") && name.includes(" X")) return "mega";
      if (name.includes("Méga-") && name.includes(" Y")) return "mega";
      if (name.includes("Méga")) return "mega";
      if (name.includes("Gigamax")) return "gmax";
      if (name.includes(" d'Alola")) return "alola";
      if (name.includes(" de Galar")) return "galar";
      if (name.includes(" de Hisui")) return "hisui";
      if (name.includes(" de Paldea")) return "paldea";
      if (name.includes("Casquette")) return "cap";
      if (
        name.includes("Cosplayeur") ||
        name.includes("Rockeur") ||
        name.includes("Star") ||
        name.includes("Lady") ||
        name.includes("Docteur") ||
        name.includes("Catcheur")
      )
        return "cosplay";
      if (name.includes("Dominant")) return "totem";
      if (name.includes("Partenaire")) return "starter";

      // If no special form detected, it's the base form
      return "base";
    };

    // Apply additional form detection and normalization to entries
    console.log("Applying additional form detection...");
    for (const id in groupedByDexId) {
      groupedByDexId[id].forEach((pokemon) => {
        // Ensure all entries have a form_type, even if it's "base"
        if (!pokemon.form_type) {
          pokemon.form_type = getFormType(pokemon);
        }
      });
    }

    // Sort each group by form type priority
    console.log("Sorting Pokémon forms within each group...");
    Object.keys(groupedByDexId).forEach((id) => {
      groupedByDexId[id].sort((a, b) => {
        const aType = getFormType(a);
        const bType = getFormType(b);

        // Get priorities (default to 100 if not found)
        const aPriority = formTypePriority[aType] || 100;
        const bPriority = formTypePriority[bType] || 100;

        // Sort by priority first
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }

        // If same form type, sort alphabetically by name
        return a.name.localeCompare(b.name, "fr");
      });
    });

    // Create a map of evolutionary families if available
    const evolutionaryFamilies = new Map();
    if (Object.keys(evolutionChains).length > 0) {
      console.log("Processing evolutionary chains...");
      // Map each Pokémon ID to its chain URL for quick lookups
      for (const chainUrl in evolutionChains) {
        const speciesIds = evolutionChains[chainUrl];
        for (const id of speciesIds) {
          evolutionaryFamilies.set(parseInt(id), chainUrl);
        }
      }
    }

    // Helper function to get the evolutionary family for a Pokémon
    const getEvolutionaryFamily = (id) => {
      return evolutionaryFamilies.has(id)
        ? evolutionaryFamilies.get(id)
        : `standalone-${id}`;
    };

    // Group forms by evolutionary families if possible
    const groupedByFamily = {};
    const processedIds = new Set();

    // First pass - group by evolutionary family
    for (const id of Object.keys(groupedByDexId)
      .map(Number)
      .sort((a, b) => a - b)) {
      if (processedIds.has(id)) continue;

      const familyId =
        evolutionaryFamilies.size > 0
          ? getEvolutionaryFamily(id)
          : `family-${id}`;

      if (!groupedByFamily[familyId]) {
        groupedByFamily[familyId] = [];
      }

      // Add the Pokémon
      groupedByFamily[familyId].push(...groupedByDexId[id]);
      processedIds.add(id);

      // If evolution chains are available, add other Pokémon from the same family
      if (evolutionaryFamilies.size > 0 && evolutionChains[familyId]) {
        for (const relatedId of evolutionChains[familyId]) {
          if (
            relatedId !== id &&
            groupedByDexId[relatedId] &&
            !processedIds.has(relatedId)
          ) {
            groupedByFamily[familyId].push(...groupedByDexId[relatedId]);
            processedIds.add(relatedId);
          }
        }
      }
    }

    // Second pass - add any remaining Pokémon
    for (const id of Object.keys(groupedByDexId)
      .map(Number)
      .sort((a, b) => a - b)) {
      if (!processedIds.has(id)) {
        const familyId = `standalone-${id}`;
        if (!groupedByFamily[familyId]) {
          groupedByFamily[familyId] = [];
        }
        groupedByFamily[familyId].push(...groupedByDexId[id]);
        processedIds.add(id);
      }
    }

    // Flatten the grouped and sorted Pokémon back into an array
    const cleanedPokedex = [];

    // Process families in order of lowest Pokédex ID
    const sortedFamilies = Object.keys(groupedByFamily).sort((a, b) => {
      const aFirstId = Math.min(
        ...groupedByFamily[a].map((p) => p["pokedex-id"])
      );
      const bFirstId = Math.min(
        ...groupedByFamily[b].map((p) => p["pokedex-id"])
      );
      return aFirstId - bFirstId;
    });

    // Add each family in order
    for (const familyId of sortedFamilies) {
      // Sort within family by Pokédex ID first
      const familyPokemon = groupedByFamily[familyId];
      familyPokemon.sort((a, b) => {
        // First sort by Pokédex ID
        if (a["pokedex-id"] !== b["pokedex-id"]) {
          return a["pokedex-id"] - b["pokedex-id"];
        }

        // If same ID, sort by form priority
        const aType = getFormType(a);
        const bType = getFormType(b);

        const aPriority = formTypePriority[aType] || 100;
        const bPriority = formTypePriority[bType] || 100;

        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }

        // If same form type, sort alphabetically
        return a.name.localeCompare(b.name, "fr");
      });

      cleanedPokedex.push(...familyPokemon);
    }

    // Verify data integrity
    console.log(
      `Original length: ${pokedexData.length}, Cleaned length: ${cleanedPokedex.length}`
    );

    if (cleanedPokedex.length !== pokedexData.length) {
      console.warn(
        `WARNING: Length mismatch between original and cleaned pokedex!`
      );
      console.warn(
        `Original: ${pokedexData.length}, Cleaned: ${cleanedPokedex.length}`
      );
    }

    // Save the cleaned Pokédex to the public directory
    saveIncrementalData(cleanedPokedex, "pokedex-cleaned.json", PUBLIC_DIR);
    console.log("Cleaned Pokédex saved to public/pokedex-cleaned.json");

    return cleanedPokedex;
  } catch (error) {
    console.error("Error cleaning Pokédex:", error.message);
  }
};

// Run the cleaning process
cleanPokedex();
