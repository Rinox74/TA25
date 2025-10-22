import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Role } from '../../types';
import { X, LayoutDashboard, Calendar, FileText, ImageIcon, Users, MessageSquare, User, Settings, Ticket } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  setView: (view: string) => void;
}

const NavLink: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; }> = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center p-3 text-slate-100 rounded-md hover:bg-primary-700 transition-colors">
    {icon}
    <span className="ml-3">{label}</span>
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen, setView }) => {
  const { user, isAuthenticated } = useAuth();
  const { settings } = useData();
  const isAdmin = user?.role === Role.ADMIN;

  const handleSetView = (view: string) => {
    setView(view);
    setSidebarOpen(false);
  };

  const sidebarContent = (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-primary-800 h-14">
        <div className="flex items-center gap-3 overflow-hidden">
          {settings.logo && (
            <img src={settings.logo} alt="Logo" className="h-8 w-auto flex-shrink-0" />
          )}
          <h1 className="text-xl font-semibold text-white truncate">TA25 APP</h1>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-300 hover:text-white">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <NavLink icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" onClick={() => handleSetView('dashboard')} />
        <hr className="border-primary-700 my-2"/>

        {/* User Links */}
        <NavLink icon={<Calendar className="w-5 h-5" />} label="Eventi" onClick={() => handleSetView('events')} />
        <NavLink icon={<FileText className="w-5 h-5" />} label="Articoli" onClick={() => handleSetView('articles')} />
        <NavLink icon={<MessageSquare className="w-5 h-5" />} label="Chat" onClick={() => handleSetView('chat')} />
        {isAuthenticated && (
            <NavLink icon={<Ticket className="w-5 h-5" />} label="I Miei Biglietti" onClick={() => handleSetView('my-tickets')} />
        )}
        
        {/* Admin Links */}
        {isAdmin && (
          <>
            <hr className="border-primary-700 my-2"/>
            <p className="px-3 py-2 text-xs font-semibold text-primary-300 uppercase">Amministrazione</p>
            <NavLink icon={<Calendar className="w-5 h-5" />} label="Gestione Eventi" onClick={() => handleSetView('manage-events')} />
            <NavLink icon={<FileText className="w-5 h-5" />} label="Gestione Articoli" onClick={() => handleSetView('manage-articles')} />
            <NavLink icon={<ImageIcon className="w-5 h-5" />} label="Gestione Banner" onClick={() => handleSetView('manage-banners')} />
            <NavLink icon={<Users className="w-5 h-5" />} label="Gestione Utenti" onClick={() => handleSetView('manage-users')} />
            <NavLink icon={<Settings className="w-5 h-5" />} label="Impostazioni" onClick={() => handleSetView('settings')} />
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-primary-800">
        {isAuthenticated && (
            <NavLink icon={<User className="w-5 h-5" />} label="Mio Profilo" onClick={() => handleSetView('profile')} />
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-primary-900 text-white z-40 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:hidden`}
      >
        {sidebarContent}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-shrink-0 bg-primary-900 text-white">
        {sidebarContent}
      </div>
    </>
  );
};