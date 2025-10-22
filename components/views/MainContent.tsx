import React, { useState } from 'react';
import { Role, Ticket } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { AdminDashboard } from '../dashboard/AdminDashboard';
import { UserDashboard } from '../dashboard/UserDashboard';
import { ManagementView } from './ManagementView';
import { EventList } from './user/EventList';
import { ArticleList } from './user/ArticleList';
import { EventDetail } from './user/EventDetail';
import { ArticleDetail } from './user/ArticleDetail';
import { Chat } from '../shared/Chat';
import { Profile } from './user/Profile';
import { Settings } from './admin/Settings';
import { useData } from '../../contexts/DataContext';
import { QrCode, Ticket as TicketIcon, Calendar, MapPin, Euro } from 'lucide-react';
import { PaymentModal } from './user/PaymentModal';


const TicketCard: React.FC<{ticket: Ticket}> = ({ ticket }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg flex flex-col md:flex-row overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
            <div className="p-6 flex-grow">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-primary-500 dark:text-primary-400 font-semibold">BIGLIETTO EVENTO</p>
                        <h3 className="mt-1 text-2xl font-bold text-slate-800 dark:text-white">{ticket.eventName}</h3>
                    </div>
                    <TicketIcon className="w-8 h-8 text-primary-500 dark:text-primary-400" />
                </div>
                <div className="mt-4 space-y-3 text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(ticket.eventDate).toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <Euro className="w-4 h-4" />
                        <span>Prezzo: {ticket.price.toFixed(2)} €</span>
                    </div>
                    <div className="text-xs text-slate-400">
                        Acquistato il: {new Date(ticket.purchaseDate).toLocaleString('it-IT')}
                    </div>
                </div>
            </div>
             <div className="bg-slate-50 dark:bg-slate-700 p-6 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-600">
                <img src={ticket.qrCodeUrl} alt="QR Code" className="w-32 h-32 rounded-md" />
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">ID: {ticket.id}</p>
            </div>
        </div>
    );
};


const MyTicketsView: React.FC = () => {
    const { user } = useAuth();
    const { eventTickets, loading } = useData();
    
    if (!user) return null;
    
    const myTickets = eventTickets.filter(t => t.userId === user.id);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">
                I Miei Biglietti
            </h1>
            {loading ? (
                <p>Caricamento biglietti...</p>
            ) : myTickets.length > 0 ? (
                <div className="space-y-6">
                    {myTickets.map(ticket => (
                        <TicketCard key={ticket.id} ticket={ticket} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 px-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
                    <TicketIcon className="mx-auto w-16 h-16 text-slate-400 dark:text-slate-500" />
                    <h3 className="mt-4 text-xl font-semibold text-slate-700 dark:text-slate-200">Nessun biglietto acquistato</h3>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">
                        Visita la sezione eventi per scoprire le prossime attività e acquistare il tuo biglietto.
                    </p>
                </div>
            )}
        </div>
    );
};


interface MainContentProps {
  currentView: { view: string; data?: any };
  setView: (view: string, data?: any) => void;
}

export const MainContent: React.FC<MainContentProps> = ({ currentView, setView }) => {
  const { user } = useAuth();
  
  const renderContent = () => {
    switch (currentView.view) {
      case 'dashboard':
        return user?.role === Role.ADMIN 
          ? <AdminDashboard /> 
          : <UserDashboard setView={setView} />;
      case 'manage-events':
        return <ManagementView type="event" />;
      case 'manage-articles':
        return <ManagementView type="article" />;
      case 'manage-banners':
        return <ManagementView type="banner" />;
      case 'manage-users':
        return <ManagementView type="user" />;
      case 'events':
        return <EventList setView={setView} />;
      case 'event-detail':
        return <EventDetail event={currentView.data} setView={setView} />;
      case 'articles':
        return <ArticleList setView={setView} />;
      case 'article-detail':
        return <ArticleDetail article={currentView.data} setView={setView} />;
      case 'chat':
        return <Chat />;
      case 'my-tickets':
        return <MyTicketsView />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      default:
        return user?.role === Role.ADMIN 
          ? <AdminDashboard /> 
          : <UserDashboard setView={setView} />;
    }
  };

  return <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">{renderContent()}</main>;
};
