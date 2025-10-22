
import React from 'react';
import { useData } from '../../contexts/DataContext';
import { Button } from '../ui/Button';

interface WelcomeScreenProps {
  onClose: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onClose }) => {
  const { settings } = useData();

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-95 z-[100] flex flex-col items-center justify-center p-4">
      <div className="text-center animate-fade-in-down">
        {settings.logo && (
          <img 
            src={settings.logo} 
            alt="Logo App" 
            className="max-w-[250px] sm:max-w-[350px] h-auto mx-auto mb-8"
          />
        )}
        <p className="text-xl sm:text-2xl text-white font-light max-w-2xl mx-auto leading-relaxed">
          {settings.welcomeText || 'lo sporto la nostra missione'}
        </p>
        <Button 
          onClick={onClose}
          size="lg"
          className="mt-12 animate-pulse"
        >
          Entra nel nostro mondo
        </Button>
      </div>
    </div>
  );
};
