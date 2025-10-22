import React from 'react';
import { Calendar, FileText, MessageSquare, Ticket } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavLinkProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-xs transition-colors ${
      isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400 hover:text-primary-500'
    }`}
  >
    {icon}
    <span className={`mt-1 font-medium ${isActive ? 'font-bold' : ''}`}>{label}</span>
  </button>
);


interface BottomNavBarProps {
  currentView: { view: string; data?: any };
  setView: (view: string, data?: any) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentView, setView }) => {
    const { isAuthenticated } = useAuth();

    const navItems = [
        { view: 'events', label: 'Eventi', icon: <Calendar className="w-6 h-6" /> },
        { view: 'articles', label: 'Articoli', icon: <FileText className="w-6 h-6" /> },
        { view: 'chat', label: 'Chat', icon: <MessageSquare className="w-6 h-6" /> },
    ];

    if (isAuthenticated) {
        navItems.push({ view: 'my-tickets', label: 'Biglietti', icon: <Ticket className="w-6 h-6" /> });
    }

    const isViewActive = (view: string) => {
        if (view === 'events' && (currentView.view === 'events' || currentView.view === 'event-detail')) return true;
        if (view === 'articles' && (currentView.view === 'articles' || currentView.view === 'article-detail')) return true;
        return currentView.view === view;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-20 lg:hidden">
            <nav className="flex justify-around items-center h-full">
                {navItems.map(item => (
                    <NavLink
                        key={item.view}
                        icon={item.icon}
                        label={item.label}
                        isActive={isViewActive(item.view)}
                        onClick={() => setView(item.view)}
                    />
                ))}
            </nav>
        </div>
    );
};
