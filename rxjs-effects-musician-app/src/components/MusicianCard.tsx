import React from 'react';
import { Musician } from '../musicians-app';
import '../styles/MusicianCard.css';

interface MusicianCardProps {
  musician: Musician;
}

const MusicianCard: React.FC<MusicianCardProps> = ({ musician }) => {
  return (
    <div className="musician-card">
      <div className="musician-image">
        <img
          src={musician.photoUrl}
          alt={musician.name}
          onError={(e) => {
            // Fallback for missing images
            const target = e.target as HTMLImageElement;
            target.src = `https://via.placeholder.com/300x200?text=${encodeURIComponent(musician.name)}`;
          }}
        />
      </div>
      <div className="musician-info">
        <h3 className="musician-name">{musician.name}</h3>
        <p className="musician-id">ID: {musician.id}</p>
      </div>
    </div>
  );
};

export default MusicianCard;