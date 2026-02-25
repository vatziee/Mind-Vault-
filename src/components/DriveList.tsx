import React, { useEffect, useState } from 'react';
import { getDrives, scanDrive, onScanProgress, onScanDone } from '../utils/api';

interface Drive {
    mountpoints: { path: string }[];
    description: string;
    isSystem: boolean;
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
                    [progress.drivePath]: { ...prev[progress.drivePath], count: progress.count },
                }));
            }
        });

        const removeDoneListener = onScanDone((_event, result) => {
            setScanStatus((prev) => ({
                ...prev,
                [result.drivePath]: { ...prev[result.drivePath], scanning: false },
            }));
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
        <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Available Drives</h3>
            <ul>
                {drives.filter(d => !d.isSystem).map((drive) => {
                    const drivePath = drive.mountpoints[0].path;
                    const status = scanStatus[drivePath] || { scanning: false, count: 0 };
                    return (
                        <li key={drivePath} className="mb-2 flex items-center justify-between">
                            <span>{drive.description} ({drivePath})</span>
                            <button
                                onClick={() => handleScan(drivePath)}
                                disabled={status.scanning}
                                className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 rounded-md disabled:bg-zinc-700 disabled:cursor-not-allowed"
                            >
                                {status.scanning ? `Scanning... (${status.count})` : 'Scan'}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
