# EcoQuiz ADM — Firebase e administradores

## Conteúdo
- `firebase.js`: configuração do aplicativo Firebase.
- `firestore.rules`: regras de segurança para perguntas, convites e administradores.
- `professora/`: painel com login, perguntas e gerenciamento de colaboradores.
- `index.html`: página inicial do site.

## Atenção: etapa obrigatória de configuração inicial
O primeiro administrador (a professora principal) precisa ser cadastrado manualmente uma única vez, pois não existe ainda um administrador autorizado a convidar outras pessoas.

1. No Firebase Console, abra Authentication > Usuários e copie o UID completo da conta da professora.
2. Abra Firestore > Dados > Iniciar coleção.
3. Nome da coleção: `adminUsers`.
4. ID do documento: cole o UID completo da professora.
5. Crie os campos:
   - `email` (string): e-mail exato da conta cadastrada no Authentication, em letras minúsculas.
   - `role` (string): `owner`
6. Publique o conteúdo de `firestore.rules` na aba Regras do Firestore.

Depois disso, a professora poderá entrar no painel e convidar colaboradores.

## Como convidar colaboradores
1. A professora entra no painel usando sua conta Firebase Authentication.
2. Em Gerenciar administradores, informa o e-mail do colaborador e clica em Gerar convite.
3. Compartilha manualmente o endereço do site com a pessoa.
4. A pessoa abre o painel, seleciona Aceitar convite e cria uma conta com o mesmo e-mail convidado.
5. O sistema cria o registro de administrador. O colaborador poderá cadastrar, editar e excluir perguntas, mas não poderá convidar outras pessoas nem administrar a equipe.

O convite é registrado no Firestore. O Firebase Authentication não envia o convite por e-mail automaticamente nesta versão; por isso o compartilhamento é manual.

## Imagens e plano gratuito
Para não depender do Firebase Storage (que no projeto atual está solicitando upgrade para Blaze), esta versão grava imagens pequenas como dados no próprio documento Firestore. O limite no formulário é 100 KB por imagem. Isso é uma solução inicial para poucos itens, não é ideal para um banco grande de imagens. Para escala, use um serviço de armazenamento de objetos com plano adequado e regras próprias.

## Publicação e teste
Abra o projeto por um servidor local ou publique-o em hospedagem HTTPS. Módulos JavaScript do Firebase podem não funcionar ao abrir arquivos HTML diretamente com `file://`.


## Salas com PIN — ativação necessária
1. Firebase Console > Authentication > Método de login.
2. Ative o provedor **Anônimo** e salve. Isso permite que estudantes entrem sem criar conta.
3. Firestore > Regras: publique novamente as regras do arquivo `firestore.rules` incluído neste ZIP.
4. Abra o projeto usando Live Server (não `file://`).
5. A professora entra no painel, cria uma sala e compartilha o PIN.
6. Os estudantes abrem a página inicial, informam PIN e apelido. A professora vê os participantes chegando em tempo real.

A versão atual também inclui perguntas ao vivo, temporizador de 23 segundos (10 segundos para leitura + 13 segundos para responder), pontuação de até 1.000 pontos e pódio final.

## Segurança do gabarito e atualização obrigatória
O gabarito não fica mais no documento público da sala. Ele é salvo em `gameRooms/{id}/answerKeys/key`, e as regras permitem que somente a professora responsável leia essa subcoleção. As respostas dos estudantes ficam isoladas por participante e pergunta; cada estudante só pode criar uma resposta por pergunta, dentro da janela de tempo.

**Importante:** depois de substituir os arquivos, publique novamente as regras de `firestore.rules` no Console do Firebase antes de testar. Crie salas novas: salas antigas podem continuar contendo o campo `correct` no documento público e não devem ser reutilizadas. Exclua ou encerre as salas antigas após conferir que não precisa mais delas.

## Limite de confiança desta versão
A validação de tempo e o cálculo da pontuação são coordenados pelo navegador da professora, sem Cloud Functions. As regras do Firestore protegem o gabarito e restringem gravações dos alunos, mas uma versão com validação totalmente independente do navegador exigiria lógica no servidor (por exemplo, Cloud Functions), que pode exigir plano de cobrança no Firebase.
