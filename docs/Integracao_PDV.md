# Modos de Integração com PDV

## 1) ERP/POS tradicional (desktop)
**Como funciona:** o PDV faz chamadas HTTP diretas para a API.  
**Recomendado para:** sistemas com controle total do fluxo de caixa.

**Fluxo:**
1. `POST /sales/cash`
2. `POST /sales/{saleId}/pix-change`
3. `POST /pix-transfers/{pixTransferId}/confirm`

**Segurança:**
- Usar `x-api-key`
- HTTPS em produção
- Idempotency Key por venda
 - Chaves dinâmicas por loja via `/admin/stores/:storeId/api-keys`

---

## 2) POS Android
**Como funciona:** o POS chama a API diretamente ou via gateway local.  
**Recomendado para:** operações com mobilidade e caixas distribuídos.

**Fluxo:**
- Igual ao ERP, com atenção a instabilidade de rede.

**Regras extras:**
- Timeout curto (5s)
- Uma tentativa de retry
- Fallback automático para troco físico

---

## 3) PDV Web (browser)
**Como funciona:** o front-end chama a API, ou usa um backend próprio intermediando.  
**Recomendado para:** PDVs modernos já em nuvem.

**Melhor prática:**
- Backend intermediário para esconder API Key
- Tokens curtos por sessão

---

## Checklist rápido de integração
- [ ] cadastro de loja e caixa
- [ ] persistir `storeId` e `registerId`
- [ ] idempotência por venda
- [ ] tratamento de falhas Pix
- [ ] logs no PDV para auditoria
