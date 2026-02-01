FROM node:20-alpine
WORKDIR /app
COPY ./catalog-api/package*.json ./
RUN npm ci --omit=dev
COPY ./catalog-api/server.js ./
RUN mkdir -p public
COPY *.png ./public/
EXPOSE 4000
CMD ["node", "server.js"]
