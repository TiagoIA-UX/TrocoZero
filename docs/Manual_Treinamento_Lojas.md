# Manual de Treinamento — TrocoZero

## Objetivo
Garantir agilidade no caixa, reduzir conflitos e evitar erros ao oferecer troco via Pix.

## Quem usa
Operadores de caixa e supervisores.

## Fluxo simples no caixa
1. Registrar venda normalmente.
2. Informar ao cliente o valor do troco.
3. Perguntar: **"Quer receber seu troco via Pix?"**
4. Se sim, solicitar a chave Pix.
5. Confirmar a chave antes de enviar.
6. Confirmar status de envio/confirmacao na tela.
7. Finalizar a venda.

## Script de atendimento recomendado
- "Seu troco é R$ X, posso enviar via Pix?"
- "Qual sua chave Pix?"
- "Confirmo a chave: xxx. Posso enviar?"
- "Pix enviado/confirmado. Obrigado!"

## Regras de ouro
- Nunca enviar Pix sem confirmar a chave.
- Nunca repetir envio se já estiver “confirmado”.
- Se o Pix falhar, oferecer troco físico imediatamente.

## Fallback (quando Pix falhar)
1. Informar: “Pix indisponível no momento”.
2. Entregar troco em espécie.
3. Encerrar a venda normalmente.

## Boas práticas
- Manter o sistema sempre logado.
- Evitar atrasos na tela do caixa.
- Chamar supervisor em caso de falha repetida.

## Dúvidas frequentes
**Pix demorou a confirmar, o que faço?**  
Se não confirmar em até 5 segundos, use o fallback.

**Cliente não tem chave Pix?**  
Entregar troco em espécie.

**Posso cancelar um Pix enviado?**  
Não no MVP. Encaminhar para supervisor.
