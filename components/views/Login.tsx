import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { isDemoMode } = useData();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await login(email, password, isDemoMode);
    if (!success) {
      setError('Credenziali non valide. Riprova.');
    }
    setLoading(false);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
    <Input
        label="Email"
        id="email-login"
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="admin@app.com"
    />
    <Input
        label="Password"
        id="password-login"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        placeholder="admin"
    />
    
    {error && <p className="text-sm text-red-500 text-center">{error}</p>}
    
    <div>
        <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Accesso in corso...' : 'Accedi'}
        </Button>
    </div>
    </form>
  );
};
