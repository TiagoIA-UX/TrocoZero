# TrocoZero

TrocoZero é um SaaS para **gestão automática de troco via Pix** no varejo físico brasileiro.  
Ele calcula o troco em pagamentos em dinheiro, oferece a opção de troco via Pix e registra tudo para auditoria e relatórios.

## Status
MVP funcional e extensível, pronto para testes e validação com PDVs/POS.

## Principais recursos
- Registro de venda em dinheiro e cálculo automático de troco
- Troco via Pix (mock no MVP)
- Logs de auditoria
- Relatório diário por loja
- Múltiplas lojas e caixas
- Painel web operacional embutido

## Stack
- Backend: Node.js + TypeScript + Fastify
- Banco: PostgreSQL (ou modo memória)
- Validação: Zod
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
- `POST /stores`
- `POST /stores/{storeId}/registers`
- `POST /sales/cash`
- `POST /sales/{saleId}/pix-change`
- `POST /pix-transfers/{pixTransferId}/confirm`
- `GET /reports/daily?storeId=...&date=YYYY-MM-DD`

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
- `docs/Manual_Treinamento_Lojas.md`
- `docs/Integracao_PDV.md`

## Segurança
Rotas exigem `x-api-key` (exceto `/health` e painel). Há duas opções:
- **Chave estática** via `TROCOZERO_API_KEY`
- **Chaves dinâmicas** por loja via `/admin/stores/:storeId/api-keys`

Para operações admin, configure `TROCOZERO_ADMIN_API_KEY` e use header:
`x-admin-key: SUA_CHAVE_ADMIN`.

## Licença
MIT
