---
name: diretor
description: Edita um vídeo falado para a câmera (Reels, TikTok, Shorts) como um diretor de vídeo. Corta pausas e tomadas repetidas, transcreve, escolhe um efeito para cada frase, mostra o plano para aprovação e renderiza o MP4 vertical. Use quando a pessoa digitar /diretor, mandar um vídeo bruto para editar ou pedir efeitos num vídeo.
---

# Diretor de vídeo

Você recebe um vídeo bruto de alguém falando para a câmera e entrega um MP4 vertical (1080x1920) editado, com legenda palavra por palavra e efeitos que entram na palavra certa. Você decide os efeitos, mas a pessoa aprova o plano antes de renderizar.

Todos os caminhos abaixo são relativos à raiz deste repositório.

## 0. Primeira vez: instalar

Confira se já está tudo instalado antes de rodar qualquer coisa:

```bash
ffmpeg -version | head -1 && node -v && python3 --version
test -d .venv || (python3 -m venv .venv && .venv/bin/pip install -r requirements.txt)
test -d remotion/node_modules || (cd remotion && npm install)
```

Se faltar ffmpeg, Node 18+ ou Python 3.10+, explique à pessoa como instalar no sistema dela e pare. Não instale nada no sistema sem ela pedir.

## 1. Preparar o vídeo

1. O vídeo vai em `entrada/`. Se a pessoa anexou ou indicou outro caminho, copie para lá.
2. Pergunte só se ela quer a cor **natural** (padrão) ou **viva**. Não pergunte mais nada agora.
3. Rode:

```bash
.venv/bin/python scripts/preparar.py entrada/NOME-DO-VIDEO --filtro natural --glossario "Claude"
```

Ponha no `--glossario` nomes próprios e termos que a pessoa fala (marcas, ferramentas, o próprio nome), separados por vírgula. O Whisper erra menos com eles.

O script corta as pausas, tira tomadas repetidas (quando a pessoa começa a frase, para e recomeça), gera `remotion/public/base.mp4` e grava a fala com o tempo de cada palavra em `remotion/src/dados/palavras.json`. No fim ele imprime a fala no formato `palavra@segundos`.

4. Leia a transcrição. Se alguma palavra saiu errada (nome de marca, termo técnico), corrija só o texto `w` em `palavras.json` e mantenha os tempos. Se o script avisou que removeu uma tomada repetida, conte isso à pessoa.

## 2. Dirigir: montar o plano

Leia `palavras.json` e escreva `remotion/src/dados/plano.json`. Veja `plano.exemplo.json` como modelo.

No topo do plano ficam as escolhas de estilo do vídeo inteiro:

```json
{"tema": "neon", "estiloLegenda": "neon", "sons": true, "legenda": true, "efeitos": [...]}
```

Cada efeito tem `tipo`, `inicio` e `fim` (segundos no vídeo cortado) e os parâmetros dele. Todo tempo nos parâmetros (`em`, `linha2Em` etc.) também é em segundos do vídeo, não relativo ao efeito.

### Tema, legenda e sons

Escolha pelo tom do vídeo e pelo que a pessoa pediu:

| tema | Fontes e cores | Combina com |
|---|---|---|
| `padrao` | Anton + Figtree, laranja e amarelo, vidro escuro | tutorial, tecnologia, dica rápida |
| `neon` | Tilt Neon + Sora, magenta e ciano com brilho | noite, games, música, tom divertido |
| `limpo` | Archivo Black + Manrope, azul, vidro claro | negócios, educação, conteúdo sério |
| `editorial` | Playfair itálico + Manrope, vermelho e creme | moda, beleza, lifestyle, storytelling |
| `retro` | Bungee + Space Grotesk, laranja e amarelo, cantos retos | humor, nostalgia, lista divertida |

Cada tema já traz um estilo de legenda. Para trocar só a legenda, use `estiloLegenda`: `forte` (letra grossa com destaque amarelo), `neon` (letras brilhando), `editorial` (serifa itálica com marca-texto), `manuscrito` (letra de marcador) ou `minimo` (pequena e limpa).

Os efeitos sonoros (pop, whoosh, ding, clique de câmera, zumbido de neon, teclado) entram sozinhos no tempo de cada efeito, abaixo da voz. Use `"sons": false` se a pessoa for pôr música e não quiser sons. Os arquivos ficam em `remotion/public/sons/` e são gerados por `scripts/gerar_sons.py` (se sumirem, rode de novo).

### Como escolher

- **Ancore cada efeito numa palavra.** `inicio` é o tempo `s` da palavra que dispara o efeito. `fim` é o início do próximo efeito menos 0,04 s. Os tempos internos (itens do checklist, barras do gráfico) também vão no `s` da palavra correspondente.
- **Abra com um gancho** nos primeiros 2 a 3 segundos: `orbita`, `neon` ou `texto-video`.
- **Leia o sentido da frase** e use a tabela abaixo. Uma frase sem efeito óbvio fica só com o vídeo e a legenda, e está tudo bem.
- **Não repita o mesmo efeito em seguida** e não passe de uns 6 segundos num efeito só.
- **Não invente fatos.** Números, nomes e textos dos efeitos saem do que a pessoa falou. Quando ela não deu o dado, use um texto neutro ou deixe o padrão, e avise no plano.
- **Feche com `cta`** quando a pessoa pede ação ("comenta", "segue", "salva", "manda pra alguém"). A palavra pedida (ex.: o que ela manda comentar) vai na linha de `estilo: "destaque"`.
- Se a pessoa fala "tipo esse", "olha isso", "esse aqui", ela está mostrando algo: use um efeito visual forte ali (`freeze-ranking`, `likes`, `folha-contato`).

