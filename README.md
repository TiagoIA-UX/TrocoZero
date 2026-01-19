# TrocoZero

TrocoZero é um SaaS para **gestão automática de troco via Pix** no varejo físico brasileiro.  
Ele calcula o troco em pagamentos em dinheiro, oferece a opção de troco via Pix e registra tudo para auditoria e relatórios.

## Status
MVP funcional e extensível, pronto para testes e validação com PDVs/POS.

![CI](https://github.com/TiagoIA-UX/TrocoZero/workflows/CI/badge.svg)

## Principais recursos
- Registro de venda em dinheiro e cálculo automático de troco
- Troco via Pix (mock no MVP, pronto para integração real)
- Logs de auditoria imutáveis
- Relatório diário por loja
- Histórico de transações com paginação
- Múltiplas lojas e caixas
- API keys dinâmicas por loja
- Idempotência persistente
- Painel web operacional embutido
- Testes automatizados (unit + integração)
- CI/CD com GitHub Actions

## Stack
- Backend: Node.js + TypeScript + Fastify
- Banco: PostgreSQL (ou modo memória)
- Validação: Zod
- Logs: Pino
- Testes: Vitest
- Painel: HTML/CSS/JS estático

## Arquitetura (resumo)
- `src/domain`: regras e entidades de negócio
- `src/application`: casos de uso
- `src/infrastructure`: banco, repositórios, migrações
- `src/api`: endpoints HTTP
- `public`: painel web

## Rodar local (modo memória)
```bash
npm install --include=dev
set TROCOZERO_STORAGE=memory
npm run dev
```
Abra: `http://127.0.0.1:3000`

## Rodar local (PostgreSQL)
```bash
docker compose up -d
npm install --include=dev
set DATABASE_URL=postgres://trocozero:trocozero@localhost:5432/trocozero
set TROCOZERO_STORAGE=postgres
npm run migrate
npm run dev
```

## Endpoints principais
- `POST /stores` — Criar loja
- `POST /stores/{storeId}/registers` — Criar caixa
- `POST /sales/cash` — Registrar venda em dinheiro
- `POST /sales/{saleId}/pix-change` — Solicitar troco via Pix
- `POST /pix-transfers/{pixTransferId}/confirm` — Confirmar Pix
- `GET /reports/daily?storeId=...&date=YYYY-MM-DD` — Relatório diário
- `GET /transactions?storeId=...&startDate=...&endDate=...` — Histórico de transações
- `POST /admin/stores/{storeId}/api-keys` — Criar API key por loja
- `GET /health` — Healthcheck

## Painel web
O painel está embutido no servidor:
`http://127.0.0.1:3000`

## SDK oficial (pacote único)
O SDK oficial está em `sdk/` e exporta o cliente `TrocoZeroClient`.
Para compilar:
```bash
npm install --include=dev
npm run build:sdk
```

## Documentação operacional
- `docs/Manual_Treinamento_Lojas.md` — Manual para operadores de caixa
- `docs/Integracao_PDV.md` — Guia de integração por tipo de PDV
- `docs/Pix_Real_Producao.md` — Passo a passo para integração Pix real

## Segurança
Rotas exigem `x-api-key` (exceto `/health` e painel). Há duas opções:
- **Chave estática** via `TROCOZERO_API_KEY`
- **Chaves dinâmicas** por loja via `/admin/stores/:storeId/api-keys`

Para operações admin, configure `TROCOZERO_ADMIN_API_KEY` e use header:
`x-admin-key: SUA_CHAVE_ADMIN`.

## Testes
```bash
npm test              # rodar testes
npm run test:watch    # modo watch
npm run test:coverage # com cobertura
```

## O que falta para produção
1. **Pix real** — Escolher PSP, obter credenciais, implementar adapter (ver `docs/Pix_Real_Producao.md`)
2. **Alta disponibilidade** — Múltiplas instâncias, load balancer
3. **Backups** — Estratégia de backup PostgreSQL
4. **Monitoramento** — Métricas, alertas, SLA

## Licença
**Proprietária** — Todos os direitos reservados.  
Para licenciamento comercial, entre em contato com o autor.
