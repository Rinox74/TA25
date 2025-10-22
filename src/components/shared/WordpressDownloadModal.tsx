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
            
            const pluginFolder = zip.folder('ta25-app-plugin');

            // Root PHP file
            pluginFolder.file('ta25-app-plugin.php', phpPluginContent);
            pluginFolder.file('readme.txt', readmeContent);
            pluginFolder.file('app-loader.php', phpLoaderContent);

            // app-build folder with placeholder
            const appBuild = pluginFolder.folder('app-build');
            appBuild.file('placeholder.txt', 'Please run `npm run build` in your React project and copy the contents of the `dist` folder here. Make sure to include the asset-manifest.json file.');

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
                    <p>Comprimi nuovamente la cartella del plugin in un file `.zip`. Dal pannello di amministrazione di WordPress, vai su <code>Plugin &gt; Aggiungi Nuovo &gt; Carica Plugin</code> e carica il file zip. Infine, attivalo.</p>

                    <p className="text-lg font-bold">Fatto! L'applicazione è ora la tua homepage.</p>
                    <p>Visitando il tuo sito, vedrai l'applicazione React caricata al posto del tuo tema. Non è richiesta nessun'altra configurazione.</p>

                </div>
            </div>
        </Modal>
    );
};

const phpLoaderContent = `<?php
/**
 * TA25 App Loader
 * This file acts as the index.html for the React app,
 * dynamically injecting the correct script and style tags.
 */
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><?php wp_title( '|', true, 'right' ); ?></title>
    <?php
        $manifest_path = plugin_dir_path( __FILE__ ) . 'app-build/asset-manifest.json';
        if ( ! file_exists( $manifest_path ) ) {
            if ( current_user_can( 'manage_options' ) ) {
                echo '<!-- TA25 App Plugin Error: asset-manifest.json non trovato. -->';
            }
            // Fallback styles
            echo '<style>body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; } .error-msg { max-width: 600px; padding: 20px; border: 1px solid #d9534f; background: #f2dede; color: #a94442; border-radius: 4px; }</style>';
        } else {
            $manifest_data = json_decode( file_get_contents( $manifest_path ), true );
            $base_url = plugin_dir_url( __FILE__ ) . 'app-build/';

            // Vite uses a specific entry key, usually 'index.html' or 'src/index.tsx'
            $entry_key = null;
            foreach ($manifest_data as $key => $chunk) {
                if (is_array($chunk) && isset($chunk['isEntry']) && $chunk['isEntry'] === true) {
                    $entry_key = $key;
                    break;
                }
            }
             if (!$entry_key) { // Fallback for older Vite manifests or create-react-app
                if (isset($manifest_data['entrypoints'])) { // create-react-app
                    foreach ($manifest_data['entrypoints'] as $file) {
                        if (substr($file, -4) === '.css') {
                             echo '<link rel="stylesheet" href="' . esc_url( $base_url . $file ) . '">';
                        }
                    }
                } else if (isset($manifest_data['index.html'])) { // older vite
                    $entry_key = 'index.html';
                } else {
                    $entry_key = 'src/index.tsx';
                }
             }

            if ($entry_key && isset($manifest_data[$entry_key]) && isset($manifest_data[$entry_key]['css'])) {
                foreach ( $manifest_data[$entry_key]['css'] as $css_file ) {
                    echo '<link rel="stylesheet" href="' . esc_url( $base_url . $css_file ) . '">';
                }
            }
        }
        // Allows other plugins to add to head if needed, though we bypass most of WP
        do_action('wp_head');
    ?>
</head>
<body <?php body_class(); ?>>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root">
        <?php
             if ( ! file_exists( $manifest_path ) ) {
                 if( current_user_can('manage_options') ) {
                     echo '<div class="error-msg"><strong>Errore Plugin TA25 App:</strong><br>File <code>asset-manifest.json</code> non trovato. Assicurati di aver compilato l\\'app (<code>npm run build</code>) e di aver copiato il contenuto della cartella <code>dist</code> in <code>wp-content/plugins/ta25-app-plugin/app-build/</code>.</div>';
                 } else {
                     echo '<div>Caricamento...</div>';
                 }
             } else {
                 echo '<div>Caricamento applicazione...</div>';
             }
        ?>
    </div>

    <?php
        // Inject user data for the app to use
        $user_data = null;
        if ( is_user_logged_in() ) {
            $current_user = wp_get_current_user();
            $user_data = [
                'id'        => 'wp-user-' . $current_user->ID,
                'email'     => $current_user->user_email,
                'firstName' => $current_user->user_firstname,
                'lastName'  => $current_user->user_lastname,
                'company'   => get_user_meta( $current_user->ID, 'billing_company', true ),
                'role'      => in_array( 'administrator', (array) $current_user->roles ) ? 'ADMIN' : 'USER',
            ];
        }
        echo '<script>window.ta25_app_vars = ' . wp_json_encode( [ 'currentUser' => $user_data, 'nonce' => wp_create_nonce('wp_rest') ] ) . ';</script>';

        // Inject the main JS file
        if (isset($manifest_data['entrypoints'])) { // create-react-app
             foreach ($manifest_data['entrypoints'] as $file) {
                if (substr($file, -3) === '.js') {
                    echo '<script defer="defer" src="' . esc_url( $base_url . $file ) . '"></script>';
                }
            }
        } else if ( $entry_key && isset( $manifest_data[$entry_key] ) && isset( $manifest_data[$entry_key]['file'] ) ) { // vite
            echo '<script type="module" src="' . esc_url( $base_url . $manifest_data[$entry_key]['file'] ) . '"></script>';
        }

        // We don't call wp_footer() to prevent theme scripts from interfering
        do_action('wp_footer');
    ?>
</body>
</html>
`;

