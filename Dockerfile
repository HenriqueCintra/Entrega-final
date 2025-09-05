# Usa a imagem oficial do Node.js
FROM node:23-alpine3.20

# Define o diretório de trabalho dentro do container
WORKDIR /app


# Copia os arquivos de configuração do projeto
COPY package*.json ./
COPY vite.config.ts ./

# Instala as dependências
RUN npm install

# # Copia o restante dos arquivos do projeto
COPY . .

# # Expõe a porta que o Vite usa por padrão
EXPOSE 5173

# # Comando para iniciar o servidor de desenvolvimento
CMD ["npm", "run", "dev"]