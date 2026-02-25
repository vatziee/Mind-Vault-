import React, { useState } from 'react';
import DriveList from './components/DriveList';
import DuplicatesView from './components/DuplicatesView';
import MainContent from './components/MainContent';

function App() {
  const [activeView, setActiveView] = useState('dashboard');

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <MainContent activeView={activeView} />;
      case 'duplicates':
        return <DuplicatesView />;
      default:
        return <MainContent activeView="dashboard" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-900 text-zinc-100 font-sans">
      <header className="p-4 border-b border-zinc-800">
        <h1 className="text-xl font-semibold">VaultMind</h1>
      </header>
      <div className="flex flex-1">
        <aside className="w-72 p-4 border-r border-zinc-800 flex flex-col">
          <nav className="flex-1">
            <ul>
              <li className="mb-2">
                <button onClick={() => setActiveView('dashboard')} className={`w-full text-left px-4 py-2 rounded-md ${activeView === 'dashboard' ? 'bg-zinc-800' : 'hover:bg-zinc-800'}`}>Dashboard</button>
              </li>
              <li className="mb-2">
                <button onClick={() => setActiveView('duplicates')} className={`w-full text-left px-4 py-2 rounded-md ${activeView === 'duplicates' ? 'bg-zinc-800' : 'hover:bg-zinc-800'}`}>Duplicates</button>
              </li>
            </ul>
          </nav>
          <DriveList />
        </aside>
        <main className="flex-1 flex flex-col">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}

export default App;

