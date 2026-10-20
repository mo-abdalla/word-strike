# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Word Strike** — a neon arcade typing game. Enemies carrying words fall toward the player's ship; typing a word locks on and fires. Waves have no ceiling, each cleared wave offers three upgrades, and every 5th wave is a boss. English and Arabic, desktop and phone.

Plain ES modules (`index.html` + `css/` + `js/`). No build step, no dependencies, no asset files: graphics, sound effects and music are generated in code.

The design spec is `docs/superpowers/specs/2026-10-19-arcade-redesign-design.md`. Each feature was built from a plan in `docs/superpowers/plans/` (plans 1–6). Read the spec before changing gameplay rules.

## Deployment

**Live (Vercel):** deployed from `master` of `github.com/mo-abdalla/word-strike` (private). Vercel auto-redeploys on every push to `master` and serves `index.html` at `/`. Pull requests get preview deployments.

## Running and testing

```
python3 -m http.server 3737      # then open http://localhost:3737/
node --test 'tests/*.test.js'    # all unit tests, no install
```

Both Python and Node (v22) are available. `.claude/launch.json` defines the `typing-game` server on port 3737 for `preview_start`. Test changes in the browser on port 3737 before calling them done.

## Architecture

### Files

```
index.html          canvases, label layer, HUD, screens, hidden phone input
css/base.css        theme variables, HUD, screens, panels, phone layout
js/main.js          wiring: phases, frame, rendering calls, screens, input
js/state.js         phase machine (the only place a phase changes)
js/loop.js          one always-running requestAnimationFrame, dt capped at 50 ms
js/input.js         desktop keydown + phone hidden field → handleKey(key)
js/mobile-input.js  field value change → keys (pure)
js/layout.js        screen size → compact / scale / particle cap (pure)
js/game.js          one run: spawning, movement, collisions, kills, upgrades' effects, boss waves
js/targeting.js     lock-on and strict letter matching
js/enemies.js       enemy types, movement, collision with the ship, splitting
js/waves.js         difficulty curve, tier weights, enemy type picks, boss waves (n % 5 === 0)
js/boss.js          boss hp, fire rate, missile letters
js/upgrades.js      upgrade pool (12), three-card draw, applying a pick
js/scoring.js       combo, points, accuracy, WPM
js/feel.js          particles, shake, hitstop, flashes (state only)
js/sound.js         audio settings and which sound each game event makes
js/audio.js         Web Audio: effects channel, music channel and scheduling
js/music.js         music loop as data: layers per wave, level per phase
js/i18n.js          UI strings (en / ar) and applyStrings()
js/words.js         word lists, 5 tiers per language
js/storage.js       localStorage wrapper (every access in try/catch)
js/render/          starfield, ship, enemies, fx, glow sprites, DOM labels, upgrade cards, colours
js/meta/            themes, achievements, leaderboard, share card
tests/              node:test unit tests for every logic module
```

### Module rules
- Logic modules (`game`, `targeting`, `enemies`, `waves`, `boss`, `upgrades`, `scoring`, `feel`, `sound`, `music`, `layout`, `mobile-input`) never touch `document` or a canvas, so they run under Node tests.
- `render/` modules read state and never change it.
- Game logic never imports `upgrades.js`: an upgrade only changes `run.hp` / `run.maxHp` or a counter in `run.mods`.
- `game.js` reports what happened through `run.events`; `main.js` drains them each frame for effects, sound and achievements.
- Relative imports always end in `.js`.

### Phases
One enum `phase` instead of booleans: `menu`, `playing`, `paused`, `upgradePick`, `gameover`. Allowed transitions live in `state.js`; an invalid one throws. The `onChange` callback in `main.js` shows and hides screens, sets the music level, and closes the phone keyboard outside `playing`.

### Frame loop
- A single `requestAnimationFrame` always runs. Background, particles and effects update in every phase.
- Game logic (`update(run, dt)`) runs only in `playing` and outside hitstop.
- All timings accumulate `dt`, never `Date.now()`, so pausing freezes everything with no special code. Music is the exception: it schedules on the audio clock.

### Rendering
- `canvas#bg`: starfield and nebula. `canvas#game`: enemies, ship, bullets, particles.
- Enemy words are DOM elements in `#labels`, so Arabic letters shape and join correctly.
- Glow is pre-rendered into cached sprites (`render/glow.js`); no `shadowBlur` inside the frame loop. The cache is cleared on theme change.
- `run.scale` (from `layout.js`) shrinks the ship, enemies, boss, hp ring and hit radius on phones.

### Z-index stack
`#mobile-input` (−1) → `#bg` (0) → `#game` (1) → `#labels` (2) → `#tap-hint` (6) → `#hud` (10) → `#wave-banner` (12) → screens (20) → panel (30) → achievement toast (40).

### Storage keys
`ws_hs` best score · `ws_best_wave` · `ws_ach` achievements · `ws_words_total` · `ws_theme` · `ws_leaderboard` local records · `ws_audio` `{music, sfx, muted}`.

### Language
- `lang` is `'en'` or `'ar'`, chosen on the menu. `applyStrings()` fills every `[data-i18n]` element and sets `dir="rtl"` for Arabic, which mirrors the HUD corners and card order.
- Every UI string goes in both `STRINGS.en` and `STRINGS.ar` (a test checks the key sets match). Never hardcode text in DOM code.
- Matching is strict: `أ` does not match `ا`.

### Phone
- `layoutFor()` marks the screen compact at width ≤ 520, or ≤ 800 on touch devices. Compact adds `body.compact`: score and wave only in the HUD, a pause button, vertical upgrade cards, no key hints, particle cap 200.
- Typing goes through the hidden `#mobile-input`. Characters come from the change in its value (`keysFromChange`), because phone keyboards compose a word and resend all of it. Deleting is Backspace. Enter and Escape still come through `keydown`.
- `#tap-hint` shows when the field loses focus during play; tapping it or the play area refocuses.

## Rules that are easy to break

- **Phone focus is synchronous.** `openKeyboard()` (→ `focusMobile()`) must run directly inside a tap or key handler. iOS refuses to open the keyboard from `setTimeout` or a later frame.
- **The hidden input stays inside the viewport** (`top:0; left:0`, 1×1, `opacity:0`) with `font-size: 16px`. Off-screen inputs don't get a keyboard on iOS; smaller fonts make iOS zoom.
- **Play-area height comes from `visualViewport.height`**, never `window.innerHeight`, so enemies stay above the phone keyboard.
- **Arabic labels keep `letter-spacing: 0`.** Any other value breaks letter joining.
- **Audio starts only after a user gesture.** Every sound goes through `audio.play()` / the music scheduler, which do nothing before `audio.unlock()`.
- **Colours come from the `--neon-*` / `--bg` / `--tile-bg` / `--text` / `--dim` variables.** Canvas code reads them through `readColors()`; never hardcode hex in JS drawing code.
- **No external libraries, fonts or files.** Everything stays in this repository.
