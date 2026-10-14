# syntax=docker/dockerfile:1
# =========================
# ESTÁGIO 1: Build 
# =========================
FROM node:22-alpine AS builder

WORKDIR /app
RUN apk add --no-cache git

# Copia arquivos de dependência e o pacote compartilhado
COPY package*.json ./
COPY lib-shared*.tgz ./lib-shared.tgz
RUN sed -i '/"@lib\/shared"/d' package.json && rm -f package-lock.json && npm install --legacy-peer-deps
RUN mkdir -p node_modules/@lib/shared && tar -xzf lib-shared.tgz --strip-components=1 -C node_modules/@lib/shared

# Copia o código-fonte
COPY . .

# Variáveis de build para o Vite
ARG VITE_API_URL
ARG VITE_FRONTEND_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_FRONTEND_URL=$VITE_FRONTEND_URL

# Faz o build do projeto
RUN npm run build

# =========================
# ESTÁGIO 2: Produção (Nginx)
# =========================
FROM nginx:1.27-alpine

# Copia a configuração personalizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos compilados do frontend
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]