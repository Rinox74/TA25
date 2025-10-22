import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Menu, Bell, User as UserIcon, LogOut } from 'lucide-react';
import { Role } from '../../types';
import { Button } from '../ui/Button';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
  setView: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ setSidebarOpen, setView }) => {
  const { user, isAuthenticated, logout, openLoginModal } = useAuth();
  const { notifications, markNotificationsAsRead } = useData();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);

  const unreadNotifications = notifications.filter(n => !n.is_read);
  const isAdmin = user?.role === Role.ADMIN;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target as Node)) {
        setNotificationMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = () => {
      setNotificationMenuOpen(!notificationMenuOpen);
      if(unreadNotifications.length > 0) {
          markNotificationsAsRead();
      }
  }

  const handleLogout = () => {
    logout();
    setView('events');
    setProfileMenuOpen(false);
  };

  return (
    <header className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 shadow-md">
      <div className="flex items-center">
        {isAdmin && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-500 focus:outline-none lg:hidden mr-4"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {isAuthenticated ? (
          <>
            {/* Notifications */}
            <div className="relative" ref={notificationMenuRef}>
                <button onClick={handleNotificationClick} className="relative text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400">
                    <Bell className="w-6 h-6" />
                    {unreadNotifications.length > 0 && (
                        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-800"></span>
                    )}
                </button>
                {notificationMenuOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-700 rounded-md shadow-lg overflow-hidden z-20">
                        <div className="py-2 px-4 font-bold text-slate-700 dark:text-slate-200 border-b dark:border-slate-600">Notifiche</div>
                        <ul className="divide-y divide-slate-100 dark:divide-slate-600 max-h-80 overflow-y-auto">
                            {notifications.length > 0 ? notifications.map(n => (
                                <li key={n.id} className={`p-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 ${!n.is_read ? 'font-bold' : ''}`}>
                                    {n.message}
                                </li>
                            )) : (
                                <li className="p-3 text-sm text-center text-slate-500 dark:text-slate-400">Nessuna notifica</li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
            
            {/* Profile Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button onClick={() => setProfileMenuOpen(!profileMenuOpen)} className="flex items-center space-x-2">
                <span className="hidden sm:inline text-slate-700 dark:text-slate-300">{user?.email}</span>
                <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold">
                  {user?.email[0].toUpperCase()}
                </div>
              </button>
              
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-700 rounded-md shadow-lg py-1 z-20">
                  <button
                    onClick={() => { setView('profile'); setProfileMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center space-x-2"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>Profilo</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Button onClick={openLoginModal}>Accedi</Button>
        )}
      </div>
    </header>
  );
};