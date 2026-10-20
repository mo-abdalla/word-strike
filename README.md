# Word Strike ⌨️

A neon arcade typing game. Words fall toward your ship as enemies — type a word to lock on and fire. Clear a wave, pick one of three upgrades, and see how many waves you can survive. Every fifth wave brings a boss that fires missiles.

Plain HTML, CSS and JavaScript modules. No build step, no dependencies, no asset files: graphics, sound and music are all generated in code.

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

## How to play

- Type the first letter of any enemy's word to lock on to it, then finish the word to destroy it.
- An enemy that reaches your ship costs hit points. The ring around the ship shows what you have left.
- After each wave, pick one of three upgrades (`1` `2` `3`, or tap a card).
- Every 5th wave is a boss: type its words to wear down its health, and shoot its one-letter missiles before they hit.
- Combo grows with words typed in a row: ×2 after 2, ×4 after 4, ×8 after 8. Any miss resets it.

**Keys:**

| Screen | Key | Action |
|--------|-----|--------|
| Menu | `Enter` | Start a run |
| Playing | `Esc` | Pause |
| Playing | `Backspace` | Release the lock |
| Playing | `Enter` | Fire Nova (when you have it) |
| Paused | `Esc` / `Enter` | Resume |
| Paused / Game over | `R` | Back to menu |
| Game over | `Enter` | New run |

On a phone, tapping Start opens the keyboard. A pause button sits in the top corner.

## Features

- Endless waves with a rising difficulty curve, four enemy types and boss waves
- 12 upgrades in three rarities (common, rare, epic)
- English and Arabic word sets, with a fully mirrored interface in Arabic
- Four colour themes, eight achievements, a local leaderboard and a shareable result card
- Generated sound effects and a layered music loop, with separate volume controls

## License

[MIT](LICENSE) © 2026 Mo
