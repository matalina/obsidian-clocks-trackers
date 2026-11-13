import { SyntaxNode } from "@lezer/common";
import { EditorView, WidgetType } from "@codemirror/view";
import { TRACK_REGEX } from "../track";

export class TrackWidget extends WidgetType {
    shape: "boxes" | "circles";
    value: number;
    max: number;
    size: number;
    el: HTMLElement;
    btnEls: HTMLElement[];
    node: SyntaxNode;

    private readonly SIZE_DEFAULT = 22;
    private readonly MIN_VALUE = 0;
    private readonly MIN_MAX = 1;
    private readonly MAX_MAX = 200;

    constructor(opts: { originalNode: SyntaxNode; originalText: string }) {
        super();
        this.node = opts.originalNode;
        this.parseValue(opts.originalText);
        this.size = this.SIZE_DEFAULT;

        if (this.max < this.MIN_MAX) this.max = this.MIN_MAX;
        if (this.max > this.MAX_MAX) this.max = this.MAX_MAX;
        if (this.value <= this.MIN_VALUE) this.value = this.MIN_VALUE;
        if (this.value > this.max) this.value = this.max;
    }

    private parseValue(text: string) {
        this.value = 0;
        this.max = 0;

        const match = text.match(TRACK_REGEX);
        if (!match) {
            this.shape = "boxes";
            this.value = 0;
            this.max = 1;
            return;
        }

        this.shape = match[1] === "circles" ? "circles" : "boxes";
        this.value = parseInt(match[2]) || 0;
        this.max = parseInt(match[3]) || 0;
    }

    /**
     * Without this, CodeMirror's default eq() reports every rebuilt widget as
     * new and tears the DOM down and recreates it on every cursor move, scroll
     * and keystroke, so the boxes disappear as soon as the cursor moves
     * anywhere in the note. Comparing the rendered state lets CodeMirror keep
     * the existing DOM when nothing visible has changed.
     */
    eq(other: TrackWidget): boolean {
        return (
            this.shape === other.shape &&
            this.value === other.value &&
            this.max === other.max
        );
    }

    getText(value: number = this.value): string {
        return `${this.shape}:${value}/${this.max}`;
    }

    /**
     * Writes the new value to the document and nothing else.
     *
     * Deliberately does not mutate this.value or patch the buttons. That looks
     * like a harmless optimistic update, but eq() compares this.value: mutating
     * it here makes the rebuilt widget compare equal to this already-updated
     * one, so CodeMirror decides nothing changed and skips the redraw — while
     * it has already torn the old DOM down, because the edit lands inside the
     * very range this decoration replaces. The result is a replaced range with
     * nothing drawn in it.
     *
     * The document is the source of truth: dispatch and let the rebuild produce
     * a widget whose value genuinely differs, so eq() reports the change.
     */
    private setValue(clickedIndex: number, view: EditorView) {
        let next: number;
        if (this.value > clickedIndex + 1) {
            next = clickedIndex + 1;
        } else if (this.value === clickedIndex + 1) {
            next = clickedIndex;
        } else {
            next = clickedIndex + 1;
        }
        if (next <= this.MIN_VALUE) next = this.MIN_VALUE;
        if (next > this.max) next = this.max;
        this.updateDoc(view, next);
    }

    private updateButtons() {
        this.btnEls.forEach((btnEl, i) => {
            if (i < this.value) {
                btnEl.classList.add("active");
            } else {
                btnEl.classList.remove("active");
            }
        });
    }

    private updateDoc(view: EditorView, value: number) {
        // Replace the whole decorated range, backticks included, rather than
        // just the text between them. The decoration spans [from-1, to+1]; an
        // edit strictly inside it leaves CodeMirror holding a replace
        // decoration whose interior changed underneath it, and the widget is
        // never redrawn. Replacing the entire range instead retires the old
        // decoration cleanly so the rebuild draws a fresh one.
        view.dispatch({
            changes: [
                {
                    from: this.node.from - 1,
                    to: this.node.to + 1,
                    insert: `\`${this.getText(value)}\``,
                },
            ],
        });
    }

    toDOM(view: EditorView): HTMLElement {
        this.el = activeDocument.createElement("span");
        this.el.classList.add("clocks-trackers-track");

        this.btnEls = [];
        for (let i = 0; i < this.max; i++) {
            const btnEl = this.el.createEl("button");
            btnEl.style.width = `${this.size}px`;
            btnEl.style.height = `${this.size}px`;
            btnEl.classList.add(
                "clickable-icon",
                "clocks-trackers-track-btn",
                `clocks-trackers-track-${this.shape}`
            );
            btnEl.onclick = (event) => {
                event.preventDefault();
                event.stopPropagation();
                this.setValue(i, view);
            };
            this.btnEls.push(btnEl);
        }

        this.updateButtons();
        return this.el;
    }
}
