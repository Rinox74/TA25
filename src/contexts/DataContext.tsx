import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { Event, Article, Banner, ChatMessage, User, Role, AppNotification, AppSettings, DbType, Ticket } from '../types';
import { apiService } from '../services/apiService';
import { localStorageService } from '../services/localStorageService';
import { useAuth } from './AuthContext';
import { defaultLogoBase64 } from '../assets/logo';

interface DataContextType {
  events: Event[];
  articles: Article[];
  banners: Banner[];
  chatMessages: ChatMessage[];
  users: User[];
  notifications: AppNotification[];
  settings: AppSettings;
  eventTickets: Ticket[];
  loading: boolean;
  isDemoMode: boolean;
  connectionError: string | null;
  fetchData: () => Promise<void>;
  addEvent: (event: Omit<Event, 'id'>) => Promise<void>;
  updateEvent: (eventId: string, updates: Partial<Event>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  purchaseTickets: (eventId: string, quantity: number) => Promise<void>;
  addArticle: (article: Omit<Article, 'id' | 'createdAt'>) => Promise<void>;
  updateArticle: (articleId: string, updates: Partial<Article>) => Promise<void>;
  deleteArticle: (articleId: string) => Promise<void>;
  addBanner: (banner: Omit<Banner, 'id'>) => Promise<void>;
  updateBanner: (bannerId: string, updates: Partial<Banner>) => Promise<void>;
  deleteBanner: (bannerId: string) => Promise<void>;
  postChatMessage: (message: { message: string }) => Promise<void>;
  fetchChatMessages: () => Promise<void>;
  addUser: (userData: Omit<User, 'id'>) => Promise<void>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  markNotificationsAsRead: () => Promise<void>;
  updateSettings: (settings: AppSettings) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const DEFAULT_SETTINGS: AppSettings = { 
    logo: defaultLogoBase64,
    welcomeText: 'Benvenuti nella Fondazione Taranto 25',
    dbType: DbType.MYSQL,
    dbHost: '185.221.175.33',
    dbPort: '3306',
    dbUser: 'krxrbauj_ta25',
    dbPassword: 'zEa4eKfhSaQRWsExjeGK',
    dbName: 'krxrbauj_ta25',
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [eventTickets, setEventTickets] = useState<Ticket[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const fetchDemoData = () => {
      const demoData = localStorageService.getAllData();
      setEvents(demoData.events);
      setArticles(demoData.articles);
      setBanners(demoData.banners);
      setChatMessages(demoData.chatMessages);
      setSettings(demoData.settings || DEFAULT_SETTINGS);
      setUsers(demoData.users);
      setNotifications(demoData.notifications);
      setEventTickets(demoData.tickets);
  }

  const fetchData = useCallback(async (isInitialLoad = false) => {
    if(isInitialLoad) setLoading(true);
    setConnectionError(null);
    try {
      const [eventsData, articlesData, bannersData, chatData, settingsData] = await Promise.all([
        apiService.getEvents(),
        apiService.getArticles(),
        apiService.getBanners(),
        apiService.getChatMessages(),
        apiService.getSettings(),
      ]);

      setIsDemoMode(false); // Connection successful
      
      setEvents(eventsData);
      setArticles(articlesData);
      setBanners(bannersData);
      setChatMessages(chatData);
      // CORRECTED LOGIC: Always merge fetched settings with defaults.
      // This ensures that any setting not present in the database
      // will fall back to its default value from DEFAULT_SETTINGS.
      setSettings({ ...DEFAULT_SETTINGS, ...settingsData });

      if (isAuthenticated) {
         const [usersData, notificationsData, ticketsData] = await Promise.all([
            apiService.getUsers(),
            apiService.getNotifications(),
            apiService.getEventTickets(),
         ]);
         setUsers(usersData);
         setNotifications(notificationsData);
         setEventTickets(ticketsData);
      }

    } catch (error) {
      console.warn("BACKEND CONNECTION FAILED. Switching to Demo Mode.", error);
       if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          setConnectionError("L'app non riesce a comunicare con il server. Assicurati che il server backend sia in esecuzione.");
      } else {
          setConnectionError((error as Error).message);
      }
      setIsDemoMode(true);
      fetchDemoData();
    } finally {
      if(isInitialLoad) setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  const handleDataMutation = async (apiCall: Promise<any>) => {
    try {
        await apiCall;
        await fetchData();
    } catch (error) {
        console.error("API call failed:", error);
        alert((error as Error).message || "An unexpected error occurred.");
    }
  };

  const handleDemoMutation = async (localCall: Promise<any>) => {
      try {
        await localCall;
        fetchDemoData();
      } catch (error) {
         console.error("Local storage operation failed:", error);
         alert((error as Error).message || "An unexpected error occurred in demo mode.");
      }
  }

  // Event handlers
  const addEvent = (event: Omit<Event, 'id'>) => isDemoMode ? handleDemoMutation(localStorageService.addEvent(event)) : handleDataMutation(apiService.addEvent(event));
  const updateEvent = (eventId: string, updates: Partial<Event>) => isDemoMode ? handleDemoMutation(localStorageService.updateEvent(eventId, updates)) : handleDataMutation(apiService.updateEvent(eventId, updates));
  const deleteEvent = (eventId: string) => isDemoMode ? handleDemoMutation(localStorageService.deleteEvent(eventId)) : handleDataMutation(apiService.deleteEvent(eventId));
  const purchaseTickets = (eventId: string, quantity: number) => isDemoMode ? handleDemoMutation(localStorageService.purchaseTickets(eventId, quantity, user?.id || '', user?.email || '')) : handleDataMutation(apiService.purchaseTickets(eventId, quantity));

  // Article handlers
  const addArticle = (article: Omit<Article, 'id' | 'createdAt'>) => isDemoMode ? handleDemoMutation(localStorageService.addArticle(article)) : handleDataMutation(apiService.addArticle(article));
  const updateArticle = (articleId: string, updates: Partial<Article>) => isDemoMode ? handleDemoMutation(localStorageService.updateArticle(articleId, updates)) : handleDataMutation(apiService.updateArticle(articleId, updates));
  const deleteArticle = (articleId: string) => isDemoMode ? handleDemoMutation(localStorageService.deleteArticle(articleId)) : handleDataMutation(apiService.deleteArticle(articleId));
  
  // Banner handlers
  const addBanner = (banner: Omit<Banner, 'id'>) => isDemoMode ? handleDemoMutation(localStorageService.addBanner(banner)) : handleDataMutation(apiService.addBanner(banner));
  const updateBanner = (bannerId: string, updates: Partial<Banner>) => isDemoMode ? handleDemoMutation(localStorageService.updateBanner(bannerId, updates)) : handleDataMutation(apiService.updateBanner(bannerId, updates));
  const deleteBanner = (bannerId: string) => isDemoMode ? handleDemoMutation(localStorageService.deleteBanner(bannerId)) : handleDataMutation(apiService.deleteBanner(bannerId));

  // Chat handlers
  const fetchChatMessages = async () => isDemoMode ? fetchDemoData() : setChatMessages(await apiService.getChatMessages());
  const postChatMessage = async (message: { message: string }) => {
      if(isDemoMode){
        await localStorageService.postChatMessage(message, user?.id || '', user?.email || '');
        fetchDemoData();
      } else {
        await apiService.postChatMessage(message);
        fetchChatMessages();
      }
  };

  // User handlers
  const addUser = (userData: Omit<User, 'id'>) => isDemoMode ? handleDemoMutation(localStorageService.addUser(userData)) : handleDataMutation(apiService.addUser(userData));
  const updateUser = (userId: string, updates: Partial<User>) => isDemoMode ? handleDemoMutation(localStorageService.updateUser(userId, updates)) : handleDataMutation(apiService.updateUser(userId, updates));
  const deleteUser = (userId: string) => isDemoMode ? handleDemoMutation(localStorageService.deleteUser(userId)) : handleDataMutation(apiService.deleteUser(userId));

  // Notification handlers
  const markNotificationsAsRead = () => isDemoMode ? handleDemoMutation(localStorageService.markNotificationsAsRead()) : handleDataMutation(apiService.markNotificationsAsRead());
  
  // Settings Handlers
  const updateSettings = (newSettings: AppSettings) => isDemoMode ? handleDemoMutation(localStorageService.updateSettings(newSettings)) : handleDataMutation(apiService.updateSettings(newSettings));

  const value = {
    events, articles, banners, chatMessages, users, notifications, settings, eventTickets,
    loading, isDemoMode, connectionError, fetchData,
    addEvent, updateEvent, deleteEvent, purchaseTickets,
    addArticle, updateArticle, deleteArticle,
    addBanner, updateBanner, deleteBanner,
    postChatMessage, fetchChatMessages,
    addUser, updateUser, deleteUser,
    markNotificationsAsRead,
    updateSettings,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};