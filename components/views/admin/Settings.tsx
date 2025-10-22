import React, { useState, useEffect } from 'react';
import { useData } from '../../../contexts/DataContext';
import { FileUpload } from '../../ui/FileUpload';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { DbType, AppSettings } from '../../../types';
import { WordpressDownloadModal } from '../../shared/WordpressDownloadModal';
import { MobileAppModal } from '../../shared/MobileAppModal';


const dbTypePorts: { [key in DbType]?: string } = {
    [DbType.MYSQL]: '3306',
    [DbType.POSTGRES]: '5432',
    [DbType.SQLSERVER]: '1433',
};

export const Settings: React.FC = () => {
    const { settings, updateSettings } = useData();
    const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
    const [testMessage, setTestMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
    const [isWpModalOpen, setIsWpModalOpen] = useState(false);
    const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);


    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const handleLogoSelect = (logoData: string) => {
        setLocalSettings(prev => ({ ...prev, logo: logoData }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleDbTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newDbType = e.target.value as DbType;
        setLocalSettings(prev => ({
            ...prev,
            dbType: newDbType,
            dbPort: dbTypePorts[newDbType] || '',
        }));
    };

    const handleSaveSettings = (message: string) => {
        updateSettings(localSettings);
        alert(message);
        setTestMessage(null);
    };
    
    const handleTestConnection = () => {
        setTestMessage(null);
        // Simulate API call
        setTimeout(() => {
            if (localSettings.dbType !== DbType.NONE && localSettings.dbHost && localSettings.dbUser && localSettings.dbName) {
                setTestMessage({type: 'success', text: 'Test di connessione riuscito!'});
            } else {
                setTestMessage({type: 'error', text: 'Test di connessione fallito. Controlla i parametri.'});
            }
        }, 1000);
    };

    const generateDbStructureContent = (): string => {
        const structures = {
            MySQL: `
-- ================================================= --
-- STRUTTURA DATABASE PER MYSQL                      --
-- ================================================= --

CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

CREATE TABLE events (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATETIME NOT NULL,
    location VARCHAR(255),
    image TEXT,
    totalTickets INT NOT NULL,
    ticketPrice DECIMAL(10, 2) NOT NULL
);

CREATE TABLE tickets (
    id VARCHAR(255) PRIMARY KEY,
    eventId VARCHAR(255) NOT NULL,
    userId VARCHAR(255) NOT NULL,
    purchaseDate DATETIME NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    qrCodeUrl TEXT,
    FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE articles (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    image TEXT,
    createdAt DATETIME NOT NULL
);

CREATE TABLE banners (
    id VARCHAR(255) PRIMARY KEY,
    clientName VARCHAR(255),
    imageUrl TEXT,
    targetUrl TEXT
);

CREATE TABLE chat_messages (
    id VARCHAR(255) PRIMARY KEY,
    userId VARCHAR(255) NOT NULL,
    userEmail VARCHAR(255),
    message TEXT,
    timestamp DATETIME NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE app_notifications (
    id VARCHAR(255) PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    relatedId VARCHAR(255),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    createdAt DATETIME NOT NULL
);
`,
            PostgreSQL: `
-- ================================================= --
-- STRUTTURA DATABASE PER POSTGRESQL                 --
-- ================================================= --

CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

CREATE TABLE events (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date TIMESTAMPTZ NOT NULL,
    location VARCHAR(255),
    image TEXT,
    totalTickets INTEGER NOT NULL,
    ticketPrice NUMERIC(10, 2) NOT NULL
);

CREATE TABLE tickets (
    id VARCHAR(255) PRIMARY KEY,
    eventId VARCHAR(255) NOT NULL,
    userId VARCHAR(255) NOT NULL,
    purchaseDate TIMESTAMPTZ NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    qrCodeUrl TEXT,
    CONSTRAINT fk_event FOREIGN KEY(eventId) REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE articles (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    image TEXT,
    createdAt TIMESTAMPTZ NOT NULL
);

CREATE TABLE banners (
    id VARCHAR(255) PRIMARY KEY,
    clientName VARCHAR(255),
    imageUrl TEXT,
    targetUrl TEXT
);

CREATE TABLE chat_messages (
    id VARCHAR(255) PRIMARY KEY,
    userId VARCHAR(255) NOT NULL,
    userEmail VARCHAR(255),
    message TEXT,
    timestamp TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_user_chat FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE app_notifications (
    id VARCHAR(255) PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    relatedId VARCHAR(255),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    createdAt TIMESTAMPTZ NOT NULL
);
`,
            SQLServer: `
-- ================================================= --
-- STRUTTURA DATABASE PER SQL SERVER                 --
-- ================================================= --

CREATE TABLE users (
    id NVARCHAR(255) PRIMARY KEY,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) NOT NULL
);

CREATE TABLE events (
    id NVARCHAR(255) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    date DATETIME2 NOT NULL,
    location NVARCHAR(255),
    image NVARCHAR(MAX),
    totalTickets INT NOT NULL,
    ticketPrice DECIMAL(10, 2) NOT NULL
);

CREATE TABLE tickets (
    id NVARCHAR(255) PRIMARY KEY,
    eventId NVARCHAR(255) NOT NULL,
    userId NVARCHAR(255) NOT NULL,
    purchaseDate DATETIME2 NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    qrCodeUrl NVARCHAR(MAX),
    FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE articles (
    id NVARCHAR(255) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    content NVARCHAR(MAX),
    image NVARCHAR(MAX),
    createdAt DATETIME2 NOT NULL
);

CREATE TABLE banners (
    id NVARCHAR(255) PRIMARY KEY,
    clientName NVARCHAR(255),
    imageUrl NVARCHAR(MAX),
    targetUrl NVARCHAR(MAX)
);

CREATE TABLE chat_messages (
    id NVARCHAR(255) PRIMARY KEY,
    userId NVARCHAR(255) NOT NULL,
    userEmail NVARCHAR(255),
    message NVARCHAR(MAX),
    timestamp DATETIME2 NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE app_notifications (
    id NVARCHAR(255) PRIMARY KEY,
    type NVARCHAR(50) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    relatedId NVARCHAR(255),
    is_read BIT NOT NULL DEFAULT 0,
    createdAt DATETIME2 NOT NULL
);
`
        };

        return `${structures.MySQL}\n\n${structures.PostgreSQL}\n\n${structures.SQLServer}`;
    };
    
    const generateFieldsListContent = (): string => {
        return `
ELENCO TABELLE E CAMPI DELL'APPLICAZIONE
=======================================

TABELLA: User
CAMPI:
- id: string
- email: string
- password?: string (opzionale, non inviato al client)
- role: Role ('ADMIN' | 'USER')

TABELLA: Event
CAMPI:
- id: string
- title: string
- description: string
- date: string (ISO)
- location: string
- image: string (Base64)
- totalTickets: number
- ticketPrice: number

TABELLA: Ticket
CAMPI:
- id: string
- eventId: string
- userId: string
- userEmail: string
- eventName: string
- eventDate: string
- purchaseDate: string
- price: number
- qrCodeUrl: string

TABELLA: Article
CAMPI:
- id: string
- title: string
- content: string
- image: string (Base64)
- createdAt: string (ISO)

TABELLA: Banner
CAMPI:
- id: string
- clientName: string
- imageUrl: string (Base64)
- targetUrl: string

TABELLA: ChatMessage
CAMPI:
- id: string
- userId: string
- userEmail: string
- message: string
- timestamp: string (ISO)

TABELLA: AppNotification
CAMPI:
- id: string
- type: NotificationType ('NEW_EVENT' | 'NEW_ARTICLE')
- message: string
- relatedId: string (ID evento o articolo)
- read: boolean
- createdAt: string (ISO)

TABELLA: AppSettings
CAMPI:
- logo: string (Base64)
- dbType?: DbType ('NONE' | 'MYSQL' | 'POSTGRES' | 'SQLSERVER')
- dbHost?: string
- dbPort?: string
- dbUser?: string
- dbPassword?: string
- dbName?: string
`;
    };

    const downloadTxtFile = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleDownloadStructure = () => {
        const content = generateDbStructureContent();
        downloadTxtFile(content, 'db_structure.txt');
    };

    const handleDownloadFieldsList = () => {
        const content = generateFieldsListContent();
        downloadTxtFile(content, 'app_fields_list.txt');
    };

    return (
        <>
        <div className="p-4 sm:p-6 lg:p-8">
             <div className="max-w-xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Impostazioni</h1>
                <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-8 space-y-8">
                    {/* Branding Section */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Branding</h2>
                        <FileUpload 
                            label="Logo Organizzazione"
                            onFileSelect={handleLogoSelect}
                            currentImageUrl={localSettings.logo}
                        />
                        <div>
                            <label htmlFor="welcomeText" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Testo di Benvenuto
                            </label>
                            <textarea 
                                id="welcomeText" 
                                name="welcomeText"
                                value={localSettings.welcomeText || ''} 
                                onChange={handleChange} 
                                rows={3}
                                className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            />
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Questo testo appare sulla schermata di benvenuto all'avvio dell'app.
                            </p>
                        </div>
                        <div className="pt-2">
                           <Button onClick={() => handleSaveSettings('Logo e messaggio di benvenuto salvati!')}>Salva Logo e Messaggio</Button>
                        </div>
                    </div>
                    
                    {/* Mobile App Section */}
                    <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Esporta App Mobile (iOS/Android)</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                           Trasforma questa applicazione in una vera app per iOS e Android usando Capacitor. Clicca il pulsante per ottenere un pacchetto di partenza e le istruzioni per la compilazione.
                        </p>
                        <Button onClick={() => setIsMobileModalOpen(true)} size="lg">Crea Pacchetto App Mobile</Button>
                    </div>

                    {/* WordPress Integration Section */}
                    <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Integrazione WordPress</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                           Trasforma questa applicazione in un plugin per il tuo sito WordPress. Clicca il pulsante qui sotto per ottenere tutto il codice necessario e le istruzioni per l'installazione.
                        </p>
                        <Button onClick={() => setIsWpModalOpen(true)} size="lg">Ottieni Plugin WordPress</Button>
                    </div>

                    {/* Database Section */}
                    <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Impostazioni Database Esterno</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            Queste impostazioni sono a scopo dimostrativo e servono per generare la documentazione per un backend esterno. Non si connettono a un database reale in questa versione dell'app.
                        </p>
                        
                        <div className="mb-6 flex flex-col sm:flex-row gap-2">
                             <Button onClick={handleDownloadStructure} variant="secondary" className="w-full sm:w-auto">Scarica Struttura DB (.txt)</Button>
                             <Button onClick={handleDownloadFieldsList} variant="secondary" className="w-full sm:w-auto">Scarica Elenco Campi (.txt)</Button>
                        </div>

                        <div>
                            <label htmlFor="dbType" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo di Database</label>
                            <select
                                id="dbType"
                                name="dbType"
                                value={localSettings.dbType}
                                onChange={handleDbTypeChange}
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            >
                                <option value={DbType.NONE}>Nessuno</option>
                                <option value={DbType.MYSQL}>MySQL</option>
                                <option value={DbType.POSTGRES}>PostgreSQL</option>
                                <option value={DbType.SQLSERVER}>SQL Server</option>
                            </select>
                        </div>

                        {localSettings.dbType !== DbType.NONE && (
                            <div className="space-y-4 mt-4">
                                <Input label="Host" name="dbHost" value={localSettings.dbHost} onChange={handleChange} placeholder="localhost" />
                                <Input label="Porta" name="dbPort" value={localSettings.dbPort} onChange={handleChange} placeholder="Porta DB" />
                                <Input label="Utente" name="dbUser" value={localSettings.dbUser} onChange={handleChange} placeholder="admin" />
                                <Input label="Password" name="dbPassword" type="password" value={localSettings.dbPassword} onChange={handleChange} placeholder="••••••••" />
                                <Input label="Nome Database" name="dbName" value={localSettings.dbName} onChange={handleChange} placeholder="ta25_db" />
                            
                                <div className="mt-6 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                                    <Button onClick={handleTestConnection} variant="secondary" className="w-full sm:w-auto">Test Connessione</Button>
                                    {testMessage && (
                                        <p className={`text-sm font-semibold ${testMessage.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {testMessage.text}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                     {/* Save Button */}
                     <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
                        <Button onClick={() => handleSaveSettings('Tutte le impostazioni sono state salvate!')} size="lg" className="w-full sm:w-auto">Salva Tutte le Impostazioni</Button>
                     </div>
                </div>
            </div>
        </div>
        <WordpressDownloadModal isOpen={isWpModalOpen} onClose={() => setIsWpModalOpen(false)} />
        <MobileAppModal isOpen={isMobileModalOpen} onClose={() => setIsMobileModalOpen(false)} />
        </>
    );
};