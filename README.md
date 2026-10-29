# Claude diretor

Transforma o Claude Code num diretor de vídeo. Você grava um vídeo falando para a câmera, e o Claude:

1. corta as pausas e as tomadas repetidas;
2. transcreve a sua fala com o tempo de cada palavra;
3. escolhe um efeito para cada frase, de acordo com o que você disse;
4. te mostra o plano para você aprovar ou mudar;
5. entrega o MP4 vertical pronto para Reels, TikTok e Shorts, com legenda palavra por palavra e efeitos sonoros.

![O mesmo momento do vídeo, antes e depois do Claude diretor](docs/antes-depois.jpg)

Os efeitos são feitos em código com [Remotion](https://www.remotion.dev): letreiro de neon acendendo atrás da sua cabeça, letras gigantes atrás de você, telas girando em 3D, vídeo dentro do texto, widgets de vidro, freeze frame com ranking, curtidas subindo, folha de contato, tela dividida com o Claude, checklist, gráfico de comparação e chamada final.

<p align="center">
  <img src="docs/efeito-orbita.gif" width="190" alt="Telas girando em 3D atrás da pessoa">
  <img src="docs/efeito-texto.gif" width="190" alt="Vídeo dentro do texto ZERO EDITOR">
  <img src="docs/efeito-widgets.gif" width="190" alt="Widgets de vidro aparecendo">
  <img src="docs/efeito-split.gif" width="190" alt="Tela dividida com o Claude digitando o comando">
</p>

![Os efeitos, um quadro de cada](docs/efeitos.jpg)

Cada vídeo pode ter um tema (padrão, neon, limpo, editorial ou retrô), que troca as fontes e as cores de todos os efeitos, e um estilo de legenda. Os efeitos sonoros (pop, whoosh, ding, clique, zumbido de neon) entram sozinhos no tempo certo. Eles foram gerados por código neste repositório, então não têm direitos de terceiros.

## Como funciona

O segredo está nas **skills**: arquivos de instruções que ensinam o Claude a editar como um diretor de vídeo. Antes de começar, ele lê essas instruções e passa a saber o que cortar, que efeito combina com cada frase, onde pôr a legenda para não cobrir o seu rosto e como conferir o resultado antes de te entregar.

É como dar a um editor o manual do seu estilo: o Claude continua sendo o Claude, mas com o contexto certo para editar o seu vídeo do jeito que fica bom.

## O que você precisa

- Um computador (Mac, Windows ou Linux). Não funciona no celular.
- O app do Claude ([claude.com/download](https://claude.com/download)) num plano pago (Pro ou maior). O Claude Code fica na aba **Code** do app.
- Internet na hora de renderizar (as fontes vêm do Google Fonts).

O Claude instala o resto (ffmpeg, Node.js e Python) na primeira vez, te explicando cada passo.

## Como usar

### Jeito mais fácil: cole o link no Claude

1. Abra o app do Claude, vá na aba **Code** e escolha uma pasta qualquer.
2. Cole esta mensagem:

   > Quero usar o diretor de vídeo do github.com/Raquelmms/claude-diretor. Baixe o repositório para uma pasta chamada claude-diretor dentro da minha pasta de usuário (se não tiver git, baixe o ZIP). Depois leia o arquivo .claude/skills/diretor/SKILL.md e siga as instruções dele. Instale o que faltar (ffmpeg, Node.js e Python), me explicando cada passo antes de instalar. Quando terminar, me peça o vídeo.

3. Quando ele pedir, mande o seu vídeo. Ele mostra o plano dos efeitos, você aprova e o vídeo sai pronto.

**Da próxima vez:** abra a pasta `claude-diretor` na aba Code e digite `/diretor`.

### Pelo terminal

```bash
git clone https://github.com/Raquelmms/claude-diretor.git
cd claude-diretor
claude
```

Ponha o vídeo na pasta `input/` e digite `/diretor`. O vídeo sai em `output/video.mp4`.

Para mudar um texto ou trocar um efeito depois, é só pedir ("troca o gráfico por um checklist", "muda o texto do final para SEGUE", "usa o tema editorial"). O Claude edita o plano e renderiza de novo.

## Dicas de gravação

- Grave na vertical, olhando para a câmera, com luz de frente e fundo simples.
- Deixe espaço acima da cabeça. Os textos e cards entram ali.
- Faça meio segundo de pausa entre as frases. É onde o efeito entra.
- Se errar, pare e repita a frase inteira. O diretor fica só com a última tomada.

## Como o projeto é organizado

| Pasta | O que tem |
|---|---|
| `.claude/skills/diretor/` | As instruções que fazem o Claude agir como diretor |
| `scripts/` | `prepare.py` (cortes, cor e transcrição), `cutout.py` (recorte da pessoa), `generate_sounds.py` (efeitos sonoros) |
| `remotion/src/effects/` | Os efeitos |
| `remotion/src/data/plan.example.json` | Exemplo de plano |

## Privacidade

**O seu vídeo fica no seu computador.** Ele não é enviado para nenhum site ou aplicativo de edição: cortar, transcrever e gerar o vídeo final acontece tudo na sua máquina.

## Licenças

O código deste repositório é MIT. O Remotion é gratuito para uso individual e para empresas pequenas; empresas maiores precisam de licença (veja [remotion.dev/license](https://www.remotion.dev/license)).
