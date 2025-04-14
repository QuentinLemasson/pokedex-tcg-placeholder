/**
 * Pokemon TCG Placeholders - Reorganize Pokédex
 *
 * This script uses the base-pokedex.json and evolution-chains.json files
 * to create a reorganized Pokédex in pokedex-reorganized.json.
 */

const { saveIncrementalData } = require("../utils/fileUtils");
const fs = require("fs");

/**
 * Reorganizes the Pokédex data using evolution chain information
 *
 * @returns {Promise<Array>} - The reorganized Pokédex data
 */
const reorganizePokedex = async () => {
  try {
    // Check for required input files
    if (!fs.existsSync("base-pokedex.json")) {
      throw new Error(
        "base-pokedex.json not found! Run import-base-pokedex.js first."
      );
    }

    if (!fs.existsSync("evolution-chains.json")) {
      throw new Error(
        "evolution-chains.json not found! Run import-evolution-chains.js first."
      );
    }

    // Load the data
    console.log("Loading base Pokédex data...");
    const pokedexData = JSON.parse(
      fs.readFileSync("base-pokedex.json", "utf8")
    );
    console.log(`Loaded ${pokedexData.length} Pokémon entries`);

    console.log("Loading evolution chain data...");
    const evolutionData = JSON.parse(
      fs.readFileSync("evolution-chains.json", "utf8")
    );
    console.log(
      `Loaded ${
        Object.keys(evolutionData.evolutionGroups).length
      } evolution chains`
    );

    // Step 1: Group by Pokédex ID
    console.log("Grouping Pokémon by Pokédex ID...");
    const groupedByDexId = {};
    pokedexData.forEach((entry) => {
      const id = entry["pokedex-id"];
      if (!groupedByDexId[id]) {
        groupedByDexId[id] = [];
      }
      groupedByDexId[id].push(entry);
    });

    // Step 2: Sort entries in each group - base form first, then regional forms, then special forms
    console.log("Sorting Pokémon forms within each group...");
    Object.keys(groupedByDexId).forEach((id) => {
      groupedByDexId[id].sort((a, b) => {
        // Base forms first (no special characters in name)
        const aIsBase =
          !a.name.includes("-") &&
          !a.name.includes(" de ") &&
          !a.name.includes(" d'") &&
          !a.name.includes("Méga") &&
          !a.name.includes("Gigamax");
        const bIsBase =
          !b.name.includes("-") &&
          !b.name.includes(" de ") &&
          !b.name.includes(" d'") &&
          !b.name.includes("Méga") &&
          !b.name.includes("Gigamax");

        if (aIsBase && !bIsBase) return -1;
        if (!aIsBase && bIsBase) return 1;

        // Then sort alphabetically
        return a.name.localeCompare(b.name, "fr");
      });
    });

    // Step 3: Get IDs in numerical order as a fallback
    const orderedIds = Object.keys(groupedByDexId)
      .map(Number)
      .sort((a, b) => a - b);

    // Extract data from the evolution chains
    const { evolutionGroups, evolutionOrder } = evolutionData;

    // Track which species we've already handled
    const handledSpecies = new Set();

    // Create the reorganized Pokédex array
    const reorganizedPokedex = [];
    const processedEntries = new Set(); // Track which entries have been processed

    // Debug information
    console.log(
      `Total evolution groups: ${Object.keys(evolutionGroups).length}`
    );

    // Helper function to detect the form variant of a Pokémon
    const getFormVariant = (name) => {
      if (name.includes(" de Hisui")) return "Hisui";
      if (name.includes(" d'Alola")) return "Alola";
      if (name.includes(" de Galar")) return "Galar";
      if (name.includes(" de Paldea")) return "Paldea";
      if (name.includes("-Méga")) return "Mega";
      if (name.includes("-Gigamax")) return "Gigamax";
      // Add more form variants as needed
      return "Base"; // Default to base form
    };

    // Process each evolution chain
    console.log("Processing evolution chains to reorganize Pokédex...");
    for (const chainUrl in evolutionGroups) {
      // Get the ordered species IDs for this chain
      const orderedSpeciesIds =
        evolutionOrder[chainUrl] ||
        evolutionGroups[chainUrl].sort((a, b) => a - b);

      // Debug output for this chain
      console.log(
        `Evolution chain ${chainUrl} contains species IDs in order: ${orderedSpeciesIds.join(
          ", "
        )}`
      );

      // First, collect all entries across the evolution chain
      const chainEntries = [];
      for (const speciesId of orderedSpeciesIds) {
        if (groupedByDexId[speciesId]) {
          for (const entry of groupedByDexId[speciesId]) {
            if (!processedEntries.has(`${entry["pokedex-id"]}-${entry.name}`)) {
              chainEntries.push(entry);
            }
          }
        }
      }

      // Group entries by form variant
      const groupedByVariant = {};
      chainEntries.forEach((entry) => {
        const variant = getFormVariant(entry.name);
        if (!groupedByVariant[variant]) {
          groupedByVariant[variant] = [];
        }
        groupedByVariant[variant].push(entry);
      });

      // Process base form first
      if (groupedByVariant["Base"]) {
        for (const entry of groupedByVariant["Base"]) {
          console.log(
            `Adding base form: ${entry.name} (#${entry["pokedex-id"]})`
          );
          reorganizedPokedex.push(entry);
          processedEntries.add(`${entry["pokedex-id"]}-${entry.name}`);
          handledSpecies.add(entry["pokedex-id"]);
        }
      }

      // Then process each variant form group
      for (const variant in groupedByVariant) {
        if (variant === "Base") continue; // Already processed

        console.log(
          `Adding ${variant} form group with ${groupedByVariant[variant].length} entries`
        );

        // Sort entries within variant by evolution order
        groupedByVariant[variant].sort((a, b) => {
          const aIndex = orderedSpeciesIds.indexOf(a["pokedex-id"]);
          const bIndex = orderedSpeciesIds.indexOf(b["pokedex-id"]);
          return aIndex - bIndex;
        });

        // Add the sorted entries to the reorganized Pokédex
        for (const entry of groupedByVariant[variant]) {
          reorganizedPokedex.push(entry);
          processedEntries.add(`${entry["pokedex-id"]}-${entry.name}`);
          handledSpecies.add(entry["pokedex-id"]);
        }
      }
    }

    // Then add any remaining Pokémon that weren't in evolution chains
    console.log("Adding remaining Pokémon that weren't in evolution chains...");
    for (const id of orderedIds) {
      if (!handledSpecies.has(parseInt(id)) && groupedByDexId[id]) {
        console.log(
          `Adding remaining Pokémon with ID ${id} (not in any evolution chain)`
        );
        for (const entry of groupedByDexId[id]) {
          if (!processedEntries.has(`${entry["pokedex-id"]}-${entry.name}`)) {
            reorganizedPokedex.push(entry);
            processedEntries.add(`${entry["pokedex-id"]}-${entry.name}`);
          }
        }
      }
    }

    // Check for any entries that might have been missed
    const missingEntries = [];
    for (const entry of pokedexData) {
      if (!processedEntries.has(`${entry["pokedex-id"]}-${entry.name}`)) {
        missingEntries.push(entry);
      }
    }

    // Add any missing entries to the end
    if (missingEntries.length > 0) {
      console.log(
        `Adding ${missingEntries.length} missing entries that weren't processed`
      );
      reorganizedPokedex.push(...missingEntries);
    }

    // Debug output
    console.log(
      `Original pokedex length: ${pokedexData.length}, Reorganized length: ${reorganizedPokedex.length}`
    );

    if (reorganizedPokedex.length !== pokedexData.length) {
      console.warn(
        `WARNING: Length mismatch between original and reorganized pokedex!`
      );
      console.warn(
        `Original: ${pokedexData.length}, Reorganized: ${reorganizedPokedex.length}`
      );
    }

    // Save the reorganized Pokédex
    saveIncrementalData(reorganizedPokedex, "pokedex-reorganized.json");
    console.log("Reorganized Pokédex saved to pokedex-reorganized.json");

    return reorganizedPokedex;
  } catch (error) {
    console.error("Error reorganizing Pokédex:", error.message);
  }
};

// Run the reorganization process
reorganizePokedex();
