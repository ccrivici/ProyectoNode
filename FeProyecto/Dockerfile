# Stage 1 - compile Angular app
FROM node:16.13.0-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --prod

# Stage 2 - serve Angular app with nginx
FROM nginx:1.21.3-alpine
COPY --from=build /app/dist/front-proyecto /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
