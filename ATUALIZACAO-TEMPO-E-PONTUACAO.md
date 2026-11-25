# Atualização do tempo e da pontuação

## Duração de cada pergunta
- 10 segundos para ler o enunciado.
- 15 segundos para responder.
- Total: 25 segundos.

## Pontuação
- Entre 15 e 13 segundos restantes: 1000 pontos.
- De 13 segundos até 0: redução linear e contínua até 0 pontos.
- Respostas incorretas: 0 pontos.

## Arquivos atualizados
- `sala.js`: exibição do cronômetro e janela de envio da resposta.
- `professora/sala-professora.js`: cronômetro da professora, liberação do avanço automático e cálculo dos pontos.
- `professora/script.js`: duração registrada ao criar a sala.
- `firestore.rules`: permite envio até o limite correto de 25 segundos totais.

**Importante:** publique novamente `firestore.rules` no Firebase Console. Crie uma sala nova para testar; salas antigas mantêm seus dados e não servem para validar a nova configuração.
