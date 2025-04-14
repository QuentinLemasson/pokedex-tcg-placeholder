# Pokémon TCG Placeholder Cards Generator

A web application that generates placeholder cards for the Pokémon Trading Card Game.

## Features

- Displays Pokémon cards from a local JSON database
- Shows cards in a 3x3 grid layout
- Pagination to navigate through all Pokémon
- Export to PDF functionality for printing cards

## Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

### Running the application

1. Start the development server:
   ```
   npm run dev
   ```
   or
   ```
   yarn dev
   ```
2. Open your browser and navigate to `http://localhost:5173`

### Building for production

1. Build the application:
   ```
   npm run build
   ```
   or
   ```
   yarn build
   ```
2. Preview the production build:
   ```
   npm run preview
   ```
   or
   ```
   yarn preview
   ```

## Data Source

The application uses a local JSON file (`pokedex-cleaned.json`) containing Pokémon data with the following structure:

```json
{
  "name": "Bulbizarre",
  "pokedex-id": 1,
  "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
  "type": "grass/poison"
}
```

## Exporting Cards to PDF

To export the current page of cards to PDF:

1. Click the "Export to PDF" button
2. The browser's print dialog will open
3. Select "Save as PDF" from the print options
4. Choose a destination and click "Save"

## Technologies Used

- React
- TypeScript
- Vite
- CSS
