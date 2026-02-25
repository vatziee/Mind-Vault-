import React, { useState } from 'react';
import SearchBar from './SearchBar';

interface MainContentProps {
    activeView: string;
}

export default function MainContent({ activeView }: MainContentProps) {
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const renderContent = () => {
    if (searchResults.length > 0) {
        return (
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
          )
    }

    switch (activeView) {
        case 'dashboard':
            return (
                <div>
                    <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-zinc-800/50 p-6 rounded-lg">
                            <h3 className="font-semibold text-lg mb-2">Indexed Files</h3>
                            <p className="text-3xl font-bold">-</p> 
                        </div>
                        <div className="bg-zinc-800/50 p-6 rounded-lg">
                            <h3 className="font-semibold text-lg mb-2">Total Storage</h3>
                            <p className="text-3xl font-bold">-</p>
                        </div>
                        <div className="bg-zinc-800/50 p-6 rounded-lg">
                            <h3 className="font-semibold text-lg mb-2">Duplicate Space</h3>
                            <p className="text-3xl font-bold">-</p>
                        </div>
                    </div>
                </div>
            );
        case 'duplicates':
            // This view is handled by DuplicatesView.tsx, so this is just a fallback.
            return <div>Duplicates Content</div>;
        default:
            return <div>Dashboard Content</div>;
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <SearchBar onSearch={setSearchResults} />
      <div className="p-6 flex-1">
        {renderContent()}
      </div>
    </div>
  );
}
