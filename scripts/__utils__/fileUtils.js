/**
 * File System Utilities for Pokemon TCG Placeholders
 *
 * This module contains utility functions for file operations including
 * loading existing data, saving data incrementally, and creating backups.
 */

const fs = require("fs");
const path = require("path");

/**
 * Loads existing data from a JSON file if it exists
 *
 * @param {string} filename - The name of the file to load (default: "pokedex.json")
 * @returns {Array} - The loaded data or an empty array if file doesn't exist
 */
const loadExistingData = (filename = "pokedex.json") => {
  try {
    if (fs.existsSync(filename)) {
      console.log(`Found existing ${filename}, loading data...`);
      const data = JSON.parse(fs.readFileSync(filename, "utf8"));
      console.log(`Loaded ${data.length} existing Pokémon entries`);
      return data;
    }
  } catch (error) {
    console.error("Error loading existing data:", error.message);
  }
  return [];
};

/**
 * Saves data to a file with backup creation
 *
 * @param {Array|Object} data - The data to save
 * @param {string} filename - The name of the file to save to (default: "pokedex.json")
 */
const saveIncrementalData = (data, filename = "pokedex.json") => {
  try {
    // Create backups folder if it doesn't exist
    const backupsDir = "backups";
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir);
      console.log(`Created ${backupsDir} directory for backups`);
    }

    // Create a backup of the previous file if it exists
    if (fs.existsSync(filename)) {
      const backupName = path.join(
        backupsDir,
        `pokedex_backup_${Date.now()}.json`
      );
      fs.copyFileSync(filename, backupName);
      console.log(`Created backup: ${backupName}`);
    }

    fs.writeFileSync(filename, JSON.stringify(data, null, 2), "utf8");
    console.log(`Saved ${data.length} Pokémon to ${filename}`);
  } catch (error) {
    console.error(`Error saving data to ${filename}:`, error.message);

    // Emergency save to a different file in backups folder
    try {
      const backupsDir = "backups";
      if (!fs.existsSync(backupsDir)) {
        fs.mkdirSync(backupsDir);
      }
      const emergencyFile = path.join(
        backupsDir,
        `pokedex_emergency_${Date.now()}.json`
      );
      fs.writeFileSync(emergencyFile, JSON.stringify(data, null, 2), "utf8");
      console.log(`Emergency save to ${emergencyFile} successful`);
    } catch (err) {
      console.error(`Emergency save failed:`, err.message);
    }
  }
};

module.exports = {
  loadExistingData,
  saveIncrementalData,
};
