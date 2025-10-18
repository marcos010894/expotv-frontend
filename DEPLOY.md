# 🚀 Instruções para Deploy na Vercel

## Configuração de Variáveis de Ambiente

Na Vercel, você precisa adicionar a seguinte variável de ambiente:

### Settings → Environment Variables

```
VITE_API_BASE_URL=https://expotv-backend.fly.dev
```

## Comandos de Build

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## Framework Preset

Selecione: **Vite**

## Checklist de Deploy

- [ ] Adicionar variável `VITE_API_BASE_URL` nas configurações da Vercel
- [ ] Verificar se a branch está correta (main)
- [ ] Garantir que o build local funciona: `npm run build`
- [ ] Fazer commit e push das mudanças
- [ ] Fazer redeploy na Vercel

## Problemas Comuns

### 1. Página em branco após deploy
- Verifique se a variável de ambiente está configurada
- Verifique os logs de build na Vercel
- Teste o build local: `npm run build && npm run preview`

### 2. Erro 404 ao navegar
- Já está resolvido com o `vercel.json` (rewrites configurados)

### 3. API não conecta
- Verifique se a URL do backend está correta
- Verifique se o CORS está configurado no backend para aceitar o domínio da Vercel
