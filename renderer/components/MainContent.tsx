import React, { useState } from 'react';
import SearchBar from './SearchBar';

export default function MainContent() {
  const [searchResults, setSearchResults] = useState<any[]>([]);

  return (
    <div className="flex-1 flex flex-col">
      <SearchBar onSearch={setSearchResults} />
      <div className="p-6 flex-1">
        {searchResults.length > 0 ? (
          <div>
            <h2 className="text-xl text-zinc-300 mb-4">Search Results</h2>
            <ul className="bg-zinc-900/50 p-4 rounded-md">
              {searchResults.map((file) => (
                <li key={file.id} className="text-sm text-zinc-300 mb-2 pb-2 border-b border-zinc-800">
                  {file.full_path}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <h2 className="text-xl text-zinc-300">Dashboard</h2>
        )}
      </div>
    </div>
  );
}
