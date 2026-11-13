# Clocks & Trackers

Clickable progress clocks, tick trackers and tallies in Obsidian, written as inline code. Works in Reading view and Live Preview. Every click writes the new value back into the note.

## Syntax

| Inline code | Renders as |
| --- | --- |
| `` `boxes:1/5` `` | 5 square boxes, 1 filled |
| `` `circles:1/5` `` | 5 round boxes, 1 filled |
| `` `clocks:2/6` `` or `` `clock:2/6` `` | a 6-segment clock, 2 segments filled |
| `` `tally:7/20` `` | 20 tally marks in groups of five: 7 counted in the accent colour, 13 faded |

- **Trackers** (`boxes`, `circles`): 1–200 boxes. Click a box to fill up to it; click the last filled box again to clear it.
- **Clocks**: 1–16 segments. Click to advance; Shift-click to go back.
- **Tallies**: max 1–200, drawn with Lucide `tally-1`–`tally-5` icons in groups of five — counted marks in the accent colour, the rest up to the max faded. Click to add one; Shift-click to remove one; clicking at the max shows a warning.
- Spaces around `:` and `/` are allowed (`` `boxes: 1 / 5` ``).

Put the cursor inside the code in Live Preview to edit the raw text.

See [examples/clocks-and-trackers.md](examples/clocks-and-trackers.md).

## Development

```bash
npm install
npm run dev     # watch build
npm run build   # typecheck + production build
npm run lint
```

Copy `main.js`, `manifest.json` and `styles.css` into `<vault>/.obsidian/plugins/clocks-and-trackers/`.

Extracted from the [Tag and Tally](https://github.com/matalina/tag-and-tally-prime) plugin.
