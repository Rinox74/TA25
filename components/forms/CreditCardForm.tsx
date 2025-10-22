import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface CreditCardFormProps {
  onPay: () => void;
  totalPrice: string;
  loading: boolean;
}

export const CreditCardForm: React.FC<CreditCardFormProps> = ({ onPay, totalPrice, loading }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [error, setError] = useState('');

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    let formattedValue = '';
    for (let i = 0; i < value.length; i += 4) {
      formattedValue += value.substring(i, i + 4) + ' ';
    }
    setCardNumber(formattedValue.trim());
  };
  
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 2) {
      setExpiry(value);
    } else {
      setExpiry(`${value.slice(0, 2)}/${value.slice(2, 4)}`);
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!cardNumber || !cardName || !expiry || !cvc) {
      setError('Tutti i campi sono obbligatori.');
      return;
    }
    if (cardNumber.replace(/\s/g, '').length !== 16) {
        setError('Il numero di carta deve essere di 16 cifre.');
        return;
    }
    if (expiry.length !== 5) {
        setError('La data di scadenza non è valida (MM/YY).');
        return;
    }
    if (cvc.length < 3) {
        setError('Il CVC non è valido.');
        return;
    }
    onPay();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Numero Carta"
        id="cardNumber"
        value={cardNumber}
        onChange={handleCardNumberChange}
        placeholder="0000 0000 0000 0000"
        maxLength={19}
        required
      />
      <Input
        label="Nome sulla Carta"
        id="cardName"
        value={cardName}
        onChange={(e) => setCardName(e.target.value)}
        placeholder="Mario Rossi"
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Scadenza (MM/YY)"
          id="expiry"
          value={expiry}
          onChange={handleExpiryChange}
          placeholder="MM/YY"
          maxLength={5}
          required
        />
        <Input
          label="CVC"
          id="cvc"
          value={cvc}
          onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
          placeholder="123"
          maxLength={4}
          required
        />
      </div>
       {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="pt-4">
        <Button type="submit" className="w-full" disabled={loading} size="lg">
          {loading ? 'Pagamento in corso...' : `Paga ${totalPrice} €`}
        </Button>
      </div>
    </form>
  );
};
