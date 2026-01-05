# Musicians App - Vite TypeScript

A React application that displays musicians using RxJS Effects for state management.

## Features

- 🎸 Display list of musicians with search functionality
- ⚡ Built with Vite and TypeScript
- 🔄 RxJS Effects for state management
- 🎨 Responsive design with loading states

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:5173`

## Project Structure

- `src/musicians-app.ts` - Core RxJS effects logic
- `src/core/` - Framework-agnostic effects system
- `src/components/` - React components
- `src/styles/` - Component styles

## Components

- **MusiciansPage** - Main page component
- **MusiciansList** - Grid of musician cards
- **MusicianCard** - Individual musician display
- **SearchBar** - Search input component

## State Management

The app uses a custom RxJS-based effects system that provides:
- Action dispatching
- Effect handling
- State management with BehaviorSubject
- Reactive subscriptions

## Mock Data

The app includes mock data for famous guitarists. Images are served as placeholders when the actual images are not available.