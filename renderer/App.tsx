import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import DuplicatesView from './components/DuplicatesView';

export type View = 'dashboard' | 'duplicates';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'duplicates':
        return <DuplicatesView />;
      case 'dashboard':
      default:
        return <MainContent />;
    }
  };

  return (
    <div className="dark h-screen flex bg-background text-foreground">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      {renderView()}
    </div>
  );
}
