# Hyperframes Composition Brief: ConfigShell

## Objective
Create a short launch-style brag video for ConfigShell.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 20.5 seconds

## Source Material
- Project root: `/home/devx/Development/ConfigShell`
- Primary files read: `apps/web/index.html`, `apps/web/src/index.css`,
  `apps/web/src/components/layout/{SiteHeader,PageIntro}.tsx`,
  `apps/web/src/components/plan/{PlanView,CommandBlock}.tsx`,
  `packages/catalog` (live counts via `tsx`), live `POST /api/plan` response
- Product name: **ConfigShell**
- Tagline / strongest claim: "Discover Linux software. Nothing installs without your say."
- Key UI moment to recreate: the **command block** — bordered card, full mono command,
  amber "Runs as root" badge on privileged steps
- Copy that must appear verbatim:
  - `sudo dnf install git nodejs`
  - `sudo snap install code docker`
  - `command -v git`
  - `command -v docker`
  - `Runs as root`
  - `"executed": false`
  - `Install the Linux apps you actually need.` (source of the hook's register)

All four commands are the literal strings returned by the running API for
`{distro: "Fedora", applicationIds: ["git","vscode","docker","nodejs"]}`. Do not edit them.

No secrets, tokens, hostnames, or personal data appear anywhere in this material.

## Creative Direction
- Tone preset: `deadpan`
- Creative direction: a product film for software whose headline feature is refusing to act
- Interpretation: long holds, one idea per screen, flat delivery, generous empty space.
  The restraint is the product's actual personality, not a bit. No exclamation marks,
  no crescendo, no celebratory outro.
- Angle: ConfigShell does all the hard work — 160 verified applications, 5 distributions,
  4 package managers, a resolver that distinguishes a distro repo from a vendor repo — and
  then stops one step short, deliberately. The climax is the software declining to act.
- Hook: a real command types itself out and then simply does not run.
- Outro / punchline: `"executed": false`, then "Installing is your own act, in your own terminal."
- Avoid:
  - Generic SaaS language
  - Abstract filler visuals
  - Any implication that ConfigShell installs, runs, or executes anything
  - Celebratory stingers or risers

## Visual Identity (exact values from `apps/web/src/index.css`)
| Role | Value |
|---|---|
| Background | `#0f1115` (app dark theme, dark-first by default) |
| Card surface | `#15181d` |
| Border | `#272b33` |
| Text | `oklch(0.985 0 0)` |
| Muted text | `oklch(0.708 0 0)` |
| Brand / installable | `oklch(0.68 0.11 152)` (green) |
| Privileged / root | `oklch(0.78 0.12 75)` (amber — deliberately NOT the error red) |
| Font | Geist (app uses Geist Variable), mono for command text |

## Scene Timing (total 20.5s)
| # | Scene | Start | Dur |
|---|---|---|---|
| 1 | The command that does not run | 0.0 | 6.0 |
| 2 | What it actually knows | 6.0 | 4.0 |
| 3 | The plan | 10.0 | 6.0 |
| 4 | executed: false | 16.0 | 4.5 |

## Readability Floor (non-negotiable)
Music is 114.84 BPM — a 0.52s beat. That is **too fast for sequential text**. The four
command cards snap to **every other beat** (~1.05s apart). Every readable line holds:
short labels ≥0.8s settled, sentences ≥0.3s/word.

## Audio
- Music: `audio/music.mp3` (Happy Beats / Business Moves vol. 11, 87.6s, 114.84 BPM),
  from 0.0s, low (~0.18 gain), fading out over the final 2s. No build, no swell.
- First keystroke lands on the **1.60s strong cue**.
- SFX, sparse: `audio/key1.wav` + `audio/key2.wav` under the typing;
  `audio/click.ogg` once per command-card arrival; `audio/impact.ogg`, single dry hit,
  on the `"executed": false` line. Nothing after it.
- Audio-reactive treatment: none. Deadpan means nothing pulses to music.
