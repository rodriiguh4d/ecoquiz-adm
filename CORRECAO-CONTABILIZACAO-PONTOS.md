# Correção da contabilização dos pontos

A resposta agora salva `responseTimeMs`, o tempo decorrido desde o início da pergunta no instante do clique.

A professora calcula a pontuação usando esse valor, em vez de depender da conversão do timestamp do Firestore e da diferença entre relógios dos navegadores.

Regra:
- 10.000 ms iniciais: leitura do enunciado.
- 10.000 a 12.000 ms: 1.000 pontos.
- 12.000 a 25.000 ms: redução linear até zero.
- Após 25.000 ms: resposta fora do prazo.

Importante: respostas de salas antigas não possuem `responseTimeMs`. Para validar a correção, crie uma sala nova usando esta versão.
