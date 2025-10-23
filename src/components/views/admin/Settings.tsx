import React, { useState, useEffect } from 'react';
import { useData } from '../../../contexts/DataContext';
import { FileUpload } from '../../ui/FileUpload';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { DbType, AppSettings } from '../../../types';
import { WordpressDownloadModal } from '../../shared/WordpressDownloadModal';
import { MobileAppModal } from '../../shared/MobileAppModal';
import { apiService } from '../../../services/apiService';


const dbTypePorts: { [key in DbType]?: string } = {
    [DbType.MYSQL]: '3306',
    [DbType.POSTGRES]: '5432',
    [DbType.SQLSERVER]: '1433',
};

export const Settings: React.FC = () => {
    const { settings, updateSettings } = useData();
    const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
    const [testMessage, setTestMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
    const [setupMessage, setSetupMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
    const [isSettingUpDb, setIsSettingUpDb] = useState(false);
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
        setSetupMessage(null);
    };
    
    const handleTestConnection = async () => {
        setTestMessage({type: 'error', text: 'Test in corso...'});
        setSetupMessage(null);
        try {
            // Usa l'endpoint di setup con una flag di test per evitare la creazione
            // Questo endpoint ora effettua una vera connessione
            await apiService.setupDatabase({ ...localSettings, dbType: localSettings.dbType });
             setTestMessage({type: 'success', text: 'Test di connessione riuscito!'});
        } catch (error) {
            setTestMessage({type: 'error', text: `Test fallito: ${(error as Error).message}`});
        }
    };

    const handleSetupDatabase = async () => {
        if (!window.confirm("Sei sicuro? Questa operazione tenterà di creare le tabelle nel database specificato. Assicurati che il database esista e sia vuoto.")) {
            return;
        }
        setIsSettingUpDb(true);
        setSetupMessage(null);
        setTestMessage(null);
        try {
            const response = await apiService.setupDatabase(localSettings);
            setSetupMessage({ type: 'success', text: response.message });
        } catch (error) {
            setSetupMessage({ type: 'error', text: (error as Error).message });
        } finally {
            setIsSettingUpDb(false);
        }
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
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Setup Database</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            Usa questa sezione per creare la struttura di tabelle necessaria nel tuo database vuoto. Inserisci le credenziali, testa la connessione e poi clicca su "Crea Struttura Database".
                        </p>

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
                                <Input label="Host" name="dbHost" value={localSettings.dbHost || ''} onChange={handleChange} />
                                <Input label="Porta" name="dbPort" value={localSettings.dbPort || ''} onChange={handleChange} />
                                <Input label="Utente" name="dbUser" value={localSettings.dbUser || ''} onChange={handleChange} />
                                <Input label="Password" name="dbPassword" type="password" value={localSettings.dbPassword || ''} onChange={handleChange} />
                                <Input label="Nome Database" name="dbName" value={localSettings.dbName || ''} onChange={handleChange} />
                            
                                <div className="mt-6">
                                    <div className="flex flex-col sm:flex-row items-center gap-2">
                                        <Button onClick={handleTestConnection} variant="secondary" className="w-full sm:w-auto">Test Connessione</Button>
                                        <Button 
                                            onClick={handleSetupDatabase} 
                                            disabled={isSettingUpDb}
                                            className="w-full sm:w-auto"
                                        >
                                            {isSettingUpDb ? 'Creazione in corso...' : 'Crea Struttura Database'}
                                        </Button>
                                    </div>
                                    {testMessage && (
                                        <p className={`mt-4 text-sm font-semibold ${testMessage.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {testMessage.text}
                                        </p>
                                    )}
                                    {setupMessage && (
                                        <p className={`mt-4 text-sm font-semibold ${setupMessage.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {setupMessage.text}
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