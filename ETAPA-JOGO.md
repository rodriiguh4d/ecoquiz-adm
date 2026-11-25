# EcoQuiz ADM — etapa de partida ao vivo

Esta versão inclui:
- perguntas sincronizadas para todos os alunos;
- 10 segundos para leitura da pergunta e 13 segundos para responder;
- uma resposta por aluno em cada pergunta;
- pontuação de até 1.000 pontos por resposta correta, decrescente conforme o tempo de resposta;
- avanço manual pela professora somente após os 23 segundos;
- ranking e pódio final.

## Atualização
1. Substitua a pasta antiga pela pasta `EcoQuiz-ADM` deste pacote (ou copie os arquivos mantendo a estrutura).
2. Publique novamente o conteúdo completo de `firestore.rules` no Firestore.
3. Abra o projeto com Live Server.
4. Crie uma sala nova. Salas antigas podem conter o gabarito no documento público e não devem ser reutilizadas.

## Segurança
O gabarito fica na subcoleção `answerKeys`, acessível somente à professora responsável. Os alunos não podem consultar respostas de outros participantes nem alterar uma resposta já enviada. Cada resposta usa um documento próprio por jogador e pergunta.

## Limitação conhecida
A pontuação é calculada no navegador da professora. As regras protegem os dados dos estudantes e o gabarito, mas não substituem uma validação de pontuação executada em servidor confiável.
