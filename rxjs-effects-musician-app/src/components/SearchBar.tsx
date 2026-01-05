import React, { useState, useEffect } from 'react';
import '../styles/SearchBar.css';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ query, onQueryChange }) => {
  const [localQuery, setLocalQuery] = useState(query);

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalQuery(newValue);
    onQueryChange(newValue);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search musicians..."
        value={localQuery}
        onChange={handleChange}
        className="search-input"
      />
      <div className="search-icon">🔍</div>
    </div>
  );
};

export default SearchBar;