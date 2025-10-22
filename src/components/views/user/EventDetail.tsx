import React, { useState, useMemo } from 'react';
import { Event } from '../../../types';
import { useAuth } from '../../../contexts/AuthContext';
import { useData } from '../../../contexts/DataContext';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { ArrowLeft, Calendar, MapPin, Ticket, Euro } from 'lucide-react';
import { PaymentModal } from './PaymentModal';

interface EventDetailProps {
  event: Event;
  setView: (view: string, data?: any) => void;
}

export const EventDetail: React.FC<EventDetailProps> = ({ event, setView }) => {
  const { isAuthenticated, openLoginModal } = useAuth();
  const { purchaseTickets, eventTickets } = useData();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);


  const ticketsSold = useMemo(() => {
    return eventTickets.filter(t => t.eventId === event.id).length;
  }, [eventTickets, event.id]);

  const availableTickets = event.totalTickets - ticketsSold;

  if (!event) {
    return (
      <div className="p-8 text-center">
        <p>Evento non trovato.</p>
        <Button onClick={() => setView('events')} className="mt-4">Torna agli eventi</Button>
      </div>
    );
  }

  const handlePaymentSuccess = async () => {
    if (isAuthenticated && quantity > 0) {
      setLoading(true);
      setError('');
      setSuccess('');
      try {
        await purchaseTickets(event.id, quantity);
        setSuccess(`Acquisto completato! Hai acquistato ${quantity} bigliett${quantity > 1 ? 'i' : 'o'}. Controlla la sezione "I Miei Biglietti".`);
        setQuantity(1);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Si è verificato un errore durante l\'acquisto.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInitiatePurchase = () => {
      if (quantity > 0) {
          setError('');
          setSuccess('');
          setIsPaymentModalOpen(true);
      }
  };
  
  const isPastEvent = new Date(event.date) < new Date();
  const totalPrice = (event.ticketPrice * quantity).toFixed(2);

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        <button onClick={() => setView('events')} className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Torna a tutti gli eventi
        </button>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl overflow-hidden">
          <img src={event.image} alt={event.title} className="w-full h-64 md:h-96 object-cover" />
          <div className="p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2">{event.title}</h1>
            
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-slate-500 dark:text-slate-400 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{new Date(event.date).toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{event.location}</span>
              </div>
               <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5" />
                <span>{availableTickets} / {event.totalTickets} biglietti disponibili</span>
              </div>
               <div className="flex items-center gap-2">
                <Euro className="w-5 h-5" />
                <span>{event.ticketPrice.toFixed(2)} € a biglietto</span>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
               {isPastEvent ? (
                   <div className="px-4 py-2 text-center rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                      Evento Concluso
                  </div>
              ) : availableTickets <= 0 ? (
                  <div className="px-4 py-2 text-center rounded-md bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 font-semibold">
                      Biglietti Esauriti
                  </div>
              ) : isAuthenticated ? (
                  <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                          <div className="flex items-center gap-3">
                             <label htmlFor="quantity" className="font-semibold text-slate-700 dark:text-slate-200">Quantità:</label>
                              <Input 
                                  id="quantity"
                                  type="number"
                                  value={quantity}
                                  onChange={(e) => setQuantity(Math.max(1, Math.min(parseInt(e.target.value) || 1, availableTickets)))}
                                  min="1"
                                  max={availableTickets}
                                  className="w-20 text-center"
                              />
                          </div>
                           <div className="text-lg font-bold text-slate-800 dark:text-white">
                              Totale: {totalPrice} €
                           </div>
                      </div>
                      {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                      {success && <p className="text-sm text-green-500 text-center">{success}</p>}
                      <Button 
                          onClick={handleInitiatePurchase} 
                          size="lg"
                          className="w-full"
                          disabled={loading || quantity <= 0}
                      >
                          {loading ? 'Elaborazione...' : `Procedi all'Acquisto`}
                      </Button>
                  </div>
              ) : (
                <div className="text-center bg-slate-50 dark:bg-slate-700 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Accedi per acquistare</h3>
                  <p className="mt-2 text-slate-600 dark:text-slate-300">Devi effettuare l'accesso per poter acquistare i biglietti per questo evento.</p>
                  <Button onClick={openLoginModal} className="mt-4" size="lg">Accedi</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        event={event}
        quantity={quantity}
      />
    </>
  );
};