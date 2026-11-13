import { SyntaxNode } from "@lezer/common";
import { EditorView, WidgetType } from "@codemirror/view";
import { parseTally, renderTallyMarks, stepTally, tallyText } from "../tally";

/** Live Preview tally. Clicks only dispatch — see TrackWidget.setValue for why. */
export class TallyWidget extends WidgetType {
    value: number;
    max: number;
    node: SyntaxNode;

    constructor(opts: { originalNode: SyntaxNode; originalText: string }) {
        super();
        this.node = opts.originalNode;
        const { value, max } = parseTally(opts.originalText);
        this.value = value;
        this.max = max;
    }

    eq(other: TallyWidget): boolean {
        return this.value === other.value && this.max === other.max;
    }

    private updateDoc(view: EditorView, value: number) {
        // Replace the whole decorated range, backticks included — see
        // TrackWidget.updateDoc.
        view.dispatch({
            changes: [
                {
                    from: this.node.from - 1,
                    to: this.node.to + 1,
                    insert: `\`${tallyText(value, this.max)}\``,
                },
            ],
        });
    }

    toDOM(view: EditorView): HTMLElement {
        const el = activeDocument.createElement("span");
        el.classList.add("clocks-trackers-tally");

        const btnEl = el.createEl("button");
        btnEl.classList.add("clickable-icon", "clocks-trackers-tally-btn");
        renderTallyMarks(btnEl, this.value, this.max);

        btnEl.onclick = (event) => {
            event.preventDefault();
            event.stopPropagation();
            const next = stepTally({ value: this.value, max: this.max }, event.shiftKey ? -1 : 1);
            if (next === null || next === this.value) return;
            this.updateDoc(view, next);
        };

        return el;
    }
}
