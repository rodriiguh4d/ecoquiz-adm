# Correção: pontuação e avanço automático

- A professora agora contabiliza as respostas automaticamente ao final dos 23 segundos de cada pergunta.
- O avanço automático usa uma trava por pergunta para evitar execução duplicada.
- A pontuação valida jogador, UID, índice da pergunta e alternativa selecionada.
- A resposta correta recebe pontuação com base no tempo de resposta; o fallback de timestamp evita descartar uma resposta correta caso o timestamp ainda não esteja disponível na leitura.
- A tela do aluno exibe o código do erro do Firestore quando o envio falha, facilitando diagnóstico.

## Atualização
Substitua os arquivos do projeto pela versão deste pacote. Publique `firestore.rules` novamente no Firebase se elas ainda não forem as regras da versão atual. Crie uma sala nova para o teste.

## Limitação importante
A pontuação ainda é calculada no navegador da professora. Para impedir manipulação por clientes maliciosos seria necessário transferir a validação para um backend confiável, como Cloud Functions.
