# Roadmap

## Fase 1 — concluída

Página inicial com login real via Supabase Auth (contas criadas só por
convite, sem autocadastro público). Os dados dos imóveis continuam salvos
no `localStorage` do navegador por enquanto.

## Fase 2 — planejada

Migrar os dados (imóveis, cotistas, etapas, valores, anexos, simulações,
modelo de notificação) do `localStorage` para um backend compartilhado no
Supabase (Postgres + Storage para arquivos), com Row Level Security
restrita a usuários autenticados. Isso passa a permitir que os cotistas
vejam os mesmos dados de qualquer aparelho, não só do navegador onde
cadastraram.

### Depois da Fase 2: importação automática de anexos do WhatsApp

Contexto (pedido pela usuária em 2026-08-20): hoje, para anexar documentos
compartilhados num grupo do WhatsApp de um imóvel, é preciso baixar os
arquivos manualmente e subir pelo botão "Anexar documento" (aceita vários
de uma vez), caindo em "Pendência de classificação" até serem associados
à etapa correta.

Não dá para automatizar isso hoje porque o app não tem uma API real — os
dados vivem só no navegador de quem usa. Uma vez que a Fase 2 estiver
pronta (app com backend de verdade no Supabase), dá para pensar em:

- Um programa local, rodando no computador da usuária, que vigia uma
  pasta onde os anexos baixados do WhatsApp (via Claude Desktop ou a
  extensão do Claude no navegador, operado manualmente por ela) são
  salvos.
- Esse programa chama a API do app para subir automaticamente cada
  arquivo novo assim que aparece na pasta — continuaria caindo em
  "Pendência de classificação" para ela indicar a etapa.

Importante: mesmo com essa automação, a **classificação por etapa
continuaria manual** — só quem lê o documento sabe a qual etapa ele se
refere. O ganho é eliminar o passo de "selecionar e subir" um por um, não
eliminar o julgamento humano da classificação.

Claude Desktop e a extensão do Claude no navegador são produtos
separados desta sessão (Claude Code): não há hoje uma ponte entre "um
arquivo pousou numa pasta do computador" e "o app percebeu e subiu
sozinho" — essa ponte é o que essa automação futura precisaria construir.
