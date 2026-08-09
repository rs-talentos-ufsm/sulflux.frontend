# =========================
# ESTÁGIO 1: Build 
# =========================
FROM node:22-alpine AS builder

WORKDIR /app
RUN apk add --no-cache git

# Copia arquivos de dependência e instala
COPY package*.json ./
RUN npm install

# Copia o código-fonte
COPY . .

# Garante que o TypeScript saiba que a shared está "pronta"
# Link simbólico para apontar para o que foi compilado
RUN ln -s /app/node_modules/@lib/shared/dist /app/node_modules/@lib/shared/src/dist || true

# Faz o build do projeto
RUN npm run build 

# =========================
# ESTÁGIO 2: Produção (Nginx)
# =========================
FROM nginx:1.25-alpine

# Copia o build estático do Vite para a pasta padrão do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Se tiver uma config customizada, descomente a linha abaixo:
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]