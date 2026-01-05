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

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (localQuery !== query) {
        onQueryChange(localQuery);
      }
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [localQuery, onQueryChange, query]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(e.target.value);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search musicians..."
        value={localQuery}
        onChange={handleChange}
        className="search-input"
        aria-label="Search musicians"
      />
      <div className="search-icon">🔍</div>
    </div>
  );
};

export default SearchBar;
