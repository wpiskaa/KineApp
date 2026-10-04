/* Isi dengan konfigurasi dari Firebase Console → Project settings → Your apps → Web app.
   Lihat SETUP.md. (Nilai ini aman berada di sisi klien; keamanan dijaga oleh firestore.rules.) */
export const firebaseConfig = {
  apiKey: 'ISI_DI_SINI',
  authDomain: 'ISI_DI_SINI.firebaseapp.com',
  projectId: 'ISI_DI_SINI',
  storageBucket: 'ISI_DI_SINI.appspot.com',
  messagingSenderId: 'ISI_DI_SINI',
  appId: 'ISI_DI_SINI',
};
export const isConfigured = !!firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith('ISI_');
