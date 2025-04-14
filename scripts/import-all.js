/**
 * Pokemon TCG Placeholders - Run All Import Steps
 *
 * This convenience script runs all three import steps in sequence:
 * 1. Import base Pokédex
 * 2. Import evolution chains
 * 3. Reorganize Pokédex
 */

const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

/**
 * Runs all import steps in sequence
 */
const runAllSteps = async () => {
  try {
    console.log("===============================================");
    console.log("STEP 1: IMPORTING BASE POKÉDEX");
    console.log("===============================================");

    await execPromise("node import-base-pokedex.js");

    console.log("===============================================");
    console.log("STEP 2: IMPORTING EVOLUTION CHAINS");
    console.log("===============================================");

    await execPromise("node import-evolution-chains.js");

    console.log("===============================================");
    console.log("STEP 3: REORGANIZING POKÉDEX");
    console.log("===============================================");

    await execPromise("node reorganize-pokedex.js");

    console.log("===============================================");
    console.log("ALL STEPS COMPLETED SUCCESSFULLY");
    console.log("Final reorganized Pokédex is in pokedex-reorganized.json");
    console.log("===============================================");
  } catch (error) {
    console.error("Error during import process:", error.message);
    process.exit(1);
  }
};

// Run all steps
runAllSteps();
