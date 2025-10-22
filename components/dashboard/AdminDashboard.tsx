
import React from 'react';
import { useData } from '../../contexts/DataContext';
import { Users, Calendar, FileText, ImageIcon } from 'lucide-react';

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: number | string; color: string }> = ({ icon, title, value, color }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex items-center space-x-4">
    <div className={`p-3 rounded-full ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
    </div>
  </div>
);

export const AdminDashboard: React.FC = () => {
  const { users, events, articles, banners } = useData();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Dashboard Amministratore</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Users className="w-6 h-6 text-white"/>}
          title="Totale Utenti"
          value={users.length}
          color="bg-blue-500"
        />
        <StatCard 
          icon={<Calendar className="w-6 h-6 text-white"/>}
          title="Eventi Pubblicati"
          value={events.length}
          color="bg-green-500"
        />
        <StatCard 
          icon={<FileText className="w-6 h-6 text-white"/>}
          title="Articoli Pubblicati"
          value={articles.length}
          color="bg-yellow-500"
        />
        <StatCard 
          icon={<ImageIcon className="w-6 h-6 text-white"/>}
          title="Banner Attivi"
          value={banners.length}
          color="bg-purple-500"
        />
      </div>
      <div className="mt-8 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Attività Recenti</h2>
        <ul className="space-y-4">
            {events.slice(0, 2).map(event => (
                <li key={event.id} className="p-3 rounded-md bg-slate-50 dark:bg-slate-700">
                    <p className="font-semibold text-slate-700 dark:text-slate-200">Nuovo Evento: {event.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(event.date).toLocaleDateString('it-IT')}</p>
                </li>
            ))}
            {articles.slice(0, 2).map(article => (
                <li key={article.id} className="p-3 rounded-md bg-slate-50 dark:bg-slate-700">
                    <p className="font-semibold text-slate-700 dark:text-slate-200">Nuovo Articolo: {article.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(article.createdAt).toLocaleDateString('it-IT')}</p>
                </li>
            ))}
        </ul>
      </div>
    </div>
  );
};
