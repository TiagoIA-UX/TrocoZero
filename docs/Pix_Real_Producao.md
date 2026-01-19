# Guia Completo — Integração Pix Real em Produção

Este documento detalha **todos os passos** para sair do mock e operar com **Pix real** no TrocoZero.

---

## Pré-requisitos

- CNPJ ativo
- Conta PJ em banco ou PSP
- Acesso técnico para integração

---

## Passo 1 — Escolher PSP homologado

Você precisa de um **Provedor de Serviços de Pagamento** com API Pix Out.

### PSPs recomendados (Brasil)

| PSP | API Pix Out | Webhook | Sandbox | Docs |
|-----|-------------|---------|---------|------|
| **Gerencianet** | ✅ | ✅ | ✅ | [Link](https://dev.gerencianet.com.br/) |
| **OpenPix** | ✅ | ✅ | ✅ | [Link](https://developers.openpix.com.br/) |
| **Dock** | ✅ | ✅ | ✅ | [Link](https://dock.tech/) |
| **Celcoin** | ✅ | ✅ | ✅ | [Link](https://docs.celcoin.com.br/) |
| **Transfeera** | ✅ | ✅ | ✅ | [Link](https://docs.transfeera.com/) |
| **Asaas** | ✅ | ✅ | ✅ | [Link](https://docs.asaas.com/) |

### Critérios de escolha
- Suporte a **Pix Out** (pagamento/transferência)
- **Webhooks** para confirmação automática
- **Ambiente Sandbox** para testes
- Taxas competitivas
- Suporte técnico

---

## Passo 2 — Abrir conta e homologar

### Documentos necessários
- CNPJ e contrato social
- Documento do representante legal
- Comprovante de endereço
- Dados bancários

### Processo típico
1. Criar conta no painel do PSP
2. Enviar documentação
3. Aguardar análise (1-5 dias)
4. Receber aprovação e acesso técnico

---

## Passo 3 — Obter credenciais técnicas

Cada PSP fornece credenciais diferentes. Os tipos mais comuns:

### OAuth2 (mais comum)
```
PIX_CLIENT_ID=seu_client_id
PIX_CLIENT_SECRET=seu_client_secret
```

### mTLS (certificado)
```
PIX_CERT_PATH=./certs/certificado.pem
PIX_KEY_PATH=./certs/chave.pem
```

### Token estático
```
PIX_API_TOKEN=seu_token
```

---

## Passo 4 — Configurar ambiente

### Variáveis de ambiente (.env)

```env
# PSP escolhido: gerencianet | openpix | dock | celcoin | transfeera | asaas
PIX_PROVIDER=gerencianet

# Credenciais OAuth2
PIX_CLIENT_ID=seu_client_id
PIX_CLIENT_SECRET=seu_client_secret

# Certificado (se mTLS)
PIX_CERT_PATH=./certs/certificado.pem
PIX_KEY_PATH=./certs/chave.pem

# Chave Pix da empresa (origem dos pagamentos)
PIX_KEY=sua_chave_pix

# Ambiente: sandbox | production
PIX_ENV=sandbox

# URL base do webhook (seu servidor público)
PIX_WEBHOOK_URL=https://seu-dominio.com/pix/webhook
```

---

## Passo 5 — Implementar adapter Pix real

### Estrutura de arquivos
```
src/infrastructure/pix/
├── PixProvider.ts        # Interface padrão
├── MockPixProvider.ts    # Implementação mock (atual)
├── GerencianetAdapter.ts # Implementação Gerencianet
├── OpenPixAdapter.ts     # Implementação OpenPix
└── PixWebhookHandler.ts  # Handler de callbacks
```

### Interface padrão (PixProvider.ts)
```typescript
export interface PixTransferRequest {
  amount: number;          // valor em centavos
  pixKey: string;          // chave destino
  description?: string;    // descrição
  idempotencyKey: string;  // chave única
}

export interface PixTransferResponse {
  externalId: string;      // ID do PSP
  status: "PENDING" | "SENT" | "CONFIRMED" | "FAILED";
  createdAt: Date;
}

export interface PixProvider {
  sendTransfer(request: PixTransferRequest): Promise<PixTransferResponse>;
  getStatus(externalId: string): Promise<PixTransferResponse>;
}
```

### Exemplo: Adapter Gerencianet
```typescript
import EfiPay from "sdk-node-apis-efi";

export class GerencianetAdapter implements PixProvider {
  private client: EfiPay;

  constructor(config: { clientId: string; clientSecret: string; certPath: string }) {
    this.client = new EfiPay({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      certificate: config.certPath,
      sandbox: process.env.PIX_ENV === "sandbox"
    });
  }

  async sendTransfer(request: PixTransferRequest): Promise<PixTransferResponse> {
    const body = {
      valor: (request.amount / 100).toFixed(2),
      pagador: { chave: process.env.PIX_KEY },
      favorecido: { chave: request.pixKey },
      solicitacaoPagador: request.description || "Troco TrocoZero"
    };

    const response = await this.client.pixSend({}, body);

    return {
      externalId: response.e2eId,
      status: "SENT",
      createdAt: new Date()
    };
  }

  async getStatus(externalId: string): Promise<PixTransferResponse> {
    const response = await this.client.pixDetailReceived({ e2eId: externalId });
    return {
      externalId: response.e2eId,
      status: response.status === "REALIZADO" ? "CONFIRMED" : "PENDING",
      createdAt: new Date(response.horario)
    };
  }
}
```

---

## Passo 6 — Configurar webhook

### Endpoint no TrocoZero
```
POST /pix/webhook
```

### Validação de segurança
- Verificar assinatura do PSP
- Validar IP de origem
- Registrar log imutável

### Exemplo de handler
```typescript
app.post("/pix/webhook", async (req, res) => {
  // 1. Validar assinatura
  const signature = req.headers["x-webhook-signature"];
  if (!validateSignature(req.body, signature)) {
    return res.status(401).send({ error: "INVALID_SIGNATURE" });
  }

  // 2. Processar evento
  const { e2eId, status } = req.body;
  
  if (status === "REALIZADO") {
    await confirmPixTransfer.executeByExternalId(e2eId);
  }

  // 3. Responder OK
  return res.send({ received: true });
});
```

---

## Passo 7 — Testar em sandbox

### Checklist de testes
- [ ] Criar venda em dinheiro
- [ ] Solicitar troco via Pix
- [ ] Pix enviado com sucesso
- [ ] Webhook recebido
- [ ] Status atualizado automaticamente
- [ ] Logs registrados
- [ ] Relatório diário correto
- [ ] Idempotência funcionando
- [ ] Fallback para erro funcionando

### Testes de erro
- [ ] Chave Pix inválida
- [ ] Saldo insuficiente
- [ ] Timeout de rede
- [ ] Webhook duplicado

---

## Passo 8 — Homologar com PSP

### Documentação necessária
- Fluxograma do sistema
- Logs de teste
- Evidência de tratamento de erros
- Contato técnico

### Processo típico
1. Abrir chamado de homologação
2. Enviar documentação
3. Técnico do PSP valida integração
4. Receber aprovação
5. Receber credenciais de produção

---

## Passo 9 — Ativar produção

### Checklist pré-produção
- [ ] Credenciais de produção configuradas
- [ ] HTTPS ativo
- [ ] Certificados válidos
- [ ] Backup de banco configurado
- [ ] Monitoramento ativo
- [ ] Alertas configurados
- [ ] Equipe de plantão definida

### Configuração final
```env
PIX_ENV=production
PIX_CLIENT_ID=prod_client_id
PIX_CLIENT_SECRET=prod_client_secret
```

### Ativação gradual
1. Ativar em **1 loja** primeiro
2. Monitorar 24h
3. Expandir gradualmente
4. Monitorar métricas

---

## Passo 10 — Monitorar e operar

### Métricas essenciais
- Taxa de sucesso de Pix
- Tempo médio de confirmação
- Erros por tipo
- Volume diário

### Alertas recomendados
- Taxa de erro > 5%
- Tempo de confirmação > 30s
- Webhook não recebido em 5min
- Saldo da conta < limite

---

## Troubleshooting

### Pix não enviado
1. Verificar credenciais
2. Verificar saldo
3. Verificar chave Pix destino
4. Verificar logs do PSP

### Webhook não recebido
1. Verificar URL pública
2. Verificar firewall
3. Verificar logs do PSP
4. Testar manualmente

### Pix duplicado
1. Verificar idempotência
2. Verificar logs
3. Estornar manualmente se necessário

---

## Suporte

Em caso de dúvidas técnicas:
- Abrir issue no GitHub
- Consultar documentação do PSP
- Contatar suporte técnico do PSP

---

**Versão:** 1.0  
**Última atualização:** Janeiro 2026
