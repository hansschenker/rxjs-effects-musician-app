import React, { useEffect, useState } from 'react';
import { Musician, musiciansApp } from './musicians-app';
import MusiciansPage from './components/MusiciansPage';
import './App.css';

function App() {
  const [musicians, setMusicians] = useState<Musician[]>([]);
  const [filteredMusicians, setFilteredMusicians] = useState<Musician[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedMusicianId, setSelectedMusicianId] = useState<string | null>(
    null
  );

  useEffect(() => {
    // Initialize the effects system
    musiciansApp.initializeEffects();
    
    // Initialize the musicians app
    musiciansApp.dispatch.pageOpened();

    // Subscribe to state changes
    const subscriptions = [
      musiciansApp.subscribe.toMusicians(setMusicians),
      musiciansApp.subscribe.toFilteredMusicians(setFilteredMusicians),
      musiciansApp.subscribe.toIsLoading(setIsLoading),
      musiciansApp.subscribe.toQuery(setQuery),
      musiciansApp.subscribe.toError(setError),
    ];

    // Cleanup subscriptions on unmount
    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
      musiciansApp.cleanup();
    };
  }, []);

  useEffect(() => {
    if (musicians.length === 0) {
      setSelectedMusicianId(null);
      return;
    }

    const hasSelection = musicians.some(
      (musician) => musician.id === selectedMusicianId
    );

    if (!hasSelection) {
      setSelectedMusicianId(musicians[0].id);
    }
  }, [musicians, selectedMusicianId]);

  const handleQueryChange = (newQuery: string) => {
    musiciansApp.dispatch.queryChanged(newQuery);
  };

  const selectedMusician =
    musicians.find((musician) => musician.id === selectedMusicianId) ?? null;

  return (
    <div className="App">
      <MusiciansPage
        musicians={filteredMusicians}
        isLoading={isLoading}
        error={error}
        query={query}
        onQueryChange={handleQueryChange}
        selectedMusician={selectedMusician}
        selectedMusicianId={selectedMusicianId}
        onSelectMusician={setSelectedMusicianId}
      />
    </div>
  );
}

export default App;