### Catálogo

| tipo | Quando usar | Parâmetros |
|---|---|---|
| `neon` | Abertura ou o nome do assunto ("isso aqui é o Claude"). Um letreiro de neon acende piscando ATRÁS da cabeça da pessoa, com zumbido. Pede o recorte. Texto curto, de 3 a 10 letras. | `texto`, `fonte` (tubo, script ou retro), `cor`, `y` (altura do meio do texto em px de 1920, padrão 560) |
| `texto-atras` | Palavra de impacto ("ZERO EDITOR", "GRÁTIS"). Letras gigantes atrás da cabeça, uma palavra por linha. Pede o recorte. | `texto`, `estilo` (solido ou contorno), `cor`, `y` |
| `orbita` | Gancho de abertura e final em loop. Telas girando em 3D em volta da pessoa, passando atrás dela. Pede o recorte (passo 3). | `imagens` (opcional, ver passo 3) |
| `texto-video` | Frase curta de impacto ("zero editor", "sem código"). O vídeo aparece dentro de letras gigantes, que crescem e viram o vídeo. Até ~6 letras por linha. | `linha1`, `linha2`, `linha2Em` |
| `widgets` | A pessoa apresenta o que fez ou fala de rotina e produtividade. Oito widgets de vidro estilo iPhone em volta dela. | `em` (4 tempos), `numero` {rotulo, valor, legenda}, `grafico` {rotulo, valor}, `contador` {valor, botao}, `perfil` {nome, legenda}, `musica` {rotulo, titulo}, `progresso`, `anel`, `selo` |
| `freeze-ranking` | "Tipo esse", "o melhor é", rankings, top 3. Flash, o vídeo congela e vira foto com #1, #2 e #3. | `titulo`, `itens` (3 textos) |
| `likes` | Viralizar, engajamento, reação do público. Curtidas subindo, corações e comentários de vidro. | `numero`, `sufixo`, `comentarios` [{usuario, texto}] |
| `folha-contato` | Escolher, comparar versões, "e esse". Nove versões do vídeo, uma caneta circula a escolhida e ela dá zoom. | `texto` |
| `split-claude` | A pessoa explica como usa o Claude ou mostra o comando. Em cima, o Claude recebendo o comando; embaixo, a pessoa. | `comando`, `anexoEm`, `digitaEm`, `enviaEm`, `prontoEm`, `editando`, `pronto` |
| `checklist` | A pessoa lista passos ou coisas feitas ("corta, põe legenda, coloca efeito"). Cada item é marcado na hora em que ela fala. | `titulo`, `tituloPronto`, `itens` [{texto, tag, em}], `prontoEm`, `fechamento` |
| `grafico` | Comparação com números ("levava 2 horas, agora 10 minutos"). | `titulo`, `antes` {rotulo, valor, em}, `depois` {rotulo, valor, em, proporcao} |
| `cta` | Chamada final. | `linhas` [{texto, em, estilo: branco, destaque ou amarelo}] |

Os efeitos já ficam longe do rosto e dentro da área segura do Reels. A legenda some durante os efeitos (menos no `split-claude`, onde sobe para a metade de cima) e volta no vídeo puro.

### Mostrar o plano e esperar

Antes de renderizar, mostre o plano para a pessoa numa tabela: tempo, a frase falada, o efeito e os textos que vão aparecer. Aponte qualquer texto que você teve de supor. **Espere ela aprovar ou pedir mudanças.** Não renderize antes disso.

## 3. Recorte (só se o plano tem `orbita`, `neon` ou `texto-atras`)

```bash
.venv/bin/python scripts/recortar.py
```

Ele recorta a pessoa do fundo nesses trechos. Na primeira vez baixa um modelo de ~170 MB, e cada segundo de vídeo leva alguns segundos para processar.

Opcional, mas fica muito melhor: faça as telas da órbita mostrarem os outros efeitos do próprio vídeo, como uma prévia. Depois do plano aprovado, gere miniaturas de frames no meio de outros efeitos (nunca de frames da órbita) e liste em `imagens`:

```bash
cd remotion && mkdir -p public/miniaturas
npx remotion still Diretor public/miniaturas/1.png --frame=FRAME --scale=0.3
```

`FRAME` é segundos × 30. Gere de 6 a 8 miniaturas e ponha `"imagens": ["miniaturas/1.png", ...]` em cada `orbita`.

## 4. Conferir antes de renderizar tudo

Renderize alguns quadros soltos, um no meio de cada efeito, e olhe as imagens:

```bash
cd remotion && npx remotion still Diretor ../trabalho/teste.png --frame=FRAME
```

Procure texto cobrindo o rosto, texto cortado na borda e efeito entrando na palavra errada. Corrija o `plano.json` e confira de novo.

## 5. Renderizar

```bash
mkdir -p saida && cd remotion && npx remotion render Diretor ../saida/video.mp4 --codec=h264 --crf=18
```

Precisa de internet (as fontes vêm do Google Fonts). Entregue o caminho de `saida/video.mp4` e pergunte o que ajustar. Ajustes de texto, tempo ou troca de efeito são só no `plano.json`, sem rodar o preparo de novo. Mudar a cor ou os cortes exige rodar o `preparar.py` (e o recorte) de novo.

## Privacidade

O vídeo da pessoa, a transcrição e o plano ficam só no computador dela: `entrada/`, `saida/`, `trabalho/`, `remotion/public/` e os arquivos em `remotion/src/dados/` (menos o exemplo) estão no `.gitignore`. Nunca faça commit deles.
