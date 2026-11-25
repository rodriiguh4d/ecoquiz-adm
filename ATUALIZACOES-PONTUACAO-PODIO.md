# EcoQuiz ADM — atualização do jogo

- Personagens compactos na lista da professora.
- Pódio final com 1º ouro, 2º prata e 3º bronze; demais participantes aparecem em chips menores.
- Cada pergunta fica visível por 10 segundos antes de liberar as alternativas.
- Depois, abre uma janela de 13 segundos para responder.
- Resposta correta vale até 1.000 pontos: 1.000 nos primeiros 2 segundos da fase de resposta e redução linear até 0 no segundo 13.
- Respostas incorretas ou fora do tempo valem 0.

Após esta revisão, publique obrigatoriamente o conteúdo atualizado de `firestore.rules`. Salas antigas devem ser encerradas e não reutilizadas, pois podem manter o gabarito no documento público. Crie uma sala nova para testar.

O gabarito agora fica em uma subcoleção privada, e cada aluno só pode enviar uma resposta por pergunta. Consulte `REVISAO-SEGURANCA-E-TESTES.md` para a lista de verificações.
