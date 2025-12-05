FROM node:23-alpine
WORKDIR /app

ARG REACT_APP_API_SERVER_HOST
ARG REACT_APP_USE_SAMPLE_LOCATION_INFO

# Copia i file di configurazione e installa le dipendenze
COPY package.json package-lock.json ./
RUN npm install

# Copia tutto il codice sorgente
COPY . .

# Esegui la build in modalità produzione
RUN npm run build

ENV PORT=8080

# Espone la porta usata dal server proxy
EXPOSE 8080

# Avvia il server proxy
CMD ["node", "src/server/server.mjs"]
