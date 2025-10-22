import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { CreditCard, Wallet } from 'lucide-react';
import { CreditCardForm } from '../../forms/CreditCardForm';
import { Event } from '../../../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  event: Event;
  quantity: number;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onPaymentSuccess, event, quantity }) => {
  const [paymentMethod, setPaymentMethod] = useState<'credit-card' | 'paypal' | null>(null);
  const [loading, setLoading] = useState(false);

  const totalPrice = (event.ticketPrice * quantity).toFixed(2);

  const handlePayment = () => {
    setLoading(true);
    // Simulate payment processing
    setTimeout(() => {
        setLoading(false);
        onPaymentSuccess();
        handleClose();
    }, 2000);
  };

  const resetState = () => {
      setPaymentMethod(null);
      setLoading(false);
  }

  const handleClose = () => {
    if (loading) return;
    resetState();
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Completa il tuo Acquisto">
      <div className="space-y-6">
        <div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Riepilogo Ordine</h3>
            <div className="mt-2 p-4 bg-slate-100 dark:bg-slate-700 rounded-lg space-y-2">
                <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Evento:</span>
                    <span className="font-semibold text-slate-800 dark:text-white">{event.title}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Quantità:</span>
                    <span className="font-semibold text-slate-800 dark:text-white">{quantity} Bigliett{quantity > 1 ? 'i' : 'o'}</span>
                </div>
                 <div className="flex justify-between text-xl border-t border-slate-300 dark:border-slate-600 pt-2 mt-2">
                    <span className="font-bold text-slate-700 dark:text-slate-100">Totale:</span>
                    <span className="font-bold text-primary-600 dark:text-primary-400">{totalPrice} €</span>
                </div>
            </div>
        </div>

        <div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-3">Seleziona Metodo di Pagamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={() => setPaymentMethod('credit-card')}
                    disabled={loading}
                    className={`p-4 border-2 rounded-lg flex items-center gap-3 transition-colors disabled:opacity-50 ${paymentMethod === 'credit-card' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-primary-400'}`}
                >
                    <CreditCard className="w-6 h-6 text-primary-600" />
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Carta di Credito</span>
                </button>
                <button
                    onClick={() => setPaymentMethod('paypal')}
                    disabled={loading}
                    className={`p-4 border-2 rounded-lg flex items-center gap-3 transition-colors disabled:opacity-50 ${paymentMethod === 'paypal' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-primary-400'}`}
                >
                    <Wallet className="w-6 h-6 text-blue-600" />
                    <span className="font-semibold text-slate-700 dark:text-slate-200">PayPal</span>
                </button>
            </div>
        </div>

        {paymentMethod === 'credit-card' && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <CreditCardForm onPay={handlePayment} totalPrice={totalPrice} loading={loading} />
            </div>
        )}
        
        {paymentMethod === 'paypal' && (
             <div className="pt-4 border-t border-slate-200 dark:border-slate-700 text-center space-y-4">
                <p className="text-slate-600 dark:text-slate-300">Verrai reindirizzato a PayPal per completare il pagamento in sicurezza.</p>
                <Button onClick={handlePayment} size="lg" disabled={loading} className="w-full bg-[#0070ba] hover:bg-[#005ea6]">
                    {loading ? 'Connessione a PayPal...' : `Paga ${totalPrice} € con PayPal`}
                </Button>
            </div>
        )}
      </div>
    </Modal>
  );
};
