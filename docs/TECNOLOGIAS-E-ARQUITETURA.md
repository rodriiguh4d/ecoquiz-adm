# Tecnologias e arquitetura

## Visão geral

O EcoQuiz ADM é uma aplicação web composta por páginas HTML, estilos CSS e módulos JavaScript no navegador. O Firebase fornece autenticação, persistência de dados em nuvem e hospedagem.

## Tecnologias utilizadas

| Tecnologia | Responsabilidade |
|---|---|
| HTML5 | Estrutura das páginas de entrada, partida e painel administrativo. |
| CSS3 | Identidade visual, organização dos componentes e adaptação de tela. |
| JavaScript ES Modules | Regras da interface, navegação, temporizadores e comunicação com o Firebase. |
| Firebase Authentication | Login da professora e autenticação anônima dos participantes. |
| Cloud Firestore | Armazenamento de perguntas, salas, participantes, respostas e pontuações. |
| Firebase Hosting | Publicação e distribuição do site. |

## Fluxo de dados simplificado

1. A professora autentica-se e utiliza o painel administrativo.
2. As perguntas são armazenadas no Firestore.
3. Ao criar uma partida, o sistema registra uma sala e disponibiliza um PIN.
4. O participante informa o PIN ou utiliza o QR Code, escolhe apelido e mascote e entra na sala.
5. O navegador acompanha as alterações da sala e do próprio participante em tempo real.
6. As respostas são registradas no Firestore e a lógica da partida atualiza a pontuação.
7. Ao terminar, a interface da professora apresenta a classificação final.

## Organização dos arquivos

- `index.html`, `script.js` e `style.css`: entrada do participante.
- `sala.html` e `sala.js`: interface e comportamento do participante durante a partida.
- `professora/`: autenticação, painel administrativo e controle da sala.
- `firebase.js`: inicialização dos serviços Firebase no navegador.
- `firestore.rules`: regras de acesso aos documentos do banco.
- `assets/personagens/`: imagens dos mascotes.
- `firebase.json`: configuração do Firebase Hosting.

## Modelo de dados (visão conceitual)

- `questions`: perguntas cadastradas pela equipe administrativa.
- `adminUsers`: registros de autorização administrativa.
- `invites`: convites para acesso administrativo, quando utilizados.
- `gameRooms`: dados e estado de cada partida.
- `gameRooms/{roomId}/players`: participantes e pontuações.
- `gameRooms/{roomId}/answers`: respostas enviadas durante a partida.
- `gameRooms/{roomId}/answerKeys`: gabarito separado dos dados públicos da sala, quando utilizado pela versão implantada.

## Segurança e operação

- As permissões efetivas são definidas pelas regras do Firestore, não apenas pela interface.
- Contas administrativas devem ser autorizadas no Firebase Authentication e nos documentos de controle correspondentes.
- A chave de configuração do Firebase usada no navegador não é uma senha de servidor; a proteção dos dados depende de regras corretas, restrições da API key e controles do projeto.
- Não publique senhas, tokens privados, chaves de service account ou arquivos de credenciais.
- A lógica executada no navegador não substitui validação autoritativa no servidor para cenários que exijam resistência a clientes modificados. Para uso em escala ou com dados sensíveis, considere processamento confiável no backend.

## Publicação

O site está publicado em [https://ecoquiz-adm.web.app](https://ecoquiz-adm.web.app). Para atualizar a hospedagem a partir da pasta do projeto, utilize a Firebase CLI autenticada e execute `firebase deploy` após revisar os arquivos e as regras.
