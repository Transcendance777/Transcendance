#! updated to node 22
#FROM node:20-alpine
FROM node:22-alpine
#!
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

#! commented this
# # Bonne pratique : ne pas tourner en root
# RUN addgroup -S appgroup && adduser -S appuser -G appgroup
# USER appuser
#!

EXPOSE 4000

CMD ["npm", "start"]

