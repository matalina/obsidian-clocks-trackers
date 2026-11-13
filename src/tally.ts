import { App, Notice, TFile, setIcon } from "obsidian";

export const TALLY_REGEX = /^`tally\s*:\s*(\d+)\s*\/\s*(\d+)`$/;
export const TALLY_REGEX_G = /`tally\s*:\s*(\d+)\s*\/\s*(\d+)`/g;

const MIN_VALUE = 0;
const MIN_MAX = 1;
// Every mark up to the max is drawn, so cap it like boxes/circles.
const MAX_MAX = 200;

export interface TallyState {
    value: number;
    max: number;
}

export function parseTally(text: string): TallyState {
    const match = text.match(TALLY_REGEX);
    let max = match ? parseInt(match[2]) || 0 : MIN_MAX;
    if (max < MIN_MAX) max = MIN_MAX;
    if (max > MAX_MAX) max = MAX_MAX;
    const value = match ? parseInt(match[1]) || 0 : MIN_VALUE;
    return { value: clampTally(value, max), max };
}

export function clampTally(value: number, max: number): number {
    if (value <= MIN_VALUE) return MIN_VALUE;
    if (value > max) return max;
    return value;
}

/**
 * The value after a click, or null when the click would push past the max —
 * the max is not drawn, so the user gets a Notice instead of a silent no-op.
 */
export function stepTally(state: TallyState, add: number): number | null {
    if (add > 0 && state.value >= state.max) {
        new Notice(`Tally is already at its max of ${state.max}.`);
        return null;
    }
    return clampTally(state.value + add, state.max);
}

export function tallyText(value: number, max: number): string {
    return `tally:${value}/${max}`;
}

/**
 * Fills `container` with Lucide tally marks for the whole max, in groups of
 * five: the counted marks ("on") in the accent colour, the rest up to the max
 * ("off") faded. A group split between the two draws the faded full group
 * with the counted marks stacked on top — Lucide's tally-1..5 share stroke
 * positions, so the counted strokes land exactly on the faded ones.
 */
export function renderTallyMarks(container: HTMLElement, value: number, max: number) {
    container.empty();
    container.setAttribute("aria-label", `Tally: ${value} / ${max}`);
    container.toggleClass("is-full", value >= max);

    for (let start = 0; start < max; start += 5) {
        const size = Math.min(5, max - start);
        const on = Math.max(0, Math.min(size, value - start));

        const group = container.createSpan({ cls: "clocks-trackers-tally-group" });
        if (on < size) addMark(group, size, "is-off");
        if (on > 0) addMark(group, on, "is-on");
    }
}

function addMark(group: HTMLElement, n: number, cls: string) {
    const mark = group.createSpan({ cls: `clocks-trackers-tally-mark ${cls}` });
    setIcon(mark, `tally-${n}`);
    // An Obsidian build whose bundled Lucide lacks the tally icons.
    if (!mark.firstChild) mark.setText(String(n));
}

interface TallyOptions {
    app: App;
    file: TFile;
    lineStart: number;
    lineEnd: number;
    index: number;
    originalText: string;
}

/** Reading-view tally. Writes back through the vault, like ClockWidget. */
export class TallyWidget {
    value: number;
    max: number;
    el: HTMLElement;
    btnEl: HTMLElement;
    app: App;
    file: TFile;
    lineStart: number;
    lineEnd: number;
    index: number;

    constructor(opts: TallyOptions) {
        this.app = opts.app;
        this.file = opts.file;
        this.lineStart = opts.lineStart;
        this.lineEnd = opts.lineEnd;
        this.index = opts.index;
        const { value, max } = parseTally(opts.originalText);
        this.value = value;
        this.max = max;
    }

    private addValue(add: number) {
        const next = stepTally({ value: this.value, max: this.max }, add);
        if (next === null || next === this.value) return;
        this.value = next;
        renderTallyMarks(this.btnEl, this.value, this.max);
        void this.updateDoc();
    }

    private async updateDoc() {
        try {
            const text = await this.app.vault.read(this.file);
            const lines = text.split("\n");
            const regex = new RegExp(TALLY_REGEX_G);
            let matchIndex = 0;

            lookup: {
                for (let i = this.lineStart; i <= this.lineEnd && i < lines.length; i++) {
                    for (
                        let match = regex.exec(lines[i]);
                        match !== null;
                        match = regex.exec(lines[i])
                    ) {
                        if (matchIndex < this.index) {
                            matchIndex++;
                        } else if (matchIndex === this.index) {
                            lines[i] =
                                lines[i].substring(0, match.index) +
                                `\`${tallyText(this.value, this.max)}\`` +
                                lines[i].substring(match.index + match[0].length);
                            break lookup;
                        }
                    }
                }
            }

            await this.app.vault.modify(this.file, lines.join("\n"));
        } catch (error) {
            console.error("Error updating tally widget:", error);
        }
    }

    toDOM(): HTMLElement {
        this.el = createSpan();
        this.el.classList.add("clocks-trackers-tally");

        this.btnEl = this.el.createEl("button");
        this.btnEl.classList.add("clickable-icon", "clocks-trackers-tally-btn");
        renderTallyMarks(this.btnEl, this.value, this.max);

        this.btnEl.onclick = (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.addValue(event.shiftKey ? -1 : 1);
        };

        return this.el;
    }
}
