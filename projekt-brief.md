# Diät-Kalender — Projekt-Briefing für Claude Code

## Überblick
Erstelle eine Web-App (PWA) als Diät-Kalender zum täglichen Tracking.
Ziel: ca. 10 kg in 5 Monaten abnehmen. Der Nutzer überschlägt Kalorien grob, kein exaktes Tracking.

## Features

### Kalender
- Monatsansicht, ein Monat pro Seite
- Navigation: Monate vorwärts/rückwärts blättern
- Startmonat: April 2026
- Woche beginnt mit Montag
- Deutsche Monatsnamen und Wochentage (Mo, Di, Mi, Do, Fr, Sa, So)
- Heutiger Tag visuell hervorgehoben (z.B. gelber Rahmen)

### Tages-Tracking
Jeder Tag ist anklickbar. Ein Klick wechselt durch drei Status + leer:
- **Rot** (über Kalorienziel) — Symbol: −
- **Grün** (Kalorienziel getroffen) — Symbol: ○  
- **Blau** (unter Kalorienziel) — Symbol: +
- **Leer** (nicht erfasst)

Die Tage werden farbig hinterlegt, die Tagesnummer bleibt lesbar.

### Statistiken
- Monatsstatistik: Anzahl Tage pro Status + Erfolgsquote (grün+blau / gesamt)
- Gesamt-Fortschrittsbalken über alle Monate (rot/grün/blau proportional)

### Partner-Modus (optional, nice-to-have)
- Zwei Nutzer können jeweils ihren eigenen Kalender führen
- Optional: gegenseitige Fortschritte sehen (Motivations-Feature)
- Umsetzung über Firebase Anonymous Auth + teilbaren Einladungs-Link/Code

## Technologie

### Frontend
- **Vite + React** (TypeScript optional, aber empfohlen)
- Responsive Design, mobile-first (iPhone + Mac)
- Dunkles Design (Hintergrund: dunkles Blau/Slate, z.B. #0f172a bis #1e293b)
- Fonts: "DM Sans" (Body) + "Playfair Display" (Headings) via Google Fonts
- PWA-fähig: manifest.json + Service Worker, damit man die App auf dem iPhone zum Homescreen hinzufügen kann

### Backend / Daten
- **Firebase Firestore** für Datenspeicherung
- **Firebase Anonymous Auth** — kein Login-Screen nötig, aber geräteübergreifend identifizierbar
- Echtzeit-Sync zwischen Geräten (onSnapshot)
- Firestore-Struktur Vorschlag:
  ```
  users/{anon-uid}/days/{2026-04-15} → { status: "hit" }
  ```

### Hosting / Deployment
- **GitHub Pages** (nicht Vercel)
- GitHub Actions für automatischen Build bei Push
- Repository-Name Vorschlag: `diet-calendar`

## Design-Details

### Farbschema
- Hintergrund: linear-gradient(160deg, #0f172a, #1e293b, #0f172a)
- Rot (über Ziel): #E8453C
- Grün (getroffen): #2ECC71
- Blau (unter Ziel): #3B82F6
- Heute-Markierung: #facc15 (gelber Rahmen)
- Text: #f1f5f9 (hell), #64748b (gedämpft), #475569 (hint)
- Zellen ohne Status: rgba(255,255,255,0.04)

### UI-Elemente
- Tages-Zellen: abgerundete Quadrate (border-radius: 10px), aspect-ratio: 1
- Navigation: Pfeil-Buttons (◂ / ▸), 44x44px
- Statistik-Karten: halbtransparenter Hintergrund mit feinem Border
- Sync-Status-Anzeige: kleiner farbiger Punkt (grün=synced, gelb=syncing, rot=error)

## Projekt-Struktur (Vorschlag)
```
diet-calendar/
├── index.html
├── vite.config.ts
├── package.json
├── tsconfig.json
├── public/
│   ├── manifest.json
│   ├── favicon.ico
│   └── icon-192.png
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── Calendar.tsx
│   │   ├── DayCell.tsx
│   │   ├── MonthNav.tsx
│   │   ├── Stats.tsx
│   │   └── SyncStatus.tsx
│   ├── hooks/
│   │   └── useCalendarData.ts
│   ├── firebase.ts
│   ├── types.ts
│   └── styles.css
├── .github/
│   └── workflows/
│       └── deploy.yml
└── README.md
```

## Setup-Schritte die Claude Code ausführen soll

1. Projekt mit Vite + React erstellen
2. Firebase SDK installieren und konfigurieren
3. Alle Komponenten implementieren
4. PWA-Manifest und Service Worker einrichten
5. GitHub Actions Workflow für GitHub Pages erstellen
6. Git initialisieren
7. README mit Anleitung für Firebase-Setup schreiben

## Wichtiger Hinweis
Der Nutzer muss manuell ein Firebase-Projekt erstellen (console.firebase.google.com) und die Firebase-Config (apiKey, projectId, etc.) eintragen. Claude Code soll eine klare Anleitung dafür in die README schreiben und Platzhalter in firebase.ts verwenden.

## Nicht benötigt
- Kein Login-Screen
- Kein exaktes Kalorien-Tracking
- Keine Benachrichtigungen (erstmal)
- Kein Backend-Server
