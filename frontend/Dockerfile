FROM node:20-alpine

WORKDIR /app

COPY package.json tsconfig.json vite.config.ts index.html ./
COPY src ./src
COPY public ./public

RUN npm install

EXPOSE 5173

CMD ["npm", "run", "dev"]
