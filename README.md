<p align="center">
  <img src="docs/readme/banner.svg" alt="Word Strike: a neon arcade typing game" width="100%">
</p>

<p align="center">
  <a href="#run-locally"><img src="docs/readme/badge-play.svg" alt="Play now" height="32"></a>
  <img src="docs/readme/badge-lang.svg" alt="English and Arabic" height="32">
  <img src="docs/readme/badge-platform.svg" alt="Desktop and phone" height="32">
  <img src="docs/readme/badge-deps.svg" alt="Zero dependencies" height="32">
  <img src="docs/readme/badge-build.svg" alt="No build step" height="32">
  <a href="LICENSE"><img src="docs/readme/badge-license.svg" alt="MIT license" height="32"></a>
</p>

<p align="center">
  Words fall toward your ship as enemies. <b>Type a word to lock on and fire.</b><br>
  Clear a wave, pick one of three upgrades, and see how many waves you can survive.<br>
  Every fifth wave brings a boss that fires missiles.
</p>

---

## <img src="docs/readme/icons/ship.svg" width="32" align="center" alt=""> How to play

- Type the first letter of any enemy's word to lock on to it, then finish the word to destroy it.
- An enemy that reaches your ship costs hit points. The ring around the ship shows what you have left.
- After each wave, pick one of three upgrades (`1` `2` `3`, or tap a card).
- Combo grows with words typed in a row: ×2 after 2, ×4 after 4, ×8 after 8. Any miss resets it.

On a phone, tapping Start opens the keyboard. A pause button sits in the top corner.

| Screen | Key | Action |
|--------|-----|--------|
| Menu | `Enter` | Start a run |
| Playing | `Esc` | Pause |
| Playing | `Backspace` | Release the lock |
| Playing | `Enter` | Fire Nova (when you have it) |
| Paused | `Esc` / `Enter` | Resume |
| Paused / Game over | `R` | Back to menu |
| Game over | `Enter` | New run |

## <img src="docs/readme/icons/drone.svg" width="32" align="center" alt=""> Enemies

| | Enemy | What it does |
|:-:|-------|--------------|
| <img src="docs/readme/icons/drone.svg" width="40" alt="Drone"> | **Drone** | Flies straight at your ship. The most common enemy. |
| <img src="docs/readme/icons/seeker.svg" width="40" alt="Seeker"> | **Seeker** | Curves toward your ship, leaving a light trail. |
| <img src="docs/readme/icons/splitter.svg" width="40" alt="Splitter"> | **Splitter** | Splits into two drones with short words when destroyed. |
| <img src="docs/readme/icons/armored.svg" width="40" alt="Armored"> | **Armored** | Slow, with long words. A hit costs two hit points. |

## <img src="docs/readme/icons/boss.svg" width="32" align="center" alt=""> Boss waves

Every 5th wave is a boss. Type its words to wear down its health bar, and shoot its one-letter missiles <img src="docs/readme/icons/missile.svg" width="22" align="center" alt="missile"> before they hit.

## Upgrades

Twelve upgrades in three rarities: <b>common</b>, <b>rare</b> and <b>epic</b>. Each cleared wave offers three.

<p align="center">
  <img src="docs/readme/upgrades.svg" alt="The 12 upgrades" width="100%">
</p>

## Features

- Endless waves with a rising difficulty curve, four enemy types and boss waves
- English and Arabic word sets, with a fully mirrored interface in Arabic
- Four colour themes, eight achievements, a local leaderboard and a shareable result card
- Generated sound effects and a layered music loop, with separate volume controls
- Plain HTML, CSS and JavaScript modules. No build step, no dependencies, no asset files: graphics, sound and music are all generated in code

## Play

Live on Vercel: deploys automatically from `master`. Works on desktop and on phones, in English and Arabic.

## Run locally

Any static file server works. With Python:

```bash
python3 -m http.server 3737
```

Then open `http://localhost:3737/`.

## Tests

Requires Node 18+ (no install step):

```bash
node --test 'tests/*.test.js'
```

## License

[MIT](LICENSE) © 2026 Mo
