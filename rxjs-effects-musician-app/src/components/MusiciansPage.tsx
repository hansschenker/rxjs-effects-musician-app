import React from 'react';
import { Musician } from '../musicians-app';
import MusicianCard from './MusicianCard';
import MusiciansList from './MusiciansList';
import SearchBar from './SearchBar';

interface MusiciansPageProps {
  musicians: Musician[];
  isLoading: boolean;
  query: string;
  onQueryChange: (query: string) => void;
  selectedMusicianId: string | null;
  onSelectMusician: (musicianId: string) => void;
}

const MusiciansPage: React.FC<MusiciansPageProps> = ({
  musicians,
  isLoading,
  query,
  onQueryChange,
  selectedMusicianId,
  onSelectMusician,
}) => {
  const selectedMusician = musicians.find(
    (musician) => musician.id === selectedMusicianId
  );

  return (
    <div className="musicians-page">
      <header className="page-header">
        <h1>🎸 Musicians App</h1>
        <p>Discover amazing musicians using RxJS Effects</p>
      </header>

      <SearchBar query={query} onQueryChange={onQueryChange} />

      <div className="musicians-content">
        <MusiciansList
          musicians={musicians}
          isLoading={isLoading}
          selectedMusicianId={selectedMusicianId}
          onSelectMusician={onSelectMusician}
        />
        <div className="musician-selection">
          {selectedMusician ? (
            <MusicianCard musician={selectedMusician} />
          ) : (
            <div className="empty-state">
              <p>Select a musician to see their profile.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MusiciansPage;
