import React from 'react';
import { Musician } from '../musicians-app';
import '../styles/MusiciansList.css';

interface MusiciansListProps {
  musicians: Musician[];
  isLoading: boolean;
  selectedMusicianId: string | null;
  onSelectMusician: (musicianId: string) => void;
}

const MusiciansList: React.FC<MusiciansListProps> = ({
  musicians,
  isLoading,
  selectedMusicianId,
  onSelectMusician,
}) => {
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading musicians...</p>
      </div>
    );
  }

  if (musicians.length === 0) {
    return (
      <div className="empty-state">
        <p>No musicians found. Try adjusting your search.</p>
      </div>
    );
  }

  return (
    <div className="musicians-list">
      <ul className="musicians-list-items">
        {musicians.map((musician) => {
          const isSelected = musician.id === selectedMusicianId;
          return (
            <li key={musician.id} className="musicians-list-item">
              <button
                type="button"
                className={`musicians-list-button${isSelected ? ' is-selected' : ''}`}
                onClick={() => onSelectMusician(musician.id)}
                aria-pressed={isSelected}
              >
                <span className="musician-list-name">{musician.name}</span>
                <span className="musician-list-id">ID: {musician.id}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default MusiciansList;
