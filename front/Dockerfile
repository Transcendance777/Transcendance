# Stage 1 : Build
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN ["npm", "run", "build"]

# Stage 2 : servir

FROM nginx:alpine

EXPOSE 8080

COPY --from=build /app/dist /usr/share/nginx/html

