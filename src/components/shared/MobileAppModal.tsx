import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Download } from 'lucide-react';
import JSZip from 'jszip';
import { icon192, icon512 } from '../../assets/icons';

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-slate-800 text-slate-300 rounded-md p-3 text-sm my-2 overflow-x-auto">
        <code>{children}</code>
    </pre>
);

export const MobileAppModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const zip = new JSZip();
            
            // Root files
            zip.file('package.json', packageJsonContent);
            zip.file('capacitor.config.ts', capacitorConfigContent);
            zip.file('README.md', readmeContent);

            // www folder with placeholder
            const www = zip.folder('www');
            www.file('index.html', '<!DOCTYPE html><html><head><title>App</title></head><body><h1>La tua app compilata va qui</h1></body></html>');

            // Resources folder for icons/splash
            const resources = zip.folder('resources');
            resources.file('icon.png', icon512, { base64: true });
            resources.file('splash.png', icon512, { base64: true }); // Using same icon for splash as placeholder
            
            // Android resources
            const androidResources = resources.folder('android/icon');
            androidResources.file('mipmap-hdpi/ic_launcher.png', icon192, { base64: true });
            androidResources.file('mipmap-mdpi/ic_launcher.png', icon192, { base64: true });
            androidResources.file('mipmap-xhdpi/ic_launcher.png', icon192, { base64: true });
            androidResources.file('mipmap-xxhdpi/ic_launcher.png', icon512, { base64: true });
            androidResources.file('mipmap-xxxhdpi/ic_launcher.png', icon512, { base64: true });

            const content = await zip.generateAsync({ type: 'blob' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = 'ta25-mobile-app-starter.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

        } catch (error) {
            console.error("Error creating mobile app zip file", error);
            alert("Si è verificato un errore durante la creazione del file zip.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Genera App Mobile (iOS/Android) con Capacitor">
            <div className="max-h-[70vh] overflow-y-auto pr-2 text-sm text-slate-600 dark:text-slate-300">
                <p className="mb-4">
                    Questa guida ti aiuterà a impacchettare la tua applicazione web in un'app nativa per iOS e Android.
                    Scarica il pacchetto base, che include la configurazione necessaria, e segui i passaggi.
                </p>

                <Button onClick={handleDownload} disabled={isDownloading} size="lg" className="w-full mb-6">
                    <Download className="w-5 h-5 mr-2" />
                    {isDownloading ? 'Creazione in corso...' : 'Scarica Pacchetto Base (.zip)'}
                </Button>

                <div className="space-y-6 prose prose-sm dark:prose-invert max-w-none">
                    <h4>Passo 1: Prerequisiti</h4>
                    <p>Assicurati di avere installato sul tuo computer:</p>
                    <ul>
                        <li><a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer">Node.js</a> (LTS)</li>
                        <li>Per lo sviluppo Android: <a href="https://developer.android.com/studio" target="_blank" rel="noopener noreferrer">Android Studio</a></li>
                        <li>Per lo sviluppo iOS (solo su macOS): <a href="https://developer.apple.com/xcode/" target="_blank" rel="noopener noreferrer">Xcode</a></li>
                    </ul>

                    <h4>Passo 2: Prepara la tua App Web</h4>
                    <p>Prima di procedere, devi compilare la tua applicazione React in una cartella di file statici (solitamente chiamata `dist` o `build`).</p>
                    <CodeBlock>npm run build</CodeBlock>
                    <p>Dopo la compilazione, copia **tutto il contenuto** della cartella `dist` (o `build`) e incollalo nella cartella `www` del pacchetto che hai scaricato.</p>
                    
                    <h4>Passo 3: Installa Dipendenze e Capacitor</h4>
                    <p>Apri un terminale nella cartella del pacchetto scaricato ed esegui questi comandi:</p>
                    <CodeBlock>
                        # Installa le dipendenze definite in package.json
                        <br />
                        npm install
                    </CodeBlock>
                    
                    <h4>Passo 4: Aggiungi le Piattaforme Native</h4>
                    <p>Ora, crea i progetti nativi per iOS e Android:</p>
                     <CodeBlock>
                        # Per Android
                        <br />
                        npx cap add android
                        <br /><br />
                        # Per iOS (solo su macOS)
                        <br />
                        npx cap add ios
                    </CodeBlock>
                    
                    <h4>Passo 5: Apri e Compila i Progetti Nativi</h4>
                    <p>Infine, apri i progetti in Android Studio o Xcode per compilarli, testarli su emulatori e dispositivi fisici.</p>
                     <CodeBlock>
                        # Per aprire in Android Studio
                        <br />
                        npx cap open android
                        <br /><br />
                        # Per aprire in Xcode (solo su macOS)
                        <br />
                        npx cap open ios
                    </CodeBlock>
                    <p>Da qui in poi, segui le guide ufficiali di Google e Apple per la pubblicazione delle app sugli store.</p>
                </div>
            </div>
        </Modal>
    );
};


const capacitorConfigContent = `import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ta25.app',
  appName: 'TA25 APP',
  webDir: 'www',
  bundledWebRuntime: false,
};

export default config;
`;

const packageJsonContent = `{
  "name": "ta25-mobile-app",
  "version": "1.0.0",
  "private": true,
  "description": "Mobile app wrapper for TA25 App",
  "scripts": {
    "dev": "echo 'Run your web app dev server'",
    "build": "echo 'Build your web app and copy to www folder'",
    "sync": "npx cap sync"
  },
  "dependencies": {
    "@capacitor/android": "^6.0.0",
    "@capacitor/core": "^6.0.0",
    "@capacitor/ios": "^6.0.0"
  },
  "devDependencies": {
    "@capacitor/cli": "^6.0.0"
  }
}
`;

const readmeContent = `
# TA25 Mobile App Starter Kit

Questo è un progetto base Capacitor per impacchettare la tua applicazione web TA25 in un'app nativa per iOS e Android.

## Guida Rapida

1.  **Compila la tua App Web**: Esegui il comando di build del tuo progetto React/Vue/etc. (es. \`npm run build\`).
2.  **Copia i File**: Copia tutti i file dalla cartella di output (es. \`dist\`) nella cartella \`www\` di questo progetto.
3.  **Installa Dipendenze**: Apri un terminale qui e lancia \`npm install\`.
4.  **Aggiungi Piattaforme**:
    *   Per Android: \`npx cap add android\`
    *   Per iOS (solo su macOS): \`npx cap add ios\`
5.  **Sincronizza**: Ogni volta che aggiorni il codice web (e lo ricompili nella cartella \`www\`), esegui \`npx cap sync\`.
6.  **Apri e Compila**:
    *   Per Android: \`npx cap open android\`
    *   Per iOS: \`npx cap open ios\`

Da Android Studio o Xcode, potrai compilare, testare e distribuire la tua applicazione.
`;