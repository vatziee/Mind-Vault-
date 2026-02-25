import React from 'react';
import DriveList from './DriveList';
import { View } from '../App';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

export default function Sidebar({ currentView, setCurrentView }: SidebarProps) {
  const navLinkClasses = (view: View) => {
    return `px-3 py-2 rounded-md text-sm font-medium ${
      currentView === view
        ? 'bg-zinc-800 text-white'
        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
    }`;
  };

  return (
    <div className="w-64 bg-zinc-900/50 border-r border-zinc-800 p-4 flex flex-col">
      <h1 className="text-2xl font-bold text-zinc-200 mb-6">VaultMind</h1>
      <nav className="flex flex-col space-y-2">
        <a href="#" onClick={() => setCurrentView('dashboard')} className={navLinkClasses('dashboard')}>
          Dashboard
        </a>
        <a href="#" onClick={() => setCurrentView('duplicates')} className={navLinkClasses('duplicates')}>
          Duplicates
        </a>
      </nav>
      <div className="mt-auto">
        <DriveList />
      </div>
    </div>
  );
}
