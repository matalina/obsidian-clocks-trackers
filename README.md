# Clocks and Trackers

Clickable progress clocks, tick trackers and tallies for Obsidian, written as inline code:

- **Boxes and circles**: a row of tick boxes, such as stress, harm or a countdown
- **Clocks**: segmented progress clocks, for things that fill up over time
- **Tallies**: tally marks in groups of five, for counts with a cap

```markdown
Strain `boxes:2/5`
Hope `circles:1/3`
Alarm raised `clocks:2/6`
Goblins slain `tally:7/20`
```

Every widget works in Reading view and Live Preview, and every click writes the new value back into the note. The note stays plain text, so it reads fine without the plugin.

## Installation

The plugin isn't in the community plugin list yet. To install it by hand:

1. Download `main.js`, `manifest.json` and `styles.css` from the [latest release](https://github.com/matalina/obsidian-clocks-trackers/releases).
2. Put them in `<vault>/.obsidian/plugins/clocks-and-trackers/`.
3. Turn on **Clocks and Trackers** in **Settings → Community plugins**.

## Syntax

| Inline code | Renders as |
| --- | --- |
| `` `boxes:1/5` `` | 5 square boxes, 1 filled |
| `` `circles:1/5` `` | 5 round boxes, 1 filled |
| `` `clocks:2/6` `` or `` `clock:2/6` `` | a 6-segment clock, 2 segments filled |
| `` `tally:7/20` `` | 20 tally marks in groups of five: 7 counted in the accent colour, 13 faded |

The format is always `value/max`. Spaces around `:` and `/` are allowed (`` `boxes: 1 / 5` ``). In Live Preview, put the cursor inside the code to edit the raw text.

### Boxes and circles

- 1–200 boxes.
- Clicking a box fills every box up to and including it.
- Clicking the last filled box again clears it.

### Clocks

- 1–16 segments. A 1-segment clock is a single circle that is either empty or full.
- Click to fill one more segment; Shift-click to empty one.

### Tallies

- Max of 1–200. Every mark up to the max is drawn, in groups of five, using Lucide's `tally-1` to `tally-5` icons.
- Counted marks use the accent colour; the rest up to the max are faded.
- Click to add a mark; Shift-click to remove one.
- Clicking when the tally is already full shows a warning and doesn't count.
- Hover a tally to see `Tally: 7 / 20`.

The [`examples/`](examples) folder has a note with every widget. Copy it into your vault to try them.

## Lineage

Boxes, circles and clocks were first built inside the [Tag and Tally](https://github.com/matalina/tag-and-tally-prime) plugin and were moved out into this standalone plugin. Tallies are new here.

## License

[MIT](LICENSE) © 2026 Alicia Wilkerson

## Changelog

Each [release](https://github.com/matalina/obsidian-clocks-trackers/releases) lists its changes. The notes are generated from the pull requests and commits merged since the previous release.

## Development

Requires Node 20+.

```bash
npm install
cp .env.example .env    # then set DROPBOX_DIR / VAULT_SUBPATH to your vault
npm run dev             # rebuild on change
npm run build           # typecheck, then production build
npm run test:vault      # build, then copy the plugin and example into the vault
npm run lint
```

`npm run test:vault` copies the build to `<DROPBOX_DIR>/<VAULT_SUBPATH>/.obsidian/plugins/clocks-and-trackers/` and the example to `Clocks and Trackers Example.md`. Reload the plugin in Obsidian to pick it up.

Source layout:

```
src/
  main.ts            registers the Reading view post-processor and the Live Preview extension
  track.ts           boxes and circles (Reading view)
  clock.ts           clocks (Reading view)
  tally.ts           tallies (Reading view), plus the shared drawing and parsing code
  live/              the Live Preview widgets and the CodeMirror view plugin
scripts/
  copy-to-vault.mjs  npm run test:vault
```

### Releasing

```bash
npm version patch          # bumps manifest.json + versions.json and tags (no "v" prefix)
git push --follow-tags
```

Pushing the tag builds the plugin and creates a draft GitHub release. The draft has the plugin files attached and generated release notes. Review the notes, then publish the release from the Releases page.
