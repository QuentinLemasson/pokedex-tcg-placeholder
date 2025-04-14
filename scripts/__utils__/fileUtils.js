/**
 * File System Utilities for Pokemon TCG Placeholders
 *
 * This module contains utility functions for file operations including
 * loading existing data, saving data incrementally, and creating backups.
 */

import fs from "fs";
import path from "path";

/**
 * Loads existing data from a JSON file if it exists
 *
 * @param {string} filename - The name of the file to load (default: "pokedex.json")
 * @param {string} directory - The directory to load from (optional)
 * @returns {Array} - The loaded data or an empty array if file doesn't exist
 */
const loadExistingData = (filename = "pokedex.json", directory = "") => {
  try {
    const filePath = directory ? path.join(directory, filename) : filename;

    if (fs.existsSync(filePath)) {
      console.log(`Found existing ${filePath}, loading data...`);
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
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
 * @param {string} directory - The directory to save to (optional)
 */
const saveIncrementalData = (
  data,
  filename = "pokedex.json",
  directory = ""
) => {
  try {
    // Determine the file path based on the directory
    const filePath = directory ? path.join(directory, filename) : filename;

    // Ensure the directory exists
    if (directory && !fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
      console.log(`Created ${directory} directory for saving data`);
    }

    // Create backups folder if it doesn't exist
    const backupsDir = "backups";
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir);
      console.log(`Created ${backupsDir} directory for backups`);
    }

    // Create a backup of the previous file if it exists
    if (fs.existsSync(filePath)) {
      const backupName = path.join(
        backupsDir,
        `${path.basename(
          filename,
          path.extname(filename)
        )}_backup_${Date.now()}${path.extname(filename)}`
      );
      fs.copyFileSync(filePath, backupName);
      console.log(`Created backup: ${backupName}`);
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    console.log(`Saved ${data.length} Pokémon to ${filePath}`);
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
        `${path.basename(
          filename,
          path.extname(filename)
        )}_emergency_${Date.now()}${path.extname(filename)}`
      );
      fs.writeFileSync(emergencyFile, JSON.stringify(data, null, 2), "utf8");
      console.log(`Emergency save to ${emergencyFile} successful`);
    } catch (err) {
      console.error(`Emergency save failed:`, err.message);
    }
  }
};

export { loadExistingData, saveIncrementalData };
