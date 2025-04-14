/**
 * API Utilities for Pokemon TCG Placeholders
 *
 * This module contains utility functions for making API requests with retry logic
 * and handling delays between requests to avoid rate limiting.
 */

/**
 * Fetches data from a URL with retry logic
 *
 * @param {string} url - The URL to fetch data from
 * @param {number} retries - Number of retry attempts (default: 3)
 * @param {number} delay - Base delay between retries in milliseconds (default: 1000)
 * @returns {Promise<Response>} - The fetch response
 * @throws {Error} - If all retry attempts fail
 */
const fetchWithRetry = async (url, retries = 3, delay = 300) => {
  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, { timeout: 10000 }); // 10 second timeout
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response;
    } catch (error) {
      console.warn(
        `Attempt ${i + 1}/${retries} failed for ${url}: ${error.message}`
      );
      lastError = error;

      if (i < retries - 1) {
        console.log(`Waiting ${delay}ms before retry...`);
        await delay(delay);
      }
    }
  }

  throw new Error(`Failed after ${retries} attempts: ${lastError.message}`);
};

/**
 * Delays execution for a specified time
 *
 * @param {number} ms - Time to delay in milliseconds
 * @returns {Promise<void>} - A promise that resolves after the delay
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export { fetchWithRetry, delay };
