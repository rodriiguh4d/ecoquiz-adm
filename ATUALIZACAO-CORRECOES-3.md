# Correções 3

- QR Code agora fica acima do PIN, centralizado.
- Ao clicar em iniciar, a sala entra em `countdown` por 5 segundos; os alunos veem a contagem regressiva. Depois a professora libera a primeira pergunta e começa o cronômetro normal.
- Ajustado o fluxo de gravação e validação das respostas e o cálculo de pontuação para conferir jogador, pergunta, alternativa e horário do envio.
- As regras Firestore continuam limitando envio à pergunta atual e à janela de resposta; a validação do campo `answeredAt` aceita Timestamp do servidor sem depender de igualdade frágil com `request.time`.

**Atenção:** publique o novo `firestore.rules` no Firebase antes de testar. Crie uma sala nova para cada teste.
