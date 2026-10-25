# Fit Tracker + V Shape — React V7

Aplicativo React/Vite mobile-first. Evolução da V6, agora com componentes React extraídos da lógica original (faixa semanal interativa), relatórios semanais/mensais, recordes por exercício e CSV.

## Executar
`npm install`
`npm run dev`
`npm run build`

## Segurança dos dados
Dados salvos apenas no `localStorage` da origem atual com a chave `vshape_tracker_v1`. Antes de trocar o site, faça **Backup** JSON na versão em uso. Em uma nova origem (URL) o navegador não compartilha os dados; use **Importar backup**. Nunca limpe dados locais antes de validar a importação.

## Limitações
Ainda não há sincronização em nuvem nem migração integral do visual e componentes Base44. O descanso real só existe para séries iniciadas com o botão correspondente. Relatórios ignoram séries não concluídas.