const phpPluginContent = `<?php
/**
 * Plugin Name:       TA25 App Integration (Standalone Loader)
 * Plugin URI:        https://ta25.it/
 * Description:       Sostituisce la homepage di WordPress con l'applicazione React TA25, bypassando il tema.
 * Version:           4.0.0
 * Author:            TA25
 * Author URI:        https://ta25.it/
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       ta25-app
 */

if ( ! defined( 'WPINC' ) ) {
    die;
}

/**
 * Intercetta il caricamento del template.
 * Se siamo sulla homepage, carica il nostro loader personalizzato e interrompe l'esecuzione di WordPress.
 * Questo è un metodo molto diretto per assicurarsi che solo la nostra app venga eseguita.
 */
function ta25_app_template_redirect_handler() {
    // Esegui solo sulla pagina principale del sito.
    if ( is_front_page() ) {
        $loader_path = plugin_dir_path( __FILE__ ) . 'app-loader.php';
        if ( file_exists( $loader_path ) ) {
            // Includi il nostro file di caricamento.
            include $loader_path;
            // Interrompi l'esecuzione di WordPress per evitare che carichi il tema.
            exit;
        } else {
            // Se il loader non esiste, mostra un errore per l'amministratore.
            if( current_user_can('manage_options') ) {
                wp_die('Errore critico del plugin TA25 App: file app-loader.php non trovato.');
            }
        }
    }
}
// Usiamo 'template_redirect' con priorità alta per agire prima che il tema inizi a caricare.
add_action( 'template_redirect', 'ta25_app_template_redirect_handler', 1 );
`;

const readmeContent = `=== TA25 App Integration (Standalone Loader) ===
Contributors: TA25
Requires at least: 5.0
Tested up to: 6.5
Stable tag: 4.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Sostituisce la homepage di WordPress con l'applicazione React TA25 utilizzando un loader autonomo che bypassa il tema per la massima affidabilità.

== Description ==

Questo plugin è la soluzione definitiva per integrare la tua app React in un sito WordPress dedicato. Invece di provare a iniettare script in un tema esistente, questo plugin prende il controllo completo della homepage, caricando un file PHP minimale che a sua volta carica la tua applicazione. Questo approccio previene conflitti con temi e altri plugin.

== Installation ==

1.  **Compila la tua App**: Esegui \`npm run build\` nel tuo progetto React.
2.  **Copia i File**: Copia TUTTO il contenuto della cartella \`dist\` (o \`build\`) nella cartella \`app-build\` di questo plugin.
3.  **Carica e Attiva**: Zippa la cartella del plugin, caricala su WordPress tramite "Plugin > Aggiungi Nuovo", e attivala.
4.  **Fatto**: La tua homepage ora è l'applicazione React.

== User Integration ==

Se un utente è loggato in WordPress, i suoi dati base (email, nome, ruolo) verranno passati automaticamente all'app per un'esperienza di accesso unificata.
`;