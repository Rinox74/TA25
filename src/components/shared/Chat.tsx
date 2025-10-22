import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ChatMessage } from '../../types';

export const Chat: React.FC = () => {
  const { chatMessages, postChatMessage, fetchChatMessages } = useData();
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
        fetchChatMessages();
    }, 3000); // Poll for new messages every 3 seconds
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && user) {
      await postChatMessage({
        message: newMessage,
      });
      setNewMessage('');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800">
      <div className="p-4 border-b dark:border-slate-700">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Chat Associati</h2>
      </div>
      <div ref={chatContainerRef} className="flex-1 p-4 space-y-4 overflow-y-auto">
        {chatMessages.map((msg: ChatMessage) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${msg.userId === user?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex flex-col ${msg.userId === user?.id ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${
                  msg.userId === user?.id
                    ? 'bg-primary-500 text-white rounded-br-none'
                    : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 rounded-bl-none'
                }`}
              >
                <p className="text-sm">{msg.message}</p>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {msg.userEmail} - {formatTimestamp(msg.timestamp)}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t dark:border-slate-700">
        {isAuthenticated ? (
            <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Scrivi un messaggio..."
                className="flex-1"
                autoComplete="off"
            />
            <Button type="submit">Invia</Button>
            </form>
        ) : (
            <div className="text-center">
              <p className="text-sm text-slate-500 mb-2">Devi accedere per inviare messaggi.</p>
              <Button onClick={openLoginModal}>Accedi</Button>
            </div>
        )}
      </div>
    </div>
  );
};