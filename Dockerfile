# Verwende ein offizielles Node.js Runtime Image als Basis
FROM node:18-alpine

# Setze das Arbeitsverzeichnis im Container
WORKDIR /app

# Kopiere package.json und package-lock.json (falls vorhanden)
COPY package*.json ./

# Installiere die Abhängigkeiten
RUN npm install --production

# Kopiere den Rest der Anwendung
COPY . .

# Exponiere den Port, auf dem die App läuft
EXPOSE 3000

# Setze Umgebungsvariablen (können überschrieben werden)
ENV HOST=0.0.0.0
ENV PORT=3000

# Starte die Anwendung
CMD ["npm", "start"]
