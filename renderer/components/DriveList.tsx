import React, { useEffect, useState } from 'react';
import { getDrives, scanDrive, onScanProgress, onScanDone } from '../utils/api';

interface Drive {
    mountpoints: { path: string }[];
    description: string;
}

export default function DriveList() {
  const [drives, setDrives] = useState<Drive[]>([]);
  const [scanStatus, setScanStatus] = useState<Record<string, { scanning: boolean; count: number }>>({});

  useEffect(() => {
    getDrives().then(setDrives);

    const removeProgressListener = onScanProgress((_event, progress) => {
      if (progress.type === 'progress') {
        setScanStatus((prev) => ({
          ...prev,
          [progress.drivePath]: {
            scanning: true,
            count: (prev[progress.drivePath]?.count || 0) + progress.count,
          },
        }));
      }
    });

    const removeDoneListener = onScanDone((_event, result) => {
      setScanStatus((prev) => ({
        ...prev,
        [result.drivePath]: { ...prev[result.drivePath], scanning: false },
      }));
      alert(`Finished scanning ${result.drivePath}`);
    });

    return () => {
      removeProgressListener();
      removeDoneListener();
    };
  }, []);

  const handleScan = (drivePath: string) => {
    setScanStatus((prev) => ({ ...prev, [drivePath]: { scanning: true, count: 0 } }));
    scanDrive(drivePath);
  };

  return (
    <div>
      <h2 className="text-xs font-semibold text-zinc-400 uppercase mb-2">Drives</h2>
      <ul>
        {drives.map((drive) => {
          const drivePath = drive.mountpoints[0]?.path;
          if (!drivePath) return null;

          const status = scanStatus[drivePath];
          const isScanning = status?.scanning;

          return (
            <li key={drivePath} className="mb-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">{drive.description}</span>
                <button
                  onClick={() => handleScan(drivePath)}
                  disabled={isScanning}
                  className={`text-xs px-2 py-1 rounded ${isScanning ? 'bg-zinc-600 text-zinc-400' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
                  {isScanning ? `Scanning... (${status.count})` : 'Scan'}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
