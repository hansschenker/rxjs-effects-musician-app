import React from 'react';
import { Musician } from '../musicians-app';
import MusiciansList from './MusiciansList';
import SearchBar from './SearchBar';

interface MusiciansPageProps {
  musicians: Musician[];
  isLoading: boolean;
  query: string;
  onQueryChange: (query: string) => void;
}

const MusiciansPage: React.FC<MusiciansPageProps> = ({
  musicians,
  isLoading,
  query,
  onQueryChange,
}) => {
  return (
    <div className="musicians-page">
      <header className="page-header">
        <h1>🎸 Musicians App</h1>
        <p>Discover amazing musicians using RxJS Effects</p>
      </header>

      <SearchBar query={query} onQueryChange={onQueryChange} />

      <MusiciansList musicians={musicians} isLoading={isLoading} />
    </div>
  );
};

export default MusiciansPage;