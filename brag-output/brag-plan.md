# Brag Plan: ConfigShell

## What is this app?
ConfigShell turns "I just reinstalled Linux" into an exact, ordered list of package-manager
commands — and then refuses to run a single one of them.

## The angle
Every other install tool ends with `curl … | sh`. ConfigShell does all the hard work —
160 verified applications, 5 distributions, 4 package managers, a resolver that knows
Flathub from a vendor repo — and then stops one step short, on purpose. The video plays
that completely straight. It is a product demo where the climax is the software declining
to do anything. The punchline is a field in the API response: `"executed": false`.

## Hook (first 2-3 seconds)
A command types itself out in mono on near-black: `sudo dnf install git nodejs`.
The cursor blinks. Nothing happens. Nothing continues to happen.
Then, small and flat: **ConfigShell wrote this command.**

## Key moments (the middle)
- The distro row with Fedora selected, and the quiet scale behind it: 160 verified
  applications, 5 distributions, 4 package managers.
- The real plan arriving: four actual commands, one at a time, two of them carrying an
  amber **Runs as root** badge. These are the literal strings the API returned.
- The command text never truncates, never gets edited, never gets executed.

## Outro / punchline
The whole interface drops away and leaves one line of the real API response —
`"executed": false` — then the line the product actually ships:
**Installing is your own act, in your own terminal.**

## User flow worth showing
Entry → key action → result, taken from the working app, not the landing page:
1. Pick a distribution (Fedora, from the real 5-card selector).
2. Select applications from the catalog.
3. Receive the ordered plan: real commands, privileged steps flagged, nothing run.

## Tone
- Preset: `deadpan`
- Creative direction: a product film for software whose headline feature is refusing to act
- Interpretation: long holds, big empty space, one idea per screen, flat delivery. The
  restraint *is* the product's personality — "Nothing installs without your say" is already
  deadpan, so the video simply agrees with it. No winking, no exclamation marks.

## Format: landscape — 1920x1080
## Duration: 19.0 seconds

## Visual identity (from the project)
- Background: `#0f1115` (the app's dark theme; dark-first by default)
- Surface / card: `#15181d`, border `#272b33`
- Accent (brand + installable): `oklch(0.68 0.11 152)` — green
- Privileged / root warning: `oklch(0.78 0.12 75)` — amber (deliberately *not* the error red)
- Muted text: `oklch(0.708 0 0)`
- Text: `oklch(0.985 0 0)`
- Display + body font: **Geist Variable** (mono passages use the app's `font-mono` stack)
- Strongest visual element: the command block — a bordered card, mono command in full, a
  copy button, and an amber "Runs as root" badge on the privileged ones.

## Share copy (draft)
ConfigShell figures out exactly what to install on your distro — 160 verified apps, 5
distributions — and then refuses to run any of it. `"executed": false` is a feature.

## Audio direction
- Role: sparse professional accents over a low bed
- Music: `happy-beats-business-moves-vol-11-by-ende-dot-app.mp3` (87.6s, 114.84 BPM)
- Music treatment: start at 0.0s, sit low (roughly -18 dB under the accents), no build,
  fade out under the final card so the last line lands nearly dry.
- Music cue guidance: preset read from `cues/…vol-11….music-cues.md`. Strong cue at
  **1.60s** — land the hook's first keystroke there. Beat grid is ~0.52s, which is **too
  fast for sequential text**: the four command reveals snap to **every other beat**
  (~1.05s apart) so each clears the readability floor.
- Audio-reactive treatment: none. Deadpan means nothing on screen should pulse to music.
- SFX posture: sparse. Keyboard ticks under the typed hook, one soft UI click per command
  arrival, one dry low hit on the final card. Nothing celebratory.
- Audio-coupled moments: the typed hook (key ticks), the four command reveals (click per
  arrival, every other beat), the `"executed": false` card (single dry hit, then silence).
- Restraint rule: no risers, no whooshes, no stingers on the punchline. The joke dies if
  the audio tells you it is a joke. The last 1.5s should be close to silent.

## Storyboard

### Scene 1 — The command that does not run — 4.5s
Near-black `#0f1115`. Centred mono line types out character by character:
`sudo dnf install git nodejs`. A block cursor blinks after it. Hold the blink — the beat
where a terminal would execute and doesn't. Then two flat lines fade in beneath, one at a
time: **ConfigShell wrote this command.** … **It will not run it.**
Sequential/interaction: yes — the command types out character by character; the two lines
below arrive one at a time with a full hold each.
Audio intent: dry, procedural, then an uncomfortable amount of nothing.
Audio-coupled idea: subtle key ticks under the typing; silence on the blink.
Music: low bed in from 0.0s; first keystroke on the 1.60s strong cue.
Transition mood: slow crossfade → Scene 2

### Scene 2 — What it actually knows — 4.0s
Cut to the distribution selector recreated from the app: five cards in a row, Fedora
carrying the green check. Beneath, one flat line holds:
**160 verified applications · 5 distributions · 4 package managers**
Sequential/interaction: yes — the Fedora card's check mark lands last, after the row settles.
Audio intent: competence, stated without enthusiasm.
Audio-coupled idea: one soft click as the Fedora check appears.
Music: unchanged low bed.
Transition mood: slow crossfade → Scene 3

### Scene 3 — The plan — 6.0s
The plan view. Four command cards arrive one by one, ~1.05s apart (every other beat), each
holding once placed. Real strings, unedited:
- `sudo dnf install git nodejs` — amber **Runs as root**
- `sudo snap install code docker` — amber **Runs as root**
- `command -v git`
- `command -v docker`
Sequential/interaction: yes — four cards, one per every-other-beat, each held after arrival;
the amber badge lands with its card.
Audio intent: methodical. Four small confirmations, no crescendo.
Audio-coupled idea: one soft UI click per card arrival.
Music: unchanged; do not swell.
Transition mood: hard cut → Scene 4

### Scene 4 — executed: false — 4.5s
Everything clears to near-black. One mono line, centred, the real API field:
`"executed": false`
Hold it in silence. Then, beneath, in Geist: **Installing is your own act, in your own
terminal.** Then the ConfigShell wordmark, small, bottom-centre.
Sequential/interaction: yes — JSON line, hold, then the sentence, then the wordmark.
Audio intent: one dry low hit on the JSON line, then let the bed fall away to near silence.
Audio-coupled idea: single dry hit; no outro stinger.
Music: fade out across the last 2s.
Transition mood: end.

**Music mood for this video:** deadpan — low, unobtrusive, fading out rather than resolving.
**Audio summary:** A quiet bed and four small clicks carry a product doing everything right
and then, deliberately, nothing at all — ending almost silent on `"executed": false`.
