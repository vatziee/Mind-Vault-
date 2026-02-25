import React, { useEffect, useState } from 'react';
import { findDuplicates, getDuplicates } from '../utils/api';

export default function DuplicatesView() {
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const findDuplicates = async () => {
    setIsLoading(true);
    await findDuplicates();
    // For now, we'll just refetch the list. A more robust solution
    // would listen for progress and completion events.
    const dupes = await getDuplicates();
    setDuplicates(dupes);
    setIsLoading(false);
  };

  useEffect(() => {
    getDuplicates().then(setDuplicates);
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl text-zinc-300">Duplicate Files</h2>
        <button
          onClick={findDuplicates}
          disabled={isLoading}
          className={`px-4 py-2 rounded ${isLoading ? 'bg-zinc-600 text-zinc-400' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
          {isLoading ? 'Finding...' : 'Find Duplicates'}
        </button>
      </div>
      <div className="bg-zinc-900/50 p-4 rounded-md">
        {duplicates.length === 0 ? (
          <p className="text-zinc-400">No duplicates found. Run a scan and then click "Find Duplicates".</p>
        ) : (
          <ul>
            {duplicates.map((group) => (
              <li key={group.sha256_hash} className="mb-4 pb-4 border-b border-zinc-800">
                <p className="text-sm text-zinc-400 mb-2">Hash: {group.sha256_hash}</p>
                <ul>
                  {(group.paths as string).split(',').map((filePath) => (
                    <li key={filePath} className="text-sm text-zinc-300">{filePath}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
