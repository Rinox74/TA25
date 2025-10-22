

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum DbType {
  NONE = 'NONE',
  MYSQL = 'MYSQL',
  POSTGRES = 'POSTGRES',
  SQLSERVER = 'SQLSERVER',
}

export interface User {
  id: string;
  email: string;
  password?: string; // Optional because we don't send it back to the client
  role: Role;
  firstName?: string;
  lastName?: string;
  company?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image: string; // Base64 encoded image
  totalTickets: number;
  ticketPrice: number;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  image: string; // Base64 encoded image
  createdAt: string;
}

export interface Banner {
  id: string;
  clientName: string;
  imageUrl: string; // Base64 encoded image
  targetUrl: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userEmail: string;
  message: string;
  timestamp: string;
}

export interface Ticket {
  id: string;
  eventId: string;
  userId: string;
  userEmail: string;
  eventName: string;
  eventDate: string;
  purchaseDate: string;
  price: number;
  qrCodeUrl: string;
}

export enum NotificationType {
  NEW_EVENT = 'NEW_EVENT',
  NEW_ARTICLE = 'NEW_ARTICLE',
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  relatedId: string; // ID of the event or article
  is_read: boolean;
  createdAt: string;
}

export interface AppSettings {
    logo: string; // Base64 encoded image
    welcomeText?: string;
    dbType?: DbType;
    dbHost?: string;
    dbPort?: string;
    dbUser?: string;
    dbPassword?: string;
    dbName?: string;
}