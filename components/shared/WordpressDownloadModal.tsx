import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Download } from 'lucide-react';
import JSZip from 'jszip';

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-slate-800 text-slate-300 rounded-md p-3 text-sm my-2 overflow-x-auto">
        <code>{children}</code>
    </pre>
);

export const WordpressDownloadModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const zip = new JSZip();
            
            // Root PHP file
            zip.file('ta25-app-plugin.php', phpPluginContent);
            zip.file('readme.txt', readmeContent);
            zip.file('app-template.php', phpTemplateContent);

            // app-build folder with placeholder
            const appBuild = zip.folder('app-build');
            appBuild.file('placeholder.txt', 'Please run `npm run build` in your React project and copy the contents of the `build` (or `dist`) folder here. Make sure to include the asset-manifest.json file.');

            const content = await zip.generateAsync({ type: 'blob' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = 'ta25-app-plugin.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

        } catch (error) {
            console.error("Error creating WordPress plugin zip file", error);
            alert("Si è verificato un errore durante la creazione del file zip.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Genera Plugin WordPress">
            <div className="max-h-[70vh] overflow-y-auto pr-2 text-sm text-slate-600 dark:text-slate-300">
                <p className="mb-4">
                    Installa questo plugin per sostituire automaticamente la homepage del tuo sito WordPress con la tua applicazione.
                </p>

                <Button onClick={handleDownload} disabled={isDownloading} size="lg" className="w-full mb-6">
                    <Download className="w-5 h-5 mr-2" />
                    {isDownloading ? 'Creazione in corso...' : 'Scarica Plugin (.zip)'}
                </Button>

                <div className="space-y-6 prose prose-sm dark:prose-invert max-w-none">
                    <h4>Passo 1: Compila la tua App</h4>
                    <p>Prima di tutto, compila la tua applicazione React per la produzione:</p>
                    <CodeBlock>npm run build</CodeBlock>
                    
                    <h4>Passo 2: Aggiungi i File Compilati</h4>
                    <p>Decomprimi il file `.zip` che hai scaricato. Copia **tutto il contenuto** della cartella `dist` (o `build`) della tua app e incollalo nella cartella `app-build` del plugin.</p>
                    <p className="font-semibold">È fondamentale che il file `asset-manifest.json` sia presente, altrimenti il plugin non funzionerà.</p>

                    <h4>Passo 3: Installa e Attiva</h4>
                    <p>Comprimi nuovamente la cartella del plugin in un file `.zip`. Dal pannello di amministrazione di WordPress, vai su `Plugin - Aggiungi Nuovo - Carica Plugin` e carica il file zip. Infine, attivalo.</p>

                    <p className="text-lg font-bold">Fatto! L'applicazione è ora la tua homepage.</p>
                    <p>Visitando il tuo sito, vedrai l'applicazione React caricata al posto del tuo tema. Non è richiesta nessun'altra configurazione.</p>

                </div>
            </div>
        </Modal>
    );
};

const phpTemplateContent = `<?php
/**
 * TA25 App Barebone Template
 * This file provides the basic HTML structure for the React app.
 */
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><?php wp_title( '|', true, 'right' ); ?></title>
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root">
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; color: #333;">
            <p>Caricamento applicazione...</p>
        </div>
    </div>
    <?php wp_footer(); ?>
</body>
</html>
`;

const phpPluginContent = `<?php
/**
 * Plugin Name:       TA25 App Integration
 * Plugin URI:        https://ta25.it/
 * Description:       Sostituisce la homepage di WordPress con l'applicazione React TA25.
 * Version:           3.1.0
 * Author:            TA25
 * Author URI:        https://ta25.it/
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       ta25-app
 */

if ( ! defined( 'WPINC' ) ) {
    die;
}

define( 'TA25_APP_VERSION', '3.1.0' );
define( 'TA25_APP_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'TA25_APP_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/**
 * Carica gli script e gli stili dell'applicazione React.
 * Questa funzione viene eseguita sull'hook 'wp_enqueue_scripts'.
 */
function ta25_app_enqueue_assets() {
    // Eseguiamo il caricamento solo se stiamo per visualizzare la nostra app.
    // L'uso di is_front_page() qui è affidabile perché 'wp_enqueue_scripts'
    // viene eseguito dopo che la query principale di WordPress è stata impostata.
    if ( ! is_front_page() ) {
        return;
    }

    $manifest_path = TA25_APP_PLUGIN_DIR . 'app-build/asset-manifest.json';

    if ( ! file_exists( $manifest_path ) ) {
        if ( current_user_can( 'manage_options' ) ) {
           error_log('TA25 App Plugin Error: asset-manifest.json non trovato. Assicurati di aver copiato i file di build nella cartella /app-build/.');
        }
        return;
    }

    $asset_file = json_decode( file_get_contents( $manifest_path ), true );
    $entrypoints = $asset_file['entrypoints'] ?? [];

    if ( empty($entrypoints) ) {
        if ( current_user_can( 'manage_options' ) ) {
           error_log('TA25 App Plugin Error: La chiave "entrypoints" non è stata trovata o è vuota in asset-manifest.json. La tua build potrebbe non essere compatibile.');
        }
        return;
    }

    // Enqueue CSS files
    foreach ( $entrypoints as $file ) {
        if ( substr( $file, -4 ) === '.css' ) {
            wp_enqueue_style( 'ta25-app-' . sanitize_title(basename($file)), TA25_APP_PLUGIN_URL . 'app-build/' . $file, [], TA25_APP_VERSION );
        }
    }

    // Enqueue JS files
    $main_js_handle = null;
    foreach ( $entrypoints as $file ) {
        if ( substr( $file, -3 ) === '.js' ) {
            $handle = 'ta25-app-' . sanitize_title(basename($file));
            // Il 'true' finale mette lo script nel footer
            wp_enqueue_script( $handle, TA25_APP_PLUGIN_URL . 'app-build/' . $file, [], TA25_APP_VERSION, true );
            if ( is_null( $main_js_handle ) ) {
                $main_js_handle = $handle;
            }
        }
    }
    
    // Passa i dati dell'utente loggato all'applicazione React
    if ( $main_js_handle ) {
        $user_data = null;
        if ( is_user_logged_in() ) {
            $current_user = wp_get_current_user();
            $user_data = [
                'id'        => 'wp-user-' . $current_user->ID,
                'email'     => $current_user->user_email,
                'firstName' => $current_user->user_firstname,
                'lastName'  => $current_user->user_lastname,
                'company'   => get_user_meta($current_user->ID, 'billing_company', true),
                'role'      => in_array( 'administrator', (array) $current_user->roles ) ? 'ADMIN' : 'USER',
            ];
        }
        
        // Usiamo wp_localize_script per passare i dati in modo sicuro
        wp_localize_script($main_js_handle, 'ta25_app_vars', ['currentUser' => $user_data]);
    }
}
add_action( 'wp_enqueue_scripts', 'ta25_app_enqueue_assets' );

/**
 * Filtra il file di template da caricare.
 * Se siamo sulla homepage, carichiamo il nostro template base per l'app.
 * Questo è il modo standard e più pulito per bypassare il tema.
 */
function ta25_app_template_include( $template ) {
    if ( is_front_page() ) {
        $app_template = TA25_APP_PLUGIN_DIR . 'app-template.php';
        if ( file_exists( $app_template ) ) {
            return $app_template;
        }
    }
    // Per tutte le altre pagine, usa il template del tema
    return $template;
}
add_filter( 'template_include', 'ta25_app_template_include', 99 );
`;

const readmeContent = `=== TA25 App Integration ===
Contributors: TA25
Requires at least: 5.0
Tested up to: 6.5
Stable tag: 3.1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Sostituisce la homepage di WordPress con l'applicazione React TA25 utilizzando il metodo standard 'template_include' per la massima stabilità.

== Description ==

Questo plugin rende l'integrazione della tua applicazione React un gioco da ragazzi. Una volta attivato, prenderà il controllo della tua homepage e caricherà l'applicazione al posto del tuo tema, senza bisogno di alcuna configurazione manuale. Questa versione utilizza il metodo 'template_include' di WordPress per la massima compatibilità con tutti i temi e plugin.

== Installation ==

1.  **Compila la tua App**: Esegui \`npm run build\` nel tuo progetto React.
2.  **Copia i File**: Copia TUTTO il contenuto della cartella \`build\` (o \`dist\`) nella cartella \`app-build\` di questo plugin.
3.  **Carica e Attiva**: Zippa la cartella del plugin, caricala su WordPress tramite "Plugin > Aggiungi Nuovo", e attivala.
4.  **Fatto**: La tua homepage ora è l'applicazione React.

== User Integration ==

Se un utente è loggato in WordPress, i suoi dati base (email, nome, ruolo) verranno passati automaticamente all'app per un'esperienza di accesso unificata.
`;