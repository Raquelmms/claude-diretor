---
name: diretor
description: Edits a talking-head video (Reels, TikTok, Shorts) like a video director. Cuts pauses and repeated takes, transcribes, picks an effect for each sentence, shows the plan for approval and renders the vertical MP4. Use when the person types /diretor, sends a raw video to edit, or asks for effects on a video.
---

# Video director

You get a raw video of someone talking to the camera and deliver an edited vertical MP4 (1080x1920) with word-by-word captions, sound effects and effects that land on the right word. You pick the effects; the person approves the plan before you render.

**Talk to the person in their own language** (the one they write in). Every text that shows up in the video must be in the language spoken in the video.

All paths below are relative to the root of this repository. If the person pasted the repository link in another folder, clone it first (or download the ZIP if git is missing) and work inside it.

## 0. First time: install

Check what is already installed before running anything:

```bash
ffmpeg -version | head -1 && node -v && python3 --version
test -d .venv || (python3 -m venv .venv && .venv/bin/pip install -r requirements.txt)
test -d remotion/node_modules || (cd remotion && npm install)
```

If ffmpeg, Node 18+ or Python 3.10+ is missing, explain to the person how to install it on their system, step by step, and ask before installing anything.

## 1. Prepare the video

1. The video goes in `input/`. If the person attached it or gave another path, copy it there.
2. Ask only one thing: **natural** color (default) or **vivid**.
3. Run:

```bash
.venv/bin/python scripts/prepare.py input/VIDEO-NAME --filter natural --glossary "Claude"
```

Put in `--glossary` the proper names and terms the person says (brands, tools, their own name), comma separated. Whisper gets them wrong less often. The language is detected automatically; use `--language pt` (or `en`, `es`…) to force it.

The script cuts pauses, removes repeated takes (when the person starts a sentence, stops and starts again), writes `remotion/public/base.mp4`, and saves the speech with the time of each word in `remotion/src/data/words.json`. At the end it prints the speech as `word@seconds`.

4. Read the transcript. If a word came out wrong (brand name, technical term), fix only its `w` text in `words.json` and keep the times. If the script reported a removed repeated take, tell the person.

## 2. Direct: write the plan

Read `words.json` and write `remotion/src/data/plan.json`. Use `plan.example.json` as a model.

The top of the plan holds the style choices for the whole video:

```json
{"theme": "neon", "captionStyle": "neon", "sounds": true, "captions": true, "effects": [...]}
```

Every effect has `type`, `start` and `end` (seconds in the cut video) and its own parameters. Every time inside the parameters (`at`, `line2At` etc.) is also in seconds of the video, not relative to the effect.

### Theme, captions and sounds

Pick from the tone of the video and what the person asked for:

| theme | Fonts and colors | Fits |
|---|---|---|
| `default` | Anton + Figtree, orange and yellow, dark glass | tutorial, tech, quick tip |
| `neon` | Tilt Neon + Sora, glowing magenta and cyan | night, games, music, playful tone |
| `clean` | Archivo Black + Manrope, blue, light glass | business, education, serious content |
| `editorial` | Playfair italic + Manrope, red and cream | fashion, beauty, lifestyle, storytelling |
| `retro` | Bungee + Space Grotesk, orange and yellow, square corners | humor, nostalgia, fun lists |

Each theme comes with a caption style. To change only the captions, set `captionStyle`: `bold` (thick letters, yellow highlight), `neon` (glowing letters), `editorial` (italic serif with a highlighter), `marker` (marker pen) or `minimal` (small and clean).

Sound effects (pop, whoosh, ding, camera click, neon hum, keyboard) are added automatically at each effect's times, below the voice. Set `"sounds": false` if the person will add music and doesn't want them. The files live in `remotion/public/sounds/` and come from `scripts/generate_sounds.py` (run it again if they are missing).

### How to choose

- **Anchor every effect on a word.** `start` is the `s` time of the word that triggers it. `end` is the next effect's start minus 0.04 s. Inner times (checklist items, chart bars) also go on the `s` of the matching word.
- **Open with a hook** in the first 2–3 seconds: `orbit`, `neon` or `text-mask`.
- **Read what each sentence means** and use the table below. A sentence with no obvious effect stays with plain video and captions, and that is fine.
- **Don't repeat the same effect back to back** and don't go past about 6 seconds on one effect.
- **Don't make up facts.** Numbers, names and texts come from what the person said. When they didn't give it, use neutral text and say so in the plan.
- **Close with `cta`** when the person asks for an action ("comment", "follow", "save", "send it to someone"). The word they ask for goes on the line with `style: "accent"`.
- When the person says "like this one", "look at this", "this here", they are showing something: use a strong visual effect there (`freeze-ranking`, `likes`, `contact-sheet`).

