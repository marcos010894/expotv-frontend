# 🚀 Deploy - Expo TV Frontend

## Deploy no Fly.io (Recomendado)

### Pré-requisitos
- Instalar Fly CLI: `curl -L https://fly.io/install.sh | sh`
- Login: `flyctl auth login`

### Primeiro Deploy

1. **Fazer build local (para testar)**:
```bash
npm run build
npm start
```

2. **Deploy no Fly.io**:
```bash
# Fazer deploy (já está configurado no fly.toml)
flyctl deploy

# Ou criar o app primeiro (se necessário)
flyctl launch --name expotv-frontend --region gru
```

3. **Configurar variáveis de ambiente**:
```bash
flyctl secrets set VITE_API_BASE_URL=https://expotv-backend.fly.dev
```

4. **Abrir a aplicação**:
```bash
flyctl open
```

### Atualizações

Para fazer deploy de novas versões:
```bash
git add .
git commit -m "suas mudanças"
flyctl deploy
```

### Comandos Úteis

```bash
# Ver logs
flyctl logs

# Ver status
flyctl status

# Escalar máquinas
flyctl scale count 1

# SSH na máquina
flyctl ssh console
```

---

## Deploy na Vercel (Alternativa)

### Configuração de Variáveis de Ambiente

Na Vercel, adicionar:
```
VITE_API_BASE_URL=https://expotv-backend.fly.dev
```

### Comandos de Build
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Framework Preset**: Vite

### Forçar Rebuild (limpar cache)
```bash
git commit --allow-empty -m "force rebuild"
git push
```

---

## Problemas Comuns

### 1. Página em branco após deploy
- Verifique se a variável `VITE_API_BASE_URL` está configurada
- Verifique os logs: `flyctl logs` ou na dashboard da Vercel
- Teste o build local: `npm run build && npm start`

### 2. Erro 404 ao navegar
- Fly.io: Já resolvido no `server.js` (todas rotas retornam index.html)
- Vercel: Já resolvido no `vercel.json` (rewrites configurados)

### 3. API não conecta
- Verifique se a URL do backend está correta
- Verifique se o CORS está configurado no backend
- No backend, adicionar o domínio do frontend aos origins permitidos

### 4. Build falha
- Verificar versão do Node (deve ser 20+)
- Limpar cache: `rm -rf node_modules package-lock.json && npm install`
