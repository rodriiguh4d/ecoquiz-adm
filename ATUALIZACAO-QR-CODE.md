# Atualização: QR Code da sala

- A tela da professora agora mostra um QR Code junto ao PIN.
- Ao escanear, o aluno abre a página inicial com o PIN preenchido automaticamente.
- O QR Code é gerado pelo serviço externo QRServer e precisa de conexão com a internet para carregar.
- Para alunos acessarem pelo celular, o site precisa estar publicado ou acessível pela rede local. Um endereço `localhost` só funciona no próprio computador.
- Não foi necessário alterar as regras do Firestore.
