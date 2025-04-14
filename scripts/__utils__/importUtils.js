/**
 * Import Utilities for Pokemon TCG Placeholders
 *
 * This module contains the main functionality for importing Pokémon data from the PokeAPI,
 * including fetching species data, processing forms, and organizing the data.
 */

const { fetchWithRetry, delay } = require("./apiUtils");
const { loadExistingData, saveIncrementalData } = require("./fileUtils");
const { organizeByEvolutionLines } = require("./evolutionUtils");

/**
 * Imports the full Pokédex data from the PokeAPI
 *
 * @returns {Promise<Array>} - The complete Pokédex data
 */
const importFullPokedex = async () => {
  try {
    // Check for existing data first
    let pokedex = loadExistingData();
    const processedSpeciesIds = new Set(pokedex.map((p) => p["pokedex-id"]));

    // Step 1: Get a list of all Pokémon species
    console.log("Fetching species list...");
    const speciesResponse = await fetchWithRetry(
      "https://pokeapi.co/api/v2/pokemon-species?limit=1025"
    );
    const speciesData = await speciesResponse.json();

    console.log(
      `Found ${speciesData.results.length} Pokémon species, fetching details...`
    );
    console.log(`Already processed: ${processedSpeciesIds.size} species`);

    // Process in batches to avoid overloading the API
    const batchSize = 3; // Even smaller batch size for reliability
    let successCount = 0;
    let failureCount = 0;

    // Continue from where we left off
    const remainingSpecies = speciesData.results.filter((species) => {
      const idMatch = species.url.match(/\/pokemon-species\/(\d+)/);
      return idMatch && !processedSpeciesIds.has(parseInt(idMatch[1]));
    });

    console.log(`Remaining species to process: ${remainingSpecies.length}`);

    for (let i = 0; i < remainingSpecies.length; i += batchSize) {
      const batch = remainingSpecies.slice(i, i + batchSize);
      console.log(
        `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          remainingSpecies.length / batchSize
        )}...`
      );

      try {
        // Use Promise.all to fetch all species in the batch concurrently
        const batchResults = await Promise.all(
          batch.map(async (species) => {
            try {
              console.log(`Processing ${species.name}...`);
              // Get species details to access French name and Pokedex number
              const speciesDetails = await fetchWithRetry(species.url);
              const speciesJson = await speciesDetails.json();

              // Find the French name
              const frenchName =
                speciesJson.names.find((name) => name.language.name === "fr")
                  ?.name || speciesJson.name;

              // Get the national pokedex number
              const pokedexNumber = speciesJson.id;

              // Skip if we've already processed this species
              if (processedSpeciesIds.has(pokedexNumber)) {
                console.log(
                  `Skipping already processed: ${species.name} (#${pokedexNumber})`
                );
                return [];
              }

              // Mark as processed
              processedSpeciesIds.add(pokedexNumber);

              // Prepare the base Pokémon entry
              const baseEntry = {
                name: frenchName,
                "pokedex-id": pokedexNumber,
              };

              // Get forms data - we need to add some separation between requests
              await delay(500);

              // Process varieties one by one instead of all at once
              const formEntries = [];
              for (const variety of speciesJson.varieties.filter(
                (v) => !v.is_default
              )) {
                try {
                  // Step 1: Fetch the Pokemon form data
                  const formResponse = await fetchWithRetry(
                    variety.pokemon.url
                  );
                  const formData = await formResponse.json();

                  // Get the base form name
                  const basePokemonName = speciesJson.name;
                  let formName = formData.name;

                  // Step 2: If there's form data URL available, fetch the localized form names
                  let frenchFormName = null;
                  if (
                    formData.forms &&
                    formData.forms.length > 0 &&
                    formData.forms[0].url
                  ) {
                    try {
                      // Add a small delay before fetching the form details
                      await delay(300);

                      console.log(`Fetching form details for ${formName}...`);
                      const formDetailsResponse = await fetchWithRetry(
                        formData.forms[0].url
                      );
                      const formDetails = await formDetailsResponse.json();

                      // Look for French form name in the form details
                      if (formDetails.names && formDetails.names.length > 0) {
                        const frenchName = formDetails.names.find(
                          (name) => name.language.name === "fr"
                        );
                        if (frenchName && frenchName.name) {
                          frenchFormName = frenchName.name;
                          console.log(
                            `Found French form name: ${frenchFormName} for ${formName}`
                          );
                        }
                      }

                      // If we found a French name, use it directly
                      if (frenchFormName) {
                        formName = frenchFormName;
                      } else {
                        // Otherwise, follow our previous logic for form naming
                        if (formName.startsWith(basePokemonName)) {
                          const formSuffix = formName.substring(
                            basePokemonName.length
                          );
                          formName = frenchName + formSuffix;
                        } else {
                          // For special cases like Gigantamax where the form name doesn't include base name
                          if (formName.includes("-mega")) {
                            formName = `${frenchName}-Méga`;
                            // Handle Mega X and Y
                            if (formName.includes("-mega-x")) {
                              formName = `${frenchName}-Méga-X`;
                            } else if (formName.includes("-mega-y")) {
                              formName = `${frenchName}-Méga-Y`;
                            }
                          } else if (formName.includes("-gmax")) {
                            formName = `${frenchName}-Gigamax`;
                          } else if (formName.includes("-alola")) {
                            formName = `${frenchName} d'Alola`;
                          } else if (formName.includes("-galar")) {
                            formName = `${frenchName} de Galar`;
                          } else if (formName.includes("-hisui")) {
                            formName = `${frenchName} de Hisui`;
                          } else if (formName.includes("-paldea")) {
                            formName = `${frenchName} de Paldea`;
                          } else {
                            // For other forms, just append the form name
                            const formSuffix = formName.includes("-")
                              ? formName.substring(formName.indexOf("-"))
                              : "";
                            formName = `${frenchName}${formSuffix}`;
                          }
                        }
                      }
                    } catch (formDetailsError) {
                      console.error(
                        `Error fetching form details for ${formName}:`,
                        formDetailsError.message
                      );
                      // Fall back to our existing form naming logic if the form details fetch fails
                    }
                  } else {
                    // If no form data URL, fall back to our existing form naming logic
                    if (formName.startsWith(basePokemonName)) {
                      const formSuffix = formName.substring(
                        basePokemonName.length
                      );
                      formName = frenchName + formSuffix;
                    } else {
                      // For special cases like Gigantamax where the form name doesn't include base name
                      if (formName.includes("-mega")) {
                        formName = `${frenchName}-Méga`;
                        // Handle Mega X and Y
                        if (formName.includes("-mega-x")) {
                          formName = `${frenchName}-Méga-X`;
                        } else if (formName.includes("-mega-y")) {
                          formName = `${frenchName}-Méga-Y`;
                        }
                      } else if (formName.includes("-gmax")) {
                        formName = `${frenchName}-Gigamax`;
                      } else if (formName.includes("-alola")) {
                        formName = `${frenchName} d'Alola`;
                      } else if (formName.includes("-galar")) {
                        formName = `${frenchName} de Galar`;
                      } else if (formName.includes("-hisui")) {
                        formName = `${frenchName} de Hisui`;
                      } else if (formName.includes("-paldea")) {
                        formName = `${frenchName} de Paldea`;
                      } else {
                        // For other forms, just append the form name
                        const formSuffix = formName.includes("-")
                          ? formName.substring(formName.indexOf("-"))
                          : "";
                        formName = `${frenchName}${formSuffix}`;
                      }
                    }
                  }

                  formEntries.push({
                    name: formName,
                    "pokedex-id": pokedexNumber,
                  });

                  // Add a small delay between form fetches
                  await delay(300);
                } catch (error) {
                  console.error(
                    `Error fetching form for ${species.name}:`,
                    error.message
                  );
                }
              }

              successCount++;
              return [baseEntry, ...formEntries];
            } catch (error) {
              failureCount++;
              console.error(`Error processing ${species.name}:`, error.message);
              return [];
            }
          })
        );

        // Flatten the batch results and add to pokedex
        const newEntries = batchResults.flat().filter((entry) => entry);
        pokedex.push(...newEntries);
        console.log(`Added ${newEntries.length} new entries to pokedex`);

        // Save data after each batch
        if (newEntries.length > 0) {
          saveIncrementalData(pokedex);
        }
      } catch (batchError) {
        console.error(`Error processing batch:`, batchError.message);
      }

      // Progress update
      console.log(
        `Progress: ${i + Math.min(batchSize, remainingSpecies.length - i)}/${
          remainingSpecies.length
        } species (${successCount} successful, ${failureCount} failed)`
      );

      // Add a larger delay between batches to prevent rate limiting
      if (i + batchSize < remainingSpecies.length) {
        const waitTime = 2000; // 2 seconds
        console.log(`Waiting ${waitTime / 1000} seconds before next batch...`);
        await delay(waitTime);
      }
    }

    console.log(`Import completed! Total Pokémon and forms: ${pokedex.length}`);
    console.log(
      `Successful species: ${successCount}, Failed species: ${failureCount}`
    );

    // Reorganize the pokedex to group by evolution lines
    console.log(`Reorganizing pokedex to group evolution lines together...`);
    pokedex = await organizeByEvolutionLines(pokedex);
    console.log(
      `Reorganized pokedex to group evolution lines. Final count: ${pokedex.length}`
    );

    // Final save
    saveIncrementalData(pokedex);

    return pokedex;
  } catch (error) {
    console.error("Error importing Pokédex:", error);
  }
};

module.exports = {
  importFullPokedex,
};
