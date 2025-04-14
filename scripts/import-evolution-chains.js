/**
 * Pokemon TCG Placeholders - Import Evolution Chains
 *
 * This script imports all Pokémon evolution chains from the PokeAPI
 * and saves them to evolution-chains.json file.
 */

const { fetchWithRetry, delay } = require("../utils/apiUtils");
const { saveIncrementalData } = require("../utils/fileUtils");
const fs = require("fs");

/**
 * Imports all evolution chains from the PokeAPI
 *
 * @returns {Promise<Object>} - The evolution chains data
 */
const importEvolutionChains = async () => {
  try {
    // Initialize evolution data structure
    const evolutionData = {
      evolutionGroups: {},
      evolutionOrder: {},
      timestamp: new Date().toISOString(),
    };

    // Check if we already have evolution chain data
    let existingData = {};
    const evolutionFile = "evolution-chains.json";
    if (fs.existsSync(evolutionFile)) {
      try {
        existingData = JSON.parse(fs.readFileSync(evolutionFile, "utf8"));
        console.log(
          `Found existing evolution data with ${
            Object.keys(existingData.evolutionGroups || {}).length
          } chains`
        );

        // Use existing data as a starting point
        if (existingData.evolutionGroups && existingData.evolutionOrder) {
          evolutionData.evolutionGroups = existingData.evolutionGroups;
          evolutionData.evolutionOrder = existingData.evolutionOrder;
        }
      } catch (err) {
        console.error(`Error loading existing evolution data: ${err.message}`);
      }
    }

    // Get all evolution chains
    console.log("Fetching evolution chains...");
    const chainsResponse = await fetchWithRetry(
      "https://pokeapi.co/api/v2/evolution-chain?limit=541"
    );
    const chainsData = await chainsResponse.json();

    // Process evolution chains in batches
    const chainBatchSize = 5; // smaller batch size for stability
    let processedChains = 0;

    // Get list of chain URLs that we've already processed
    const processedUrls = new Set(Object.keys(evolutionData.evolutionGroups));
    const remainingChains = chainsData.results.filter(
      (chain) => !processedUrls.has(chain.url)
    );

    console.log(
      `Total chains: ${chainsData.results.length}, Already processed: ${processedUrls.size}, Remaining: ${remainingChains.length}`
    );

    for (let i = 0; i < remainingChains.length; i += chainBatchSize) {
      const batch = remainingChains.slice(i, i + chainBatchSize);
      console.log(
        `Processing evolution chains batch ${
          Math.floor(i / chainBatchSize) + 1
        }/${Math.ceil(remainingChains.length / chainBatchSize)}...`
      );

      // Process each chain one by one rather than using Promise.all
      for (const chain of batch) {
        try {
          console.log(`Processing chain: ${chain.url}`);

          // Skip if we've already processed this chain
          if (processedUrls.has(chain.url)) {
            console.log(`Chain ${chain.url} already processed, skipping...`);
            continue;
          }

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
            const baseSpeciesId = extractSpeciesId(chainData.chain.species.url);
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

          // Store species IDs for this chain
          evolutionData.evolutionGroups[chain.url] = [];

          // For each species in the chain, extract its ID
          for (const speciesUrl of chainSpecies) {
            const idMatch = speciesUrl.match(/\/pokemon-species\/(\d+)/);
            if (idMatch && idMatch[1]) {
              const speciesId = parseInt(idMatch[1]);
              evolutionData.evolutionGroups[chain.url].push(speciesId);
            }
          }

          // Store the ordered species IDs for this chain
          evolutionData.evolutionOrder[chain.url] = orderedSpeciesIds;

          processedChains++;

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
        `Completed ${Math.min(i + chainBatchSize, remainingChains.length)}/${
          remainingChains.length
        } evolution chains...`
      );

      // Save after each batch
      saveIncrementalData(evolutionData, evolutionFile);

      // Add a delay between batches
      if (i + chainBatchSize < remainingChains.length) {
        console.log(`Waiting 500ms before next batch...`);
        await delay(500);
      }
    }

    console.log(
      `Successfully processed ${processedChains} new evolution chains`
    );
    console.log(
      `Total evolution chains: ${
        Object.keys(evolutionData.evolutionGroups).length
      }`
    );

    // Final save
    saveIncrementalData(evolutionData, evolutionFile);

    return evolutionData;
  } catch (error) {
    console.error("Error importing evolution chains:", error);
  }
};

// Run the import process
importEvolutionChains();
