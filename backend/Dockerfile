FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
USER node
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "server.js"]
