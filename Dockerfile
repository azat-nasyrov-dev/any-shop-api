FROM node:16.3.0-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm install
ADD . .
RUN npm run build

FROM node:16.3.0-alpine
WORKDIR /app
RUN adduser -D noroot && chown -R noroot /app
USER noroot
COPY --from=dependencies /app/node_modules ./node_modules/
COPY . .
EXPOSE 3001
ENV MONGODB_URI "mongodb://localhost:27017"
CMD ["node", "./dist/main.js"]
