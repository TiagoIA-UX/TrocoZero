# Changelog

## v0.2.0 - Produção Ready
- Documentação completa para integração Pix real (`docs/Pix_Real_Producao.md`)
- Testes automatizados (unit + integração) com Vitest
- CI/CD com GitHub Actions
- Histórico de transações no painel web
- Logger estruturado com Pino
- Idempotência persistente no banco
- API keys dinâmicas por loja
- Endpoint `/transactions` para consulta de histórico
- Paginação no histórico

## v0.1.0 - MVP
- Backend em Node.js/TypeScript com Fastify
- Fluxo completo de troco via Pix (mock)
- Múltiplas lojas e caixas
- Relatório diário
- Painel web embutido
