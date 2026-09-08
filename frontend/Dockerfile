# --- Étape 1 : build ---
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
# VITE_API_URL doit être dispo au moment du build (pas juste au runtime)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# --- Étape 2 : serveur statique ---
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
CMD ["nginx", "-g", "daemon off;"]