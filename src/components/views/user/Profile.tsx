import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { User } from '../../../types';

export const Profile: React.FC = () => {
  const { user, updateCurrentUser } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password && password !== confirmPassword) {
      setError('Le password non coincidono.');
      return;
    }

    try {
        const updates: Partial<User> = { email };
        if (password) {
            updates.password = password;
        }
      await updateCurrentUser(updates);
      setMessage('Profilo aggiornato con successo!');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError('Errore durante l\'aggiornamento del profilo.');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Il Mio Profilo</h1>
        <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-8">
          <div className="space-y-4 mb-6">
              <div className="py-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="block text-sm font-medium text-slate-500 dark:text-slate-400">Azienda</span>
                  <p className="mt-1 text-slate-800 dark:text-white font-semibold">{user?.company || 'Non specificata'}</p>
              </div>
              <div className="py-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="block text-sm font-medium text-slate-500 dark:text-slate-400">Nome</span>
                  <p className="mt-1 text-slate-800 dark:text-white font-semibold">{user?.firstName || 'Non specificato'}</p>
              </div>
              <div className="py-2">
                  <span className="block text-sm font-medium text-slate-500 dark:text-slate-400">Cognome</span>
                  <p className="mt-1 text-slate-800 dark:text-white font-semibold">{user?.lastName || 'Non specificato'}</p>
              </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 border-t border-slate-200 dark:border-slate-700 pt-6">
            <Input
              label="Email"
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <div>
                <label htmlFor="profile-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Nuova Password
                </label>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Lascia i campi password vuoti per non modificarla.
                </p>
                <input
                    id="profile-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
            </div>
            
            <Input
              label="Conferma Nuova Password"
              id="profile-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {error && <p className="text-sm text-red-500">{error}</p>}
            {message && <p className="text-sm text-green-500">{message}</p>}

            <div className="pt-2">
              <Button type="submit" className="w-full sm:w-auto">Salva Modifiche</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};