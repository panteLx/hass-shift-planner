# Home Assistant Shift Import

Eine Web-Anwendung zum Importieren von Schichtplänen in Home Assistant Kalender.

## Docker Installation

### Voraussetzungen

- Docker und Docker Compose installiert
- Home Assistant mit Long-Lived Access Token
- Kalender-Entities in Home Assistant erstellt

### Schnellstart

1. **Repository klonen oder Dateien herunterladen**

2. **Umgebungsvariablen konfigurieren**

   ```bash
   cp .env.example .env
   ```

   Bearbeite die `.env` Datei mit deinen Werten:

   - `HA_URL`: Die URL deiner Home Assistant Instanz
   - `HA_TOKEN`: Dein Long-Lived Access Token
   - `CALENDAR_ENTITY_IDS`: JSON-Objekt mit Namen und Kalender-Entity-IDs

3. **Shifts-Konfiguration anpassen**
   Bearbeite `shifts_config.json` mit deinen Schichtzeiten

4. **Container starten**

   ```bash
   docker-compose up -d
   ```

5. **Zugriff auf die Anwendung**
   Öffne http://localhost:3000 in deinem Browser

### Docker Compose verwenden

Mit docker-compose (empfohlen):

```bash
docker-compose up -d
```

Container stoppen:

```bash
docker-compose down
```

Logs anzeigen:

```bash
docker-compose logs -f
```

### Nur Docker (ohne Compose)

Image bauen:

```bash
docker build -t hass-import-shifts .
```

Container starten:

```bash
docker run -d \
  --name hass-import-shifts \
  -p 3000:3000 \
  -e HA_URL=http://homeassistant.local:8123 \
  -e HA_TOKEN=your_token_here \
  -e CALENDAR_ENTITY_IDS='{"name1":"calendar.name1"}' \
  -v $(pwd)/shifts_config.json:/app/shifts_config.json:ro \
  hass-import-shifts
```

## Konfiguration

### Environment Variables

- `HOST`: Host-Adresse (Standard: 0.0.0.0)
- `PORT`: Port (Standard: 3000)
- `HA_URL`: Home Assistant URL
- `HA_TOKEN`: Home Assistant Long-Lived Access Token
- `CALENDAR_ENTITY_IDS`: JSON mit Name-zu-Calendar-Entity Mapping

### shifts_config.json

Beispiel:

```json
{
  "name1": {
    "frühschicht": {
      "start": "06:00:00",
      "end": "14:00:00"
    },
    "spätschicht": {
      "start": "14:00:00",
      "end": "22:00:00"
    }
  }
}
```

## Troubleshooting

Container-Logs anzeigen:

```bash
docker logs hass-import-shifts
```

Container neu starten:

```bash
docker restart hass-import-shifts
```

Container mit interaktiver Shell:

```bash
docker exec -it hass-import-shifts sh
```
