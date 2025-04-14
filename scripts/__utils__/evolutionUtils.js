/**
 * Evolution Chain Utilities for Pokemon TCG Placeholders
 *
 * This module contains utility functions for organizing Pokémon by their evolution chains,
 * ensuring that related Pokémon and their forms are grouped together correctly.
 */

const { fetchWithRetry, delay } = require("./apiUtils");

/**
 * Organizes Pokémon data by evolution lines, keeping all forms of a species together
 *
 * @param {Array} pokedexData - The Pokémon data to organize
 * @returns {Promise<Array>} - The reorganized Pokémon data
 */
const organizeByEvolutionLines = async (pokedexData) => {
  try {
    // Step 1: Group by Pokédex ID
    const groupedByDexId = {};
    pokedexData.forEach((entry) => {
      const id = entry["pokedex-id"];
      if (!groupedByDexId[id]) {
        groupedByDexId[id] = [];
      }
      groupedByDexId[id].push(entry);
    });

    // Step 2: Sort entries in each group - base form first, then regional forms, then special forms
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

    // Step 3: Sort by Pokédex ID and flatten back to an array
    const orderedIds = Object.keys(groupedByDexId)
      .map(Number)
      .sort((a, b) => a - b);

    // Step 4: Fetch evolution chains to group properly
    const evolutionGroups = {};
    const evolutionOrder = {}; // Store the actual evolution order for each chain
    const handledSpecies = new Set();

    // Get all evolution chains (we'll limit to a reasonable number to avoid overloading the API)
    console.log(
      "Fetching evolution chains to properly group evolution lines..."
    );
    try {
      const chainsResponse = await fetchWithRetry(
        "https://pokeapi.co/api/v2/evolution-chain?limit=541"
      );
      const chainsData = await chainsResponse.json();

      // Process evolution chains in batches
      const chainBatchSize = 5; // smaller batch size for stability

      for (let i = 0; i < chainsData.results.length; i += chainBatchSize) {
        const batch = chainsData.results.slice(i, i + chainBatchSize);
        console.log(
          `Processing evolution chains batch ${
            Math.floor(i / chainBatchSize) + 1
          }/${Math.ceil(chainsData.results.length / chainBatchSize)}...`
        );

        // Process each chain one by one rather than using Promise.all
        for (const chain of batch) {
          try {
            console.log(`Processing chain: ${chain.url}`);
            const chainResponse = await fetchWithRetry(chain.url);
            const chainData = await chainResponse.json();

            // Process the chain
            const chainSpecies = [];
            const orderedSpeciesIds = []; // Store species IDs in evolution order

            // Helper function to extract species ID from URL
            const extractSpeciesId = (url) => {
              const idMatch = url.match(/\/pokemon-species\/(\d+)/);
              return idMatch ? parseInt(idMatch[1]) : null;
            };

            // Add base species
            if (chainData.chain && chainData.chain.species) {
              const baseSpeciesId = extractSpeciesId(
                chainData.chain.species.url
              );
              if (baseSpeciesId) {
                chainSpecies.push(chainData.chain.species.url);
                orderedSpeciesIds.push(baseSpeciesId);
              }

              // Process first evolutions
              if (
                chainData.chain.evolves_to &&
                chainData.chain.evolves_to.length > 0
              ) {
                for (const firstEvo of chainData.chain.evolves_to) {
                  if (firstEvo.species) {
                    const firstEvoId = extractSpeciesId(firstEvo.species.url);
                    if (firstEvoId) {
                      chainSpecies.push(firstEvo.species.url);
                      orderedSpeciesIds.push(firstEvoId);
                    }

                    // Process second evolutions
                    if (firstEvo.evolves_to && firstEvo.evolves_to.length > 0) {
                      for (const secondEvo of firstEvo.evolves_to) {
                        if (secondEvo.species) {
                          const secondEvoId = extractSpeciesId(
                            secondEvo.species.url
                          );
                          if (secondEvoId) {
                            chainSpecies.push(secondEvo.species.url);
                            orderedSpeciesIds.push(secondEvoId);
                          }
                        }
                      }
                    }
                  }
                }
              }
            }

            // For each species in the chain, extract its ID
            for (const speciesUrl of chainSpecies) {
              const idMatch = speciesUrl.match(/\/pokemon-species\/(\d+)/);
              if (idMatch && idMatch[1]) {
                const speciesId = parseInt(idMatch[1]);

                // Add to the evolution group
                if (!evolutionGroups[chain.url]) {
                  evolutionGroups[chain.url] = [];
                }

                evolutionGroups[chain.url].push(speciesId);
                handledSpecies.add(speciesId);
              }
            }

            // Store the ordered species IDs for this chain
            evolutionOrder[chain.url] = orderedSpeciesIds;

            // Add a small delay between chains
            await delay(300);
          } catch (error) {
            console.error(
              `Error processing evolution chain ${chain.url}:`,
              error.message
            );
            // Continue with the next chain
          }
        }

        console.log(
          `Completed ${Math.min(
            i + chainBatchSize,
            chainsData.results.length
          )}/${chainsData.results.length} evolution chains...`
        );

        // Add a delay between batches
        if (i + chainBatchSize < chainsData.results.length) {
          console.log(`Waiting 2 seconds before next batch...`);
          await delay(2000);
        }
      }
    } catch (fetchError) {
      console.error("Error fetching evolution chains:", fetchError.message);
      // Continue with reorganization without evolution chain data
      console.log(
        "Continuing with basic reorganization without evolution chain data"
      );
    }

    // Step 5: Reorganize based on evolution groups
    const reorganizedPokedex = [];
    const processedEntries = new Set(); // Track which entries have been processed

    // Debug information
    console.log(
      `Total evolution groups: ${Object.keys(evolutionGroups).length}`
    );
    console.log(`Total species with evolution data: ${handledSpecies.size}`);

    // Process each evolution chain
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

      // Process each species in the evolution chain
      for (const speciesId of orderedSpeciesIds) {
        if (groupedByDexId[speciesId]) {
          // Add ALL forms of this species together (base form first, then variants)
          for (const entry of groupedByDexId[speciesId]) {
            if (!processedEntries.has(`${entry["pokedex-id"]}-${entry.name}`)) {
              console.log(
                `Adding ${entry.name} (#${entry["pokedex-id"]}) to reorganized pokedex`
              );
              reorganizedPokedex.push(entry);
              processedEntries.add(`${entry["pokedex-id"]}-${entry.name}`);
            }
          }
        }
      }
    }

    // Then add any remaining Pokémon that weren't in evolution chains
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

    return reorganizedPokedex;
  } catch (error) {
    console.error("Error organizing by evolution lines:", error);
    return pokedexData; // Return original data if reorganization fails
  }
};

module.exports = {
  organizeByEvolutionLines,
};
