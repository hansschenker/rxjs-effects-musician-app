import React from 'react';
import { Musician } from '../musicians-app';
import MusicianCard from './MusicianCard';
import '../styles/MusiciansList.css';

interface MusiciansListProps {
  musicians: Musician[];
  isLoading: boolean;
}

const MusiciansList: React.FC<MusiciansListProps> = ({ musicians, isLoading }) => {
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
      <div className="musicians-grid">
        {musicians.map((musician) => (
          <MusicianCard key={musician.id} musician={musician} />
        ))}
      </div>
    </div>
  );
};

export default MusiciansList;