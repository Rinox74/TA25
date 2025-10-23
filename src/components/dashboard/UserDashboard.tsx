

import React from 'react';
import { useData } from '../../contexts/DataContext';
import { Event, Article } from '../../types';

const EventCard: React.FC<{ event: Event }> = ({ event }) => (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
        <img src={event.image} alt={event.title} className="w-full h-40 object-cover" />
        <div className="p-4">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">{event.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(event.date).toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 truncate">{event.description}</p>
        </div>
    </div>
);

const ArticleCard: React.FC<{ article: Article }> = ({ article }) => (
     <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
        <img src={article.image} alt={article.title} className="w-full h-40 object-cover" />
        <div className="p-4">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">{article.title}</h3>
             <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(article.createdAt).toLocaleDateString('it-IT')}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">{article.content}</p>
        </div>
    </div>
);


export const UserDashboard: React.FC<{setView: (view: string, data?: any) => void}> = ({ setView }) => {
  const { events, articles, banners, loading } = useData();

  if (loading) return <div>Caricamento...</div>;

  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).slice(0, 3);
  const recentArticles = articles.slice(0, 3);
  const mainBanner = banners[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Benvenuto in APP25</h1>
      
      {mainBanner && (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
            <a href={mainBanner.targetUrl} target="_blank" rel="noopener noreferrer">
                <img src={mainBanner.imageUrl} alt={mainBanner.clientName} className="w-full rounded-md" />
            </a>
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Prossimi Eventi</h2>
          <button onClick={() => setView('events')} className="text-primary-600 dark:text-primary-400 hover:underline">Vedi tutti</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map(event => (
              <div key={event.id} onClick={() => setView('event-detail', event)} className="cursor-pointer">
                <EventCard event={event} />
              </div>
            ))
          ) : (
            <p className="text-slate-500 dark:text-slate-400">Nessun evento in programma.</p>
          )}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Ultimi Articoli</h2>
          <button onClick={() => setView('articles')} className="text-primary-600 dark:text-primary-400 hover:underline">Vedi tutti</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentArticles.length > 0 ? (
            recentArticles.map(article => (
                <div key={article.id} onClick={() => setView('article-detail', article)} className="cursor-pointer">
                    <ArticleCard article={article} />
                </div>
            ))
          ) : (
            <p className="text-slate-500 dark:text-slate-400">Nessun articolo disponibile.</p>
          )}
        </div>
      </div>
    </div>
  );
};