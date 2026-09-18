#!/bin/bash

echo "🔄 Iniciando atualização do Infra Monitor Hub..."

# Puxar código mais recente do GitHub
echo "📥 Baixando atualizações (git pull)..."
git pull origin main

# Atualizar dependências do Frontend e Backend
echo "📦 Instalando dependências (Frontend)..."
npm install

echo "📦 Instalando dependências (Backend)..."
cd server
npm install

# Atualizar Banco de Dados (se você tiver pedido pra mim criar tabelas novas)
echo "🗄️ Sincronizando Banco de Dados..."
npx prisma db push

# Construir a versão de produção do Frontend (Opcional, se não for usar o 'npm run dev')
# cd ..
# echo "🔨 Construindo Frontend..."
# npm run build

echo "✅ Atualização concluída com sucesso!"
echo "🚀 Reinicie os serviços (Node) para aplicar as alterações do Backend."
