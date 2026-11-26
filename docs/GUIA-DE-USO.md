# Guia de uso do EcoQuiz ADM

## 1. Acesso da professora

1. Abra o site publicado ou a página inicial local.
2. Entre na área da professora.
3. Autentique-se com uma conta administrativa previamente cadastrada no Firebase Authentication e autorizada na coleção de administradores.
4. Use o painel para cadastrar, editar ou remover perguntas e alternativas.

## 2. Preparar uma partida

1. No painel, selecione as perguntas que farão parte da rodada, conforme os controles disponíveis.
2. Crie a sala.
3. Compartilhe o PIN de seis dígitos ou o QR Code exibido na tela.
4. Aguarde os participantes aparecerem na lista da sala.
5. Inicie a partida quando todos estiverem prontos.

## 3. Entrar como participante

1. Abra o endereço do EcoQuiz.
2. Informe o PIN de seis dígitos. Se entrar pelo QR Code da sala, o PIN é preenchido automaticamente.
3. Digite um apelido e escolha um mascote.
4. Entre na sala e aguarde o início.
5. Leia a pergunta e selecione uma alternativa quando as opções forem liberadas.

## 4. Etapas e tempo

- A pergunta aparece primeiro sem as alternativas por 10 segundos.
- Em seguida, as alternativas ficam disponíveis por 15 segundos.
- O participante precisa enviar uma resposta dentro dessa janela.
- A pontuação considera a correção e o tempo de envio; respostas mais rápidas recebem mais pontos.

## 5. Encerramento e resultado

A professora controla o avanço das perguntas e o encerramento da sala. Ao final, a tela da professora apresenta a classificação e o pódio da partida. O participante acompanha sua pontuação na própria tela.

## 6. Teste recomendado

Antes de uma atividade oficial, faça uma partida de teste com alguns participantes e confira:

- entrada por PIN e QR Code;
- atualização da lista de participantes;
- exibição das perguntas e alternativas;
- registro de respostas;
- cálculo e atualização da pontuação;
- classificação final;
- retorno ao painel após encerrar a sala.

> O comportamento pode depender das regras publicadas no Firestore e da configuração do projeto Firebase. Para uma nova instalação, consulte também `CONFIGURACAO-FIREBASE.md` na raiz do repositório.
