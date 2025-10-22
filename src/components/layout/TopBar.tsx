import React from 'react';
import { useData } from '../../contexts/DataContext';

export const TopBar: React.FC = () => {
  const { settings } = useData();

  return (
    <header className="bg-white dark:bg-slate-800 shadow-md p-2 z-30 flex items-center h-14">
      <div className="container mx-auto flex justify-center items-center">
        {settings.logo && (
          <img src={settings.logo} alt="Logo" className="h-10 w-auto" />
        )}
      </div>
    </header>
  );
};