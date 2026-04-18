# Update: Sync-Fix und Multi-User Support

## Problem 1: Geräte-Sync funktioniert nicht
Anonymous Auth gibt jedem Gerät eine eigene ID. Dadurch sehen Mac und iPhone verschiedene Daten.

### Lösung: PIN-basierter Zugang
- Beim ersten Start zeigt die App einen Eingabescreen: "Gib deinen persönlichen Code ein"
- Der Nutzer wählt einen eigenen Code (z.B. "silvio123" oder "meinkalender")
- Dieser Code wird als Dokument-Pfad in Firestore verwendet: `calendars/{code}/days/{date}`
- Jedes Gerät das den gleichen Code eingibt, sieht die gleichen Daten
- Der Code wird im localStorage des Browsers gespeichert, damit man ihn nicht jedes Mal neu eingeben muss
- Es gibt einen "Code ändern" / "Abmelden" Button in den Einstellungen

### KEIN echtes Login:
- Keine E-Mail, kein Passwort, keine Firebase Auth
- Anonymous Auth kann komplett entfernt werden
- Der Code ist einfach ein Schlüssel zum Firestore-Dokument

## Problem 2: Mehrere Nutzer
Andere Personen sollen ihren eigenen Kalender nutzen können.

### Lösung: Jeder Code = eigener Kalender
- Wer einen anderen Code eingibt, bekommt einen eigenen, leeren Kalender
- Daten sind komplett getrennt
- Es gibt kein Limit für die Anzahl der Nutzer/Codes

## Firestore-Struktur (NEU):
```
calendars/{userCode}/days/{2026-04-15} → { status: "hit" }
```

## Firestore-Regeln anpassen:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /calendars/{code}/days/{day} {
      allow read, write: if true;
    }
  }
}
```
(Testmodus - für persönliche Nutzung ausreichend)

## UI-Änderungen:
- Neuer Screen: Code-Eingabe beim ersten Start (gleiches dunkles Design)
- Eingabefeld für den Code, Button "Kalender öffnen"
- Hinweis: "Nutze den gleichen Code auf allen Geräten"
- Im Kalender oben oder unten: kleiner Text welcher Code aktiv ist
- Button "Code ändern" um sich auszuloggen / anderen Code zu nutzen

## Nach den Änderungen:
- Automatisch committen und pushen (git add -A && git commit -m "PIN-based sync + multi-user" && git push)
