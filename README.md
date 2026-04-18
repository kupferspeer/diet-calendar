# Diät-Kalender

PWA zum täglichen Tracking deines Diät-Ziels. Läuft auf iPhone & Desktop, speichert Daten in Firebase Firestore.

## Schnellstart

### 1. Firebase einrichten

1. Gehe zu [console.firebase.google.com](https://console.firebase.google.com)
2. Neues Projekt erstellen (z.B. `diet-calendar`)
3. **Authentication** aktivieren → Sign-in method → Anonymous → Enable
4. **Firestore Database** erstellen → Production mode starten
5. Firestore-Regeln anpassen (Regeln-Tab):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

6. Projekt-Einstellungen → Deine Apps → Web-App hinzufügen → Firebase-Config kopieren

### 2. Firebase-Config eintragen

Öffne `src/firebase.ts` und ersetze die Platzhalter:

```ts
const firebaseConfig = {
  apiKey: 'DEIN_API_KEY',
  authDomain: 'DEIN_PROJEKT.firebaseapp.com',
  projectId: 'DEIN_PROJEKT',
  storageBucket: 'DEIN_PROJEKT.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123...:web:abc...',
};
```

> **Ohne Firebase** funktioniert die App auch – Daten werden dann lokal im Browser gespeichert (kein geräteübergreifender Sync).

### 3. Lokal starten

```bash
npm install
npm run dev
```

### 4. Icons hinzufügen (für PWA)

Lege diese Dateien in `public/` ab:
- `icon-192.png` (192×192 px)
- `icon-512.png` (512×512 px)

Du kannst sie z.B. mit [favicon.io](https://favicon.io) oder [maskable.app](https://maskable.app) erstellen.

---

## GitHub Pages Deployment

1. Repository auf GitHub pushen (Name: `diet-calendar`)
2. Repository-Einstellungen → Pages → Source: **GitHub Actions**
3. Bei jedem Push auf `main` wird die App automatisch gebaut und deployt
4. URL: `https://DEIN-USERNAME.github.io/diet-calendar/`

> Falls dein Repository anders heißt, passe `base` in `vite.config.ts` an.

---

## Bedienung

| Farbe | Status | Symbol |
|-------|--------|--------|
| Rot   | Über Kalorienziel | − |
| Grün  | Ziel getroffen | ○ |
| Blau  | Unter Kalorienziel | + |
| Leer  | Nicht erfasst | |

Ein Klick auf einen Tag wechselt den Status: leer → Rot → Grün → Blau → leer.

Zukünftige Tage sind ausgegraut und nicht anklickbar.

---

## Auf iPhone installieren

1. App in Safari öffnen
2. Teilen-Button → „Zum Home-Bildschirm" → Hinzufügen
