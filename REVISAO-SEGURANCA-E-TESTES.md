# Revisão técnica — EcoQuiz ADM

## Correções aplicadas
- Removido o índice da alternativa correta do documento público `gameRooms/{id}`.
- Gabarito separado em `gameRooms/{id}/answerKeys/key`, com leitura exclusiva da professora responsável.
- Respostas separadas por jogador e número da pergunta, permitindo uma resposta por rodada sem sobrescrever rodadas anteriores.
- Aluno só pode criar resposta durante a fase válida, para a pergunta atual, com índice de alternativa entre 0 e 3.
- Alunos não podem listar respostas da turma nem alterar/excluir respostas já enviadas.
- Participantes só entram enquanto a sala está em espera.
- Professora só pode avançar após 23 segundos.
- Pontuação atualizada em lote atômico com a mudança da pergunta, evitando atualização parcial em caso de falha.
- Pontuação calculada usando a lista atual de participantes, não apenas uma cópia antiga em memória.

## Verificações feitas nesta revisão
- Sintaxe dos quatro módulos JavaScript principais validada com `node --check`.
- Conferida a ausência de `correct` no `questionSet` enviado para a sala.
- Conferido que os arquivos dos estudantes não leem a subcoleção `answerKeys`.
- Conferido que a gravação de respostas usa ID exclusivo por jogador/pergunta.
- Arquivos e imagens locais mantidos no pacote.

## Testes manuais necessários no Firebase
1. Publique `firestore.rules` no Console antes de abrir a nova versão.
2. Crie uma sala nova e confira em Firestore que `gameRooms/{id}/questionSet` não contém `correct`.
3. Confira que `gameRooms/{id}/answerKeys/key` contém `correctAnswers`.
4. Entre como estudante e tente consultar `answerKeys/key`: deve retornar `permission-denied`.
5. Entre com dois estudantes, responda a uma pergunta e confirme que a professora vê a contagem e a pontuação.
6. Confirme que o botão de avançar só é liberado após os 23 segundos.
7. Confirme que um aluno não consegue enviar outra resposta para a mesma pergunta nem ler as respostas dos colegas.
8. Complete uma partida e confira o pódio com 1, 2 e 3 participantes, além de participantes adicionais.

## Limitação
Não foi possível executar uma partida real contra o projeto Firebase a partir desta revisão. Portanto, a sintaxe JS foi verificada, mas as regras precisam ser publicadas e os testes manuais acima precisam ser feitos no projeto conectado. A pontuação ainda é calculada no navegador da professora; segurança de nível competitivo exigiria cálculo no servidor.
