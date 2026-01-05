import React, { useEffect, useState } from 'react';
import { Musician, musiciansApp } from './musicians-app';
import MusiciansPage from './components/MusiciansPage';
import './App.css';

function App() {
  const [musicians, setMusicians] = useState<Musician[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    // Initialize the effects system
    musiciansApp.initializeEffects();
    
    // Initialize the musicians app
    musiciansApp.dispatch.pageOpened();

    // Subscribe to state changes
    const subscriptions = [
      musiciansApp.subscribe.toFilteredMusicians(setMusicians),
      musiciansApp.subscribe.toIsLoading(setIsLoading),
      musiciansApp.subscribe.toQuery((newQuery) => {
        console.log('Query state updated to:', newQuery);
        setQuery(newQuery);
      }),
    ];

    // Cleanup subscriptions on unmount
    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
      musiciansApp.cleanup();
    };
  }, []);

  const handleQueryChange = (newQuery: string) => {
    console.log('Query change:', newQuery);
    musiciansApp.dispatch.queryChanged(newQuery);
  };

  return (
    <div className="App">
      <MusiciansPage
        musicians={musicians}
        isLoading={isLoading}
        query={query}
        onQueryChange={handleQueryChange}
      />
    </div>
  );
}

export default App;