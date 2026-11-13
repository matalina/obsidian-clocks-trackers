# Clocks & Tracks

Clickable progress clocks and tick tracks in Obsidian, written as inline code. Works in Reading view and Live Preview. Every click writes the new value back into the note.

## Syntax

| Inline code | Renders as |
| --- | --- |
| `` `boxes:1/5` `` | 5 square boxes, 1 filled |
| `` `circles:1/5` `` | 5 round boxes, 1 filled |
| `` `clocks:2/6` `` or `` `clock:2/6` `` | a 6-segment clock, 2 segments filled |

- **Tracks** (`boxes`, `circles`): 1–200 boxes. Click a box to fill up to it; click the last filled box again to clear it.
- **Clocks**: 1–16 segments. Click to advance; Shift-click to go back.
- Spaces around `:` and `/` are allowed (`` `boxes: 1 / 5` ``).

Put the cursor inside the code in Live Preview to edit the raw text.

See [examples/clocks-and-tracks.md](examples/clocks-and-tracks.md).

## Development

```bash
npm install
npm run dev     # watch build
npm run build   # typecheck + production build
npm run lint
```

Copy `main.js`, `manifest.json` and `styles.css` into `<vault>/.obsidian/plugins/clocks-and-tracks/`.

Extracted from the [Tag and Tally](https://github.com/matalina/tag-and-tally-prime) plugin.
