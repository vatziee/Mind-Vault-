import React, { useEffect, useState } from 'react';
import { findDuplicates, getDuplicates } from '../utils/api';

export default function DuplicatesView() {
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFindDuplicates = async () => {
    setIsLoading(true);
    await findDuplicates();
    const dupes = await getDuplicates();
    setDuplicates(dupes);
    setIsLoading(false);
  };

  useEffect(() => {
    getDuplicates().then(setDuplicates);
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Duplicate Files</h2>
        <button
          onClick={handleFindDuplicates}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md disabled:bg-zinc-700 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Finding...' : 'Find Duplicates'}
        </button>
      </div>
      <div className="bg-zinc-800/50 p-4 rounded-md">
        {duplicates.length === 0 ? (
          <p className="text-zinc-400">No duplicates found yet. Click 'Find Duplicates' to start.</p>
        ) : (
          <ul>
            {duplicates.map((group, index) => (
              <li key={index} className="mb-4 pb-4 border-b border-zinc-700">
                <h3 className="font-semibold text-lg mb-2">Duplicate Set {index + 1} ({group.length} files)</h3>
                <ul>
                  {group.map((file: any) => (
                    <li key={file.id} className="text-sm text-zinc-300">{file.full_path}</li>
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
