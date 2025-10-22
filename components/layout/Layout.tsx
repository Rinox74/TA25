import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MainContent } from '../views/MainContent';
import { BottomNavBar } from './BottomNavBar';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState({ view: 'dashboard', data: null });

  const setView = (view: string, data: any = null) => {
    setCurrentView({ view, data });
  };
  
  return (
    <div className="flex h-full bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <Sidebar setView={setView} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setSidebarOpen={setSidebarOpen} setView={setView} />
        <MainContent currentView={currentView} setView={setView} />
      </div>
      <BottomNavBar currentView={currentView} setView={setView} />
    </div>
  );
};
