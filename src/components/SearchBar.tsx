import React, { useState } from 'react';
import { searchFiles } from '../utils/api';

interface SearchBarProps {
  onSearch: (results: any[]) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() === '') {
        onSearch([]);
        return;
    }
    const results = await searchFiles({ query });
    onSearch(results);
  };

  return (
    <div className="p-4 border-b border-zinc-800">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search across all indexed drives..."
          className="w-full bg-zinc-800/50 text-zinc-300 placeholder-zinc-500 rounded-md px-4 py-2 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
        />
      </form>
    </div>
  );
}
