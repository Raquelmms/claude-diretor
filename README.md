# Claude diretor

Transforma o Claude Code num diretor de vídeo. Você grava um vídeo falando para a câmera, digita `/diretor`, e o Claude:

1. corta as pausas e as tomadas repetidas;
2. transcreve a sua fala com o tempo de cada palavra;
3. escolhe um efeito para cada frase, de acordo com o que você disse;
4. te mostra o plano para você aprovar ou mudar;
5. entrega o MP4 vertical pronto para Reels, TikTok e Shorts, com legenda palavra por palavra.

Os efeitos são feitos em código com [Remotion](https://www.remotion.dev): letreiro de neon acendendo atrás da sua cabeça, letras gigantes atrás de você, telas girando em 3D, vídeo dentro do texto, widgets de vidro, freeze frame com ranking, curtidas subindo, folha de contato, tela dividida com o Claude, checklist, gráfico de comparação e chamada final.

Cada vídeo pode ter um tema (padrão, neon, limpo, editorial ou retro), que troca as fontes e as cores de todos os efeitos, e um estilo de legenda. Os efeitos sonoros (pop, whoosh, ding, clique, zumbido de neon) entram sozinhos no tempo certo. Eles foram gerados por código neste repositório, então não têm direitos de terceiros.

## O que você precisa

- Um computador (Mac, Linux ou Windows com WSL).
- [Claude Code](https://claude.com/claude-code) num plano pago do Claude.
- [ffmpeg](https://ffmpeg.org/download.html), [Node.js](https://nodejs.org) 18 ou mais novo e Python 3.10 ou mais novo.
- Internet na hora de renderizar (as fontes vêm do Google Fonts).

## Como usar

1. Baixe este repositório e abra o Claude Code dentro da pasta:

   ```bash
   git clone https://github.com/Raquelmms/claude-diretor.git
   cd claude-diretor
   claude
   ```

2. Ponha o seu vídeo na pasta `entrada/` (ou só diga ao Claude onde ele está).
3. Digite `/diretor`. Na primeira vez o Claude instala o que falta, o que leva alguns minutos.
4. Leia o plano que ele propõe, peça mudanças se quiser, e aprove.
5. O vídeo sai em `saida/video.mp4`.

Para mudar um texto ou trocar um efeito depois, é só pedir ("troca o gráfico por um checklist", "muda o texto do final para SEGUE"). O Claude edita o plano e renderiza de novo.

## Dicas de gravação

- Grave na vertical, olhando para a câmera, com luz de frente e fundo simples.
- Deixe espaço acima da cabeça. Os textos e cards entram ali.
- Faça meio segundo de pausa entre as frases. É onde o efeito entra.
- Se errar, pare e repita a frase inteira. O diretor fica só com a última tomada.

## Privacidade

Tudo roda no seu computador. O seu vídeo, a transcrição e o plano ficam em pastas que o git ignora (`entrada/`, `saida/`, `trabalho/` e os arquivos gerados em `remotion/`), então não vão para nenhum lugar se você publicar um fork.

## Licenças

O código deste repositório é MIT. O Remotion é gratuito para uso individual e para empresas pequenas; empresas maiores precisam de licença (veja [remotion.dev/license](https://www.remotion.dev/license)).
