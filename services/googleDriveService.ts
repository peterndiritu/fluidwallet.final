
// NOTE: For real Google Drive API access, you must replace these placeholders with valid credentials 
// from your Google Cloud Console (https://console.cloud.google.com).
// The API Key must have "Google Drive API" enabled.
// The Client ID must authorize the domain where this app is hosted (e.g., localhost).

const env = (import.meta as any).env || {};
const CLIENT_ID = env.VITE_GOOGLE_CLIENT_ID || 'PLACEHOLDER_CLIENT_ID'; 
const API_KEY = env.VITE_GOOGLE_API_KEY || 'PLACEHOLDER_API_KEY'; 

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

declare var google: any;
declare var gapi: any;

let gapiInited = false;
let gisInited = false;
let tokenClient: any;

export const initGoogleDrive = async () => {
    if (gapiInited && gisInited) return;

    await new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = resolve;
        document.body.appendChild(script);
    });

    await new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = resolve;
        document.body.appendChild(script);
    });

    await new Promise<void>((resolve) => {
        gapi.load('client', async () => {
            await gapi.client.init({
                apiKey: API_KEY,
                discoveryDocs: [DISCOVERY_DOC],
            });
            gapiInited = true;
            resolve();
        });
    });

    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // Defined at request time
    });
    gisInited = true;
};

export const uploadToDrive = async (fileName: string, content: string): Promise<string> => {
    // Check if configuration is missing
    if (CLIENT_ID === 'PLACEHOLDER_CLIENT_ID') {
        // Fallback for demo purposes (since we can't ship private keys in public code)
        console.warn("Google Drive Credentials missing. Triggering local download instead.");
        downloadLocal(fileName, content);
        // Simulate network delay
        await new Promise(r => setTimeout(r, 1500));
        return "demo_drive_file_id";
    }

    if (!tokenClient) await initGoogleDrive();

    return new Promise((resolve, reject) => {
        tokenClient.callback = async (resp: any) => {
            if (resp.error) {
                reject(resp);
            }
            try {
                // 1. Create Metadata
                const fileMetadata = {
                    name: fileName,
                    mimeType: 'application/json'
                };

                // 2. Prepare Upload
                const file = new Blob([content], {type: 'application/json'});
                const form = new FormData();
                form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
                form.append('file', file);

                // 3. Execute Fetch
                const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                    method: 'POST',
                    headers: new Headers({ 'Authorization': 'Bearer ' + resp.access_token }),
                    body: form
                });
                
                const data = await response.json();
                resolve(data.id);
            } catch (e) {
                reject(e);
            }
        };

        if (gapi.client.getToken() === null) {
            tokenClient.requestAccessToken({prompt: 'consent'});
        } else {
            tokenClient.requestAccessToken({prompt: ''});
        }
    });
};

// Fallback mechanism
const downloadLocal = (filename: string, text: string) => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};
