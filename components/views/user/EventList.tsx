
import React, { useState, useMemo } from 'react';
import { useData } from '../../../contexts/DataContext';
import { Event } from '../../../types';
import { Input } from '../../ui/Input';

interface EventListProps {
    setView: (view: string, data?: any) => void;
}

const EventCard: React.FC<{event: Event, onClick: () => void}> = ({ event, onClick }) => (
    <div onClick={onClick} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden cursor-pointer group transform hover:-translate-y-1 transition-transform duration-300">
        <div className="relative">
            <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-40 transition-colors duration-300"></div>
        </div>
        <div className="p-5">
            <p className="text-sm text-primary-500 dark:text-primary-400 font-semibold">{new Date(event.date).toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <h3 className="mt-1 text-xl font-bold text-slate-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{event.title}</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{event.location}</p>
        </div>
    </div>
);

export const EventList: React.FC<EventListProps> = ({ setView }) => {
    const { events } = useData();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredEvents = useMemo(() => {
        return events.filter(event => 
            event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.location.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [events, searchTerm]);
    
    const upcomingEvents = filteredEvents.filter(e => new Date(e.date) >= new Date()).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const pastEvents = filteredEvents.filter(e => new Date(e.date) < new Date()).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Tutti gli Eventi</h1>
                <Input 
                    type="text" 
                    placeholder="Cerca eventi..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64"
                />
            </div>

            <div className="space-y-10">
                <div>
                    <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-4 border-b-2 border-primary-500 pb-2">Eventi Futuri</h2>
                    {upcomingEvents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {upcomingEvents.map(event => (
                                <EventCard key={event.id} event={event} onClick={() => setView('event-detail', event)} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 dark:text-slate-400">Nessun evento futuro trovato.</p>
                    )}
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-4 border-b-2 border-slate-300 dark:border-slate-600 pb-2">Eventi Passati</h2>
                    {pastEvents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pastEvents.map(event => (
                                <EventCard key={event.id} event={event} onClick={() => setView('event-detail', event)} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 dark:text-slate-400">Nessun evento passato trovato.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
