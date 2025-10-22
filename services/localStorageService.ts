import { User, Role, Event, Article, Banner, ChatMessage, AppNotification, NotificationType, AppSettings, DbType, Ticket } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'TA25_DEMO_DATA';

const getInitialData = () => {
    // Dates for events
    const today = new Date();
    const futureDate1 = new Date(today);
    futureDate1.setDate(today.getDate() + 7);
    const futureDate2 = new Date(today);
    futureDate2.setDate(today.getDate() + 30);
    const pastDate1 = new Date(today);
    pastDate1.setDate(today.getDate() - 14);

    return {
    users: [
        { id: 'admin-demo-id', email: 'admin@demo.it', password: 'admin', role: Role.ADMIN, firstName: 'Admin', lastName: 'Demo', company: 'Demo Company' },
        { id: 'user-demo-id', email: 'user@demo.it', password: 'user', role: Role.USER, firstName: 'User', lastName: 'Demo', company: 'Demo Company' },
    ],
    events: [
        { id: 'event-01', title: 'Conferenza Tech 2024', description: 'Un evento imperdibile per tutti gli appassionati di tecnologia. Speaker di fama internazionale e workshop interattivi.', date: futureDate1.toISOString(), location: 'Milano Convention Center', image: 'https://picsum.photos/seed/event1/800/400', totalTickets: 100, ticketPrice: 50.00 },
        { id: 'event-02', title: 'Community Meetup & Networking', description: 'Incontra gli altri membri della community, scambia idee e crea nuove sinergie. Aperitivo incluso!', date: futureDate2.toISOString(), location: 'Spazio Copernico, Roma', image: 'https://picsum.photos/seed/event2/800/400', totalTickets: 50, ticketPrice: 15.50 },
        { id: 'event-03', title: 'Workshop Sviluppo Web', description: 'Un workshop intensivo di due giorni sulle ultime tecnologie del web development. Posti limitati.', date: pastDate1.toISOString(), location: 'Talent Garden, Torino', image: 'https://picsum.photos/seed/event3/800/400', totalTickets: 20, ticketPrice: 250.00 },
    ],
    articles: [
        { id: 'article-01', title: 'Le 5 Tendenze AI del Prossimo Anno', content: 'L\'intelligenza artificiale sta evolvendo a un ritmo senza precedenti. In questo articolo esploriamo le cinque tendenze che definiranno il settore nel prossimo futuro, dal deep learning generativo all\'etica dell\'AI.', image: 'https://picsum.photos/seed/article1/800/400', createdAt: new Date().toISOString() },
        { id: 'article-02', title: 'Guida Completa al Lavoro da Remoto Efficace', content: 'Il lavoro da remoto è qui per restare. Scopri le migliori pratiche, gli strumenti essenziali e i consigli per mantenere alta la produttività e il benessere del team lavorando a distanza.', image: 'https://picsum.photos/seed/article2/800/400', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
    ],
    banners: [
        { id: 'banner-01', clientName: 'Sponsor Principale', imageUrl: 'https://picsum.photos/seed/banner1/1200/200', targetUrl: 'https://google.com' }
    ],
    chatMessages: [
        { id: 'chat-01', userId: 'user-demo-id', userEmail: 'user@demo.it', message: 'Ciao a tutti! Qualcuno parteciperà alla Conferenza Tech?', timestamp: new Date(Date.now() - 60000 * 5).toISOString() },
        { id: 'chat-02', userId: 'admin-demo-id', userEmail: 'admin@demo.it', message: 'Ciao User! Certo, ci saremo. Non vediamo l\'ora!', timestamp: new Date(Date.now() - 60000 * 4).toISOString() },
    ],
    tickets: [],
    notifications: [
         { id: 'notif-01', type: NotificationType.NEW_EVENT, message: 'Nuovo evento pubblicato: Conferenza Tech 2024!', relatedId: 'event-01', read: true, createdAt: new Date().toISOString() }
    ],
    settings: {
        logo: 'https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500', // A default logo
        welcomeText: 'Benvenuto nella modalità demo!',
        dbType: DbType.NONE
    }
}};

const getData = () => {
    const data = sessionStorage.getItem(STORAGE_KEY);
    if (data) {
        return JSON.parse(data);
    }
    const initialData = getInitialData();
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
};

const saveData = (data: any) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const localStorageService = {
  login: async (email: string, password: string): Promise<User & { token: string } | null> => {
    const data = getData();
    const user = data.users.find((u: User) => u.email === email && u.password === password);
    if (user) {
      return { ...user, token: `demo-token-${user.id}` };
    }
    return null;
  },
  
  getAllData: () => getData(),

  getEvents: async (): Promise<Event[]> => getData().events,
  addEvent: async (eventData: Omit<Event, 'id'>): Promise<Event> => {
    const data = getData();
    const newEvent = { ...eventData, id: uuidv4() };
    data.events.push(newEvent);
    data.notifications.unshift({ id: uuidv4(), type: NotificationType.NEW_EVENT, message: `Nuovo evento: ${newEvent.title}`, relatedId: newEvent.id, read: false, createdAt: new Date().toISOString() });
    saveData(data);
    return newEvent;
  },
  updateEvent: async (eventId: string, updates: Partial<Event>): Promise<Event> => {
    const data = getData();
    data.events = data.events.map((e: Event) => e.id === eventId ? { ...e, ...updates } : e);
    saveData(data);
    return data.events.find((e: Event) => e.id === eventId);
  },
  deleteEvent: async (eventId: string): Promise<void> => {
    const data = getData();
    data.events = data.events.filter((e: Event) => e.id !== eventId);
    saveData(data);
  },

  getArticles: async (): Promise<Article[]> => getData().articles,
  addArticle: async (articleData: Omit<Article, 'id' | 'createdAt'>): Promise<Article> => {
    const data = getData();
    const newArticle = { ...articleData, id: uuidv4(), createdAt: new Date().toISOString() };
    data.articles.unshift(newArticle);
    data.notifications.unshift({ id: uuidv4(), type: NotificationType.NEW_ARTICLE, message: `Nuovo articolo: ${newArticle.title}`, relatedId: newArticle.id, read: false, createdAt: new Date().toISOString() });
    saveData(data);
    return newArticle;
  },
  updateArticle: async (articleId: string, updates: Partial<Article>): Promise<Article> => {
    const data = getData();
    data.articles = data.articles.map((a: Article) => a.id === articleId ? { ...a, ...updates } : a);
    saveData(data);
    return data.articles.find((a: Article) => a.id === articleId);
  },
  deleteArticle: async (articleId: string): Promise<void> => {
    const data = getData();
    data.articles = data.articles.filter((a: Article) => a.id !== articleId);
    saveData(data);
  },

  getUsers: async (): Promise<User[]> => getData().users.map(({ password, ...user}) => user),
  addUser: async (userData: Omit<User, 'id'>): Promise<User> => {
      const data = getData();
      const newUser = { ...userData, id: uuidv4() };
      data.users.push(newUser);
      saveData(data);
      const { password, ...rest } = newUser;
      return rest;
  },
  updateUser: async (userId: string, updates: Partial<User>): Promise<User> => {
      const data = getData();
      let updatedUser;
      data.users = data.users.map((u: User) => {
          if (u.id === userId) {
              updatedUser = { ...u, ...updates };
              return updatedUser;
          }
          return u;
      });
      saveData(data);
      const { password, ...rest } = updatedUser;
      return rest;
  },
  deleteUser: async (userId: string): Promise<void> => {
      const data = getData();
      data.users = data.users.filter((u: User) => u.id !== userId);
      saveData(data);
  },

  getBanners: async (): Promise<Banner[]> => getData().banners,
  addBanner: async (bannerData: Omit<Banner, 'id'>): Promise<Banner> => {
      const data = getData();
      const newBanner = { ...bannerData, id: uuidv4() };
      data.banners.push(newBanner);
      saveData(data);
      return newBanner;
  },
  updateBanner: async (bannerId: string, updates: Partial<Banner>): Promise<Banner> => {
      const data = getData();
      data.banners = data.banners.map((b: Banner) => b.id === bannerId ? { ...b, ...updates } : b);
      saveData(data);
      return data.banners.find((b: Banner) => b.id === bannerId);
  },
  deleteBanner: async (bannerId: string): Promise<void> => {
      const data = getData();
      data.banners = data.banners.filter((b: Banner) => b.id !== bannerId);
      saveData(data);
  },

  getChatMessages: async (): Promise<ChatMessage[]> => getData().chatMessages,
  postChatMessage: async (message: { message: string }, userId: string, userEmail: string): Promise<ChatMessage> => {
      const data = getData();
      const newMsg = {
          id: uuidv4(),
          userId: userId,
          userEmail: userEmail,
          message: message.message,
          timestamp: new Date().toISOString(),
      };
      data.chatMessages.push(newMsg);
      saveData(data);
      return newMsg;
  },

  getNotifications: async (): Promise<AppNotification[]> => getData().notifications,
  markNotificationsAsRead: async (): Promise<void> => {
      const data = getData();
      data.notifications.forEach((n: AppNotification) => n.read = true);
      saveData(data);
  },

  getSettings: async (): Promise<AppSettings> => getData().settings,
  updateSettings: async (settings: AppSettings): Promise<AppSettings> => {
      const data = getData();
      data.settings = { ...data.settings, ...settings };
      saveData(data);
      return data.settings;
  },
  
  getEventTickets: async (): Promise<Ticket[]> => getData().tickets,
  purchaseTickets: async (eventId: string, quantity: number, userId: string, userEmail: string): Promise<Ticket[]> => {
    const data = getData();
    const event = data.events.find((e: Event) => e.id === eventId);
    if (!event) throw new Error("Evento non trovato.");

    const newTickets: Ticket[] = [];
    for (let i = 0; i < quantity; i++) {
        const newTicket: Ticket = {
            id: uuidv4(),
            eventId: event.id,
            userId: userId,
            userEmail: userEmail,
            eventName: event.title,
            eventDate: event.date,
            purchaseDate: new Date().toISOString(),
            price: event.ticketPrice,
            qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ticket-${uuidv4()}`,
        };
        newTickets.push(newTicket);
    }
    data.tickets.push(...newTickets);
    saveData(data);
    return newTickets;
  },
};