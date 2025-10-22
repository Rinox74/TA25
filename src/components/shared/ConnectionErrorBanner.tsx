import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConnectionErrorBannerProps {
  message: string;
}

export const ConnectionErrorBanner: React.FC<ConnectionErrorBannerProps> = ({ message }) => {
  return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 fixed top-0 left-0 right-0 z-[1000] shadow-lg" role="alert">
      <div className="flex">
        <div className="py-1"><AlertTriangle className="h-6 w-6 text-red-500 mr-4"/></div>
        <div>
          <p className="font-bold">Connessione al Backend Fallita</p>
          <p className="text-sm">{message}</p>
          <div className="mt-2 text-xs bg-red-200 p-2 rounded">
              <p className="font-semibold">Soluzione Rapida (per Sviluppo):</p>
              <ol className="list-decimal list-inside">
                  <li>Apri un nuovo terminale.</li>
                  <li>Naviga nella cartella <strong>backend</strong> del progetto.</li>
                  <li>Esegui il comando: <code>npm start</code></li>
                  <li>Una volta che vedi "Server running on port 5000", ricarica questa pagina.</li>
              </ol>
          </div>
        </div>
      </div>
    </div>
  );
};