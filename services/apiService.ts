import { User, Role, Event, Article, Banner, ChatMessage, AppNotification, NotificationType, AppSettings, DbType, Ticket } from '../types';

const API_URL = 'http://localhost:5000/api'; // The backend server URL

const getAuthToken = (): string | null => {
    try {
        const authData = sessionStorage.getItem('auth');
        return authData ? JSON.parse(authData).token : null;
    } catch (error) {
        return null;
    }
}

const getHeaders = () => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
}

const apiRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: getHeaders(),
    });
    return handleResponse(response);
};

export const apiService = {
  // --- AUTH ---
  login: async (email: string, password: string): Promise<User & { token: string } | null> => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error("Login failed:", error);
        return null;
    }
  },

  // --- USERS ---
  getUsers: (): Promise<User[]> => apiRequest('/users'),
  addUser: (userData: Omit<User, 'id'>): Promise<User> => apiRequest('/users', { method: 'POST', body: JSON.stringify(userData) }),
  updateUser: (userId: string, updates: Partial<User>): Promise<User> => apiRequest(`/users/${userId}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteUser: (userId: string): Promise<void> => apiRequest(`/users/${userId}`, { method: 'DELETE' }),

  // --- EVENTS ---
  getEvents: (): Promise<Event[]> => apiRequest('/events'),
  addEvent: (eventData: Omit<Event, 'id'>): Promise<Event> => apiRequest('/events', { method: 'POST', body: JSON.stringify(eventData) }),
  updateEvent: (eventId: string, updates: Partial<Event>): Promise<Event> => apiRequest(`/events/${eventId}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteEvent: (eventId: string): Promise<void> => apiRequest(`/events/${eventId}`, { method: 'DELETE' }),

  // --- ARTICLES ---
  getArticles: (): Promise<Article[]> => apiRequest('/articles'),
  addArticle: (articleData: Omit<Article, 'id' | 'createdAt'>): Promise<Article> => apiRequest('/articles', { method: 'POST', body: JSON.stringify(articleData) }),
  updateArticle: (articleId: string, updates: Partial<Article>): Promise<Article> => apiRequest(`/articles/${articleId}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteArticle: (articleId: string): Promise<void> => apiRequest(`/articles/${articleId}`, { method: 'DELETE' }),

  // --- BANNERS ---
  getBanners: (): Promise<Banner[]> => apiRequest('/banners'),
  addBanner: (bannerData: Omit<Banner, 'id'>): Promise<Banner> => apiRequest('/banners', { method: 'POST', body: JSON.stringify(bannerData) }),
  updateBanner: (bannerId: string, updates: Partial<Banner>): Promise<Banner> => apiRequest(`/banners/${bannerId}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteBanner: (bannerId: string): Promise<void> => apiRequest(`/banners/${bannerId}`, { method: 'DELETE' }),

  // --- CHAT ---
  getChatMessages: (): Promise<ChatMessage[]> => apiRequest('/chatMessages'),
  postChatMessage: (message: { message: string }): Promise<ChatMessage> => apiRequest('/chatMessages', { method: 'POST', body: JSON.stringify(message) }),

  // --- NOTIFICATIONS ---
  getNotifications: (): Promise<AppNotification[]> => apiRequest('/notifications'),
  markNotificationsAsRead: (): Promise<void> => apiRequest('/notifications/read', { method: 'POST' }),

  // --- SETTINGS ---
  getSettings: (): Promise<AppSettings> => apiRequest('/settings'),
  updateSettings: (settings: AppSettings): Promise<AppSettings> => apiRequest('/settings', { method: 'PUT', body: JSON.stringify(settings) }),

  // --- EVENT TICKETS ---
  getEventTickets: (): Promise<Ticket[]> => apiRequest('/tickets'),
  purchaseTickets: (eventId: string, quantity: number): Promise<Ticket[]> => apiRequest('/tickets/purchase', { method: 'POST', body: JSON.stringify({ eventId, quantity }) }),
};