### Catalog

| type | When to use | Parameters |
|---|---|---|
| `neon` | Opening, or naming the subject ("this is Claude"). A neon sign flickers on BEHIND the person's head, with a hum. Needs the cutout. Short text, 3 to 10 letters. | `text`, `font` (tube, script or retro), `color`, `y` (vertical center of the text in px of 1920, default 560) |
| `text-behind` | Impact word ("ZERO EDITOR", "FREE"). Giant letters behind the head, one word per line. Needs the cutout. | `text`, `style` (solid or outline), `color`, `y` |
| `orbit` | Opening hook and looping ending. Screens spinning in 3D around the person, passing behind them. Needs the cutout. | `images` (optional, see step 3) |
| `text-mask` | Short punchy sentence ("zero editor", "no code"). The video shows only inside giant letters that grow until they become the video. Up to ~6 letters per line. | `line1`, `line2`, `line2At` |
| `widgets` | The person presents what they made, or talks about routine and productivity. Eight iPhone-style glass widgets around them. | `at` (4 times), `number` {label, value, caption}, `chart` {label, value}, `counter` {value, button}, `profile` {name, caption}, `music` {label, title}, `progress`, `ring`, `badge` |
| `freeze-ranking` | "Like this one", "the best one is", rankings, top 3. Flash, the video freezes and becomes a photo with #1, #2 and #3. | `title`, `items` (3 texts) |
| `likes` | Going viral, engagement, audience reaction. Likes counting up, hearts and glass comments. | `count`, `suffix`, `comments` [{user, text}] |
| `contact-sheet` | Choosing, comparing versions, "and this one". Nine versions of the video, a pen circles the chosen one and it zooms in. | `text` |
| `split-claude` | The person explains how they use Claude or shows the command. Claude receiving the command on top, the person below. | `command`, `attachAt`, `typeAt`, `sendAt`, `doneAt`, `working`, `done` |
| `checklist` | The person lists steps or things done ("cut, add captions, add the effect"). Each item ticks when they say it. | `title`, `doneTitle`, `items` [{text, tag, at}], `doneAt`, `closing` |
| `chart` | Comparison with numbers ("it took 2 hours, now 10 minutes"). | `title`, `before` {label, value, at}, `after` {label, value, at, ratio} |
| `cta` | Closing call to action. | `lines` [{text, at, style: white, accent or yellow}] |

The effects already stay clear of the face and inside the Reels safe area. Captions hide during effects (except `split-claude`, where they move to the top half, and `neon` / `text-behind`) and come back on plain video.

Most effects have English default texts. **Always pass the visible texts** (`title`, `items`, `closing`, `badge`, `working`, `done`, `comments`…) in the language of the video.

### Show the plan and wait

Before rendering, show the plan to the person as a table: time, the spoken sentence, the effect and the texts that will appear, plus the theme and caption style. Point out any text you had to assume. **Wait for them to approve or ask for changes.** Don't render before that.

## 3. Cutout (only if the plan has `orbit`, `neon` or `text-behind`)

```bash
.venv/bin/python scripts/cutout.py
```

It cuts the person out of the background in those ranges. The first time it downloads a ~170 MB model, and each second of video takes a few seconds to process.

Optional, but much better: make the orbit screens show the video's other effects, like a preview. After the plan is approved, render thumbnails of frames in the middle of other effects (never frames of the orbit itself) and list them in `images`:

```bash
cd remotion && mkdir -p public/thumbnails
npx remotion still Director public/thumbnails/1.png --frame=FRAME --scale=0.3
```

`FRAME` is seconds × 30. Make 6 to 8 thumbnails and set `"images": ["thumbnails/1.png", ...]` on each `orbit`.

## 4. Check before rendering it all

Render a few single frames, one in the middle of each effect, and look at the images:

```bash
cd remotion && npx remotion still Director ../work/check.png --frame=FRAME
```

Look for text covering the face, text cut off at the edge, and effects landing on the wrong word. Fix `plan.json` and check again.

## 5. Render

```bash
mkdir -p output && cd remotion && npx remotion render Director ../output/video.mp4 --codec=h264 --crf=18
```

It needs internet (fonts come from Google Fonts). Give the person the path to `output/video.mp4` and ask what to adjust. Text, timing or effect changes only touch `plan.json`, no need to prepare again. Changing the color or the cuts means running `prepare.py` (and the cutout) again.

## Privacy

The person's video, transcript and plan stay on their computer only: `input/`, `output/`, `work/`, `remotion/public/base.mp4`, `remotion/public/cutout/`, `remotion/public/thumbnails/` and the files in `remotion/src/data/` (except the example) are in `.gitignore`. Never commit them.
