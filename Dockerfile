FROM node:16-alpine

WORKDIR /app

# sqlite3 (node-gyp) precisa de toolchain
RUN apk add --no-cache python3 make g++

# Dependências primeiro (cache)
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Código
COPY . .

EXPOSE 3333

CMD ["sh", "-lc", "npm run knex:migrate && npm run knex:seed && npm run dev"]


