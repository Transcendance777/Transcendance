FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npx prisma generate

# Bonne pratique : ne pas tourner en root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 4000

CMD ["sh", "-c", "until [ -f /approle_id/backend-api.json ]; do echo 'Waiting for vault-bootstrap...'; sleep 2; done; npm start"]

