import React, { useState, useEffect } from 'react';
import { Event } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { FileUpload } from '../ui/FileUpload';

interface EventFormProps {
  onSubmit: (event: Omit<Event, 'id'>) => void;
  onCancel: () => void;
  eventToEdit?: Event | null;
}

export const EventForm: React.FC<EventFormProps> = ({ onSubmit, onCancel, eventToEdit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState('');
  const [totalTickets, setTotalTickets] = useState(100);
  const [ticketPrice, setTicketPrice] = useState(0);

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setDescription(eventToEdit.description);
      setDate(eventToEdit.date.split('T')[0]); // Format for input[type=date]
      setLocation(eventToEdit.location);
      setImage(eventToEdit.image);
      setTotalTickets(eventToEdit.totalTickets);
      setTicketPrice(eventToEdit.ticketPrice);
    } else {
        setTitle('');
        setDescription('');
        setDate('');
        setLocation('');
        setImage('');
        setTotalTickets(100);
        setTicketPrice(0);
    }
  }, [eventToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !date || !location || !image) {
      alert('Per favore, compila tutti i campi.');
      return;
    }
    onSubmit({ title, description, date: new Date(date).toISOString(), location, image, totalTickets, ticketPrice });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Titolo" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descrizione</label>
          <textarea 
            id="description" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            required 
            rows={4}
            className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Data" id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        <Input label="Luogo" id="location" value={location} onChange={(e) => setLocation(e.target.value)} required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Biglietti Totali" id="totalTickets" type="number" value={totalTickets} onChange={(e) => setTotalTickets(parseInt(e.target.value, 10))} required />
        <Input label="Prezzo Biglietto (€)" id="ticketPrice" type="number" step="0.01" value={ticketPrice} onChange={(e) => setTicketPrice(parseFloat(e.target.value))} required />
      </div>
      <FileUpload label="Immagine Evento" onFileSelect={setImage} currentImageUrl={image} />
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Annulla</Button>
        <Button type="submit">{eventToEdit ? 'Salva Modifiche' : 'Crea Evento'}</Button>
      </div>
    </form>
  );
};
