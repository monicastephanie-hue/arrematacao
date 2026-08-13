# Arrematação — controle de leilões de imóveis

Aplicação para acompanhar o andamento de imóveis arrematados em leilão: cada
imóvel tem sua própria página, onde você lança valores (boleto, ITBI, reforma,
comissão, venda etc.) e registra a conclusão de cada etapa do processo
(pagamento, IPTU/ITBI, escritura, registro, desocupação, reforma, vistoria,
comprador aprovado, venda, GCAP). O dashboard consolida tudo: total investido,
resultado dos imóveis vendidos, gráfico de investimento por imóvel, imóveis
por etapa atual, e uma visão em tabela no estilo planilha para quem já está
acostumado a controlar isso em Excel/Google Sheets.

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4
- React Router
- Zustand (com persistência em `localStorage` do navegador — não há backend)
- Recharts

Os dados ficam salvos **apenas no navegador** (chave `arrematacao-store` no
`localStorage`). Não há login nem servidor: é um app estático que pode ser
hospedado em qualquer lugar (Vercel, Netlify, GitHub Pages etc.).

## Rodando localmente

```bash
npm install
npm run dev
```

## Build de produção

```bash
npm run build
npm run preview
```

## Estrutura

- `src/types.ts` — modelo de dados (imóvel, etapas, valores, status)
- `src/store/useStore.ts` — estado global persistido (Zustand)
- `src/lib/calculations.ts` — cálculos derivados (total investido, progresso, resultado)
- `src/pages/dashboard.tsx` — visão geral (cards, tabela, gráficos, filtros)
- `src/pages/property-detail.tsx` — página individual do imóvel
- `src/pages/property-form.tsx` — cadastro/edição de imóvel
