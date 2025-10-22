import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../../contexts/DataContext';
import { Role, User } from '../../types';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { EventForm } from '../forms/EventForm';
import { ArticleForm } from '../forms/ArticleForm';
import { BannerForm } from '../forms/BannerForm';
import { UserForm } from '../forms/UserForm';
import { apiService } from '../../services/apiService';

type ManagementType = 'event' | 'article' | 'banner' | 'user';

const typeConfig = {
    event: { title: 'Eventi', addLabel: 'Aggiungi Evento' },
    article: { title: 'Articoli', addLabel: 'Aggiungi Articolo' },
    banner: { title: 'Banner', addLabel: 'Aggiungi Banner' },
    user: { title: 'Utenti', addLabel: 'Aggiungi Utente' },
};

interface ManagementViewProps {
    type: ManagementType;
}

export const ManagementView: React.FC<ManagementViewProps> = ({ type }) => {
    const { 
        events, addEvent, updateEvent, deleteEvent,
        articles, addArticle, updateArticle, deleteArticle,
        banners, addBanner, updateBanner, deleteBanner,
        users, addUser, updateUser, deleteUser,
        eventTickets,
        fetchData,
    } = useData();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const openModal = (item: any = null) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setEditingItem(null);
        setIsModalOpen(false);
    };
    
    const handleSubmit = async (data: any) => {
        try {
            if (editingItem) {
                switch(type) {
                    case 'event': await updateEvent(editingItem.id, data); break;
                    case 'article': await updateArticle(editingItem.id, data); break;
                    case 'banner': await updateBanner(editingItem.id, data); break;
                    case 'user': await updateUser(editingItem.id, data); break;
                }
            } else {
                 switch(type) {
                    case 'event': await addEvent(data); break;
                    case 'article': await addArticle(data); break;
                    case 'banner': await addBanner(data); break;
                    case 'user': await addUser(data); break;
                }
            }
        } catch (error) {
            console.error(`Failed to save ${type}`, error);
            alert(`Errore nel salvataggio. Controlla la console per i dettagli.`);
        }
        closeModal();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm(`Sei sicuro di voler eliminare questo ${type}?`)) {
             try {
                 switch(type) {
                    case 'event': await deleteEvent(id); break;
                    case 'article': await deleteArticle(id); break;
                    case 'banner': await deleteBanner(id); break;
                    case 'user': await deleteUser(id); break;
                }
            } catch (error) {
                console.error(`Failed to delete ${type}`, error);
                alert(`Errore nell'eliminazione. Controlla la console per i dettagli.`);
            }
        }
    };

    const handleExportCSV = () => {
        const dataMap = { event: events, article: articles, banner: banners, user: users };
        const data = dataMap[type];
        if (!data || data.length === 0) {
            alert('Nessun dato da esportare.');
            return;
        }
    
        const escapeCSV = (value: any): string => {
            const stringValue = String(value ?? '');
            if (/[",\n]/.test(stringValue)) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        };
        
        let headers: string[] = [];
        let rows: string[][] = [];
    
        switch(type) {
            case 'event':
                headers = ['ID', 'Titolo', 'Data', 'Luogo', 'Biglietti Totali', 'Prezzo Biglietto', 'Biglietti Venduti'];
                rows = (data as any[]).map(item => {
                    const soldTickets = eventTickets.filter(t => t.eventId === item.id).length;
                    return [
                        item.id,
                        item.title,
                        new Date(item.date).toISOString(),
                        item.location,
                        item.totalTickets.toString(),
                        item.ticketPrice.toString(),
                        soldTickets.toString()
                    ];
                });
                break;
            case 'article':
                headers = ['ID', 'Titolo', 'Contenuto', 'Data Creazione'];
                rows = (data as any[]).map(item => [
                    item.id,
                    item.title,
                    item.content,
                    new Date(item.createdAt).toISOString()
                ]);
                break;
            case 'banner':
                headers = ['ID', 'Nome Cliente', 'URL Destinazione'];
                rows = (data as any[]).map(item => [
                    item.id,
                    item.clientName,
                    item.targetUrl,
                ]);
                break;
            case 'user':
                headers = ['ID', 'Email', 'Nome', 'Cognome', 'Azienda', 'Ruolo'];
                rows = (data as any[]).map(item => [
                    item.id,
                    item.email,
                    item.firstName || '',
                    item.lastName || '',
                    item.company || '',
                    item.role
                ]);
                break;
        }
    
        const csvContent = [
            headers.map(escapeCSV).join(','),
            ...rows.map(row => row.map(escapeCSV).join(','))
        ].join('\n');
    
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${type}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleImportCSVClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target?.result as string;
                if (!text) {
                    alert('File vuoto o illeggibile.');
                    return;
                }

                const parseCsvWithHeaders = (csvText: string): Record<string, string>[] => {
                    const lines = csvText.trim().split(/\r\n|\n/);
                    if (lines.length < 2) return [];
                    const rawHeaders = lines.shift()!.replace(/^\uFEFF/, ''); // Remove BOM
                    const headers = rawHeaders.split(',').map(h => h.trim());

                    return lines.filter(line => line.trim()).map(line => {
                        const values: string[] = [];
                        let inQuotes = false;
                        let field = '';
                        for (let i = 0; i < line.length; i++) {
                            const char = line[i];
                            if (char === '"') {
                                if (inQuotes && line[i + 1] === '"') {
                                    field += '"';
                                    i++;
                                } else {
                                    inQuotes = !inQuotes;
                                }
                            } else if (char === ',' && !inQuotes) {
                                values.push(field);
                                field = '';
                            } else {
                                field += char;
                            }
                        }
                        values.push(field);

                        const rowObject: Record<string, string> = {};
                        headers.forEach((header, index) => {
                            rowObject[header] = values[index] || '';
                        });
                        return rowObject;
                    });
                };

                const dataToImport = parseCsvWithHeaders(text);

                if (dataToImport.length === 0) {
                    alert('Nessun dato da importare trovato nel file.');
                    return;
                }
                
                await processImportedData(dataToImport);

            } catch (error) {
                console.error("Errore durante l'importazione del CSV:", error);
                alert("Si è verificato un errore durante l'importazione. Controlla la console per i dettagli e assicurati che il formato del file sia corretto.");
            }
        };

        reader.readAsText(file, 'UTF-8');
        
        if (event.target) {
            event.target.value = '';
        }
    };

    const processImportedData = async (data: Record<string, string>[]) => {
        let successCount = 0;
        let errorCount = 0;

        for (const item of data) {
            try {
                switch(type) {
                    case 'event':
                        if (!item['Titolo'] || !item['Data'] || !item['Luogo']) throw new Error('Dati evento mancanti.');
                        await apiService.addEvent({
                            title: item['Titolo'],
                            description: item['Descrizione'] || '',
                            date: new Date(item['Data']).toISOString(),
                            location: item['Luogo'],
                            image: `https://picsum.photos/seed/imported${Date.now()}/800/400`,
                            totalTickets: parseInt(item['Biglietti Totali'] || '100', 10),
                            ticketPrice: parseFloat(item['Prezzo Biglietto'] || '0')
                        });
                        break;
                    case 'article':
                        if (!item['Titolo'] || !item['Contenuto']) throw new Error('Dati articolo mancanti.');
                        await apiService.addArticle({
                            title: item['Titolo'],
                            content: item['Contenuto'],
                            image: `https://picsum.photos/seed/imported${Date.now()}/800/400`
                        });
                        break;
                    case 'banner':
                        if (!item['Nome Cliente'] || !item['URL Destinazione']) throw new Error('Dati banner mancanti.');
                        await apiService.addBanner({
                            clientName: item['Nome Cliente'],
                            targetUrl: item['URL Destinazione'],
                            imageUrl: `https://picsum.photos/seed/imported${Date.now()}/600/100`
                        });
                        break;
                    case 'user':
                        if (!item['Email'] || !item['Ruolo']) throw new Error('Dati utente mancanti.');
                        await apiService.addUser({
                            email: item['Email'],
                            role: item['Ruolo'].toUpperCase() as Role,
                            password: 'password_da_cambiare',
                            firstName: item['Nome'] || '',
                            lastName: item['Cognome'] || '',
                            company: item['Azienda'] || '',
                        });
                        break;
                }
                successCount++;
            } catch (err) {
                console.error('Errore importando la riga:', item, err);
                errorCount++;
            }
        }
        
        await fetchData();

        let finalMessage = `Importazione completata.\nSuccessi: ${successCount}\nErrori: ${errorCount}`;
        if (type === 'user' && successCount > 0) {
            finalMessage += '\n\nAgli utenti importati è stata assegnata una password temporanea: "password_da_cambiare".';
        }
        alert(finalMessage);
    };
    
    const renderForm = () => {
        switch(type) {
            case 'event': return <EventForm onSubmit={handleSubmit} onCancel={closeModal} eventToEdit={editingItem} />;
            case 'article': return <ArticleForm onSubmit={handleSubmit} onCancel={closeModal} articleToEdit={editingItem} />;
            case 'banner': return <BannerForm onSubmit={handleSubmit} onCancel={closeModal} bannerToEdit={editingItem} />;
            case 'user': return <UserForm onSubmit={handleSubmit} onCancel={closeModal} userToEdit={editingItem} />;
        }
    };

    const renderTable = () => {
        const dataMap = { event: events, article: articles, banner: banners, user: users };
        const data = dataMap[type];
        
        const headersMap = {
            event: ['Titolo', 'Data', 'Biglietti Venduti'],
            article: ['Titolo', 'Data Creazione'],
            banner: ['Cliente', 'URL'],
            user: ['Email', 'Nome', 'Cognome', 'Azienda', 'Ruolo']
        };
        const headers = headersMap[type];

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-700">
                        <tr>
                            {headers.map(header => (
                                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{header}</th>
                            ))}
                            <th className="relative px-6 py-3"><span className="sr-only">Azioni</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {data.map((item: any) => (
                            <tr key={item.id}>
                                {type === 'event' && <>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{item.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{new Date(item.date).toLocaleDateString('it-IT')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{eventTickets.filter(t => t.eventId === item.id).length} / {item.totalTickets}</td>
                                </>}
                                 {type === 'article' && <>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{item.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{new Date(item.createdAt).toLocaleDateString('it-IT')}</td>
                                </>}
                                {type === 'banner' && <>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{item.clientName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 truncate max-w-xs">{item.targetUrl}</td>
                                </>}
                                {type === 'user' && <>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{item.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{item.firstName || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{item.lastName || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{item.company || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{item.role}</td>
                                </>}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <Button size="sm" variant="secondary" onClick={() => openModal(item)}>Modifica</Button>
                                    <Button size="sm" variant="danger" onClick={() => handleDelete(item.id)}>Elimina</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Gestione {typeConfig[type].title}</h1>
                <div className="flex items-center space-x-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileImport}
                        accept=".csv"
                        className="hidden"
                    />
                    <Button onClick={handleImportCSVClick} variant="secondary">Importa CSV</Button>
                    <Button onClick={handleExportCSV} variant="secondary">Esporta CSV</Button>
                    <Button onClick={() => openModal()}>{typeConfig[type].addLabel}</Button>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-hidden">
                {renderTable()}
            </div>
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItem ? `Modifica ${type}` : `Nuovo ${type}`}>
                {renderForm()}
            </Modal>
        </div>
    );
};

// Minimal UserForm component to be defined in the same file as it's only used here.
interface UserFormProps {
  onSubmit: (user: Partial<User>) => void;
  onCancel: () => void;
  userToEdit?: User | null;
}

const UserForm: React.FC<UserFormProps> = ({ onSubmit, onCancel, userToEdit }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<Role>(Role.USER);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [company, setCompany] = useState('');


    useEffect(() => {
        if (userToEdit) {
            setEmail(userToEdit.email);
            setRole(userToEdit.role);
            setFirstName(userToEdit.firstName || '');
            setLastName(userToEdit.lastName || '');
            setCompany(userToEdit.company || '');
            setPassword('');
        } else {
            setEmail('');
            setPassword('');
            setRole(Role.USER);
            setFirstName('');
            setLastName('');
            setCompany('');
        }
    }, [userToEdit]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const userData: Partial<User> = { email, role, firstName, lastName, company };
        if (password) {
            userData.password = password;
        }
        if (!userToEdit && !password) {
            alert("La password è obbligatoria per i nuovi utenti.");
            return;
        }
        onSubmit(userData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <label>
                Azienda
                <input type="text" value={company} onChange={e => setCompany(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
            </label>
             <label>
                Nome
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
            </label>
            <label>
                Cognome
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
            </label>
            <label>
                Email
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required 
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
            </label>
            <label>
                Password ({userToEdit ? 'lascia vuoto per non modificare' : 'obbligatoria'})
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            </label>
            <label>
                Ruolo
                <select value={role} onChange={e => setRole(e.target.value as Role)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                    <option value={Role.USER}>User</option>
                    <option value={Role.ADMIN}>Admin</option>
                </select>
            </label>
             <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="secondary" onClick={onCancel}>Annulla</Button>
                <Button type="submit">{userToEdit ? 'Salva Modifiche' : 'Crea Utente'}</Button>
            </div>
        </form>
    );
};