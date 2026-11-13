import { SyntaxNode } from "@lezer/common";
import { EditorView, WidgetType } from "@codemirror/view";
import { CLOCK_REGEX } from "../clock";

export class ClockWidget extends WidgetType {
    value: number;
    max: number;
    size: number;
    el: HTMLElement;
    btnEl: HTMLElement;
    svgEl: SVGElement;
    node: SyntaxNode;

    private readonly SIZE_DEFAULT = 50;
    private readonly MIN_VALUE = 0;
    private readonly MIN_MAX = 1;
    private readonly MAX_MAX = 16;
    private readonly RAD = Math.PI / 180;

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
        this.value = this.MIN_VALUE;
        this.max = this.MIN_MAX;

        const match = text.match(CLOCK_REGEX);
        if (!match) {
            this.value = 0;
            this.max = 1;
            return;
        }

        this.value = parseInt(match[1]) || 0;
        this.max = parseInt(match[2]) || 0;
    }

    /** See TrackWidget.eq — without it CodeMirror recreates the DOM on every update. */
    eq(other: ClockWidget): boolean {
        return this.value === other.value && this.max === other.max;
    }

    getText(value: number = this.value): string {
        return `clocks:${value}/${this.max}`;
    }

    private clamp(value: number): number {
        if (value <= this.MIN_VALUE) return this.MIN_VALUE;
        if (value > this.max) return this.max;
        return value;
    }

    /** Writes to the document only — see TrackWidget.setValue for why. */
    private setValue(newValue: number, view: EditorView) {
        this.updateDoc(view, this.clamp(newValue));
    }

    /** Writes to the document only — see TrackWidget.setValue for why. */
    private addValue(add: number, view: EditorView) {
        this.updateDoc(view, this.clamp(this.value + add));
    }

    private calculatePath(
        centerX: number,
        centerY: number,
        size: number,
        index: number,
        step: number
    ): string {
        const angleA = -index * step + 90;
        const angleB = (-index - 1) * step + 90;
        const x = centerX;
        const y = centerY;
        const cr = size;
        const cx1 = Math.cos(angleB * this.RAD) * cr + x;
        const cy1 = -Math.sin(angleB * this.RAD) * cr + y;
        const cx2 = Math.cos(angleA * this.RAD) * cr + x;
        const cy2 = -Math.sin(angleA * this.RAD) * cr + y;

        return `M${x} ${y} ${cx1} ${cy1} A${cr} ${cr} 0 0 0 ${cx2} ${cy2}Z`;
    }

    private generateSvg() {
        if (!this.svgEl) return;

        this.svgEl.empty();

        const center = this.size / 2;
        const radius = center - 2;

        if (this.max <= 1) {
            const circleEl = this.svgEl.createSvg("circle");
            circleEl.setAttribute("cx", center.toString());
            circleEl.setAttribute("cy", center.toString());
            circleEl.setAttribute("r", radius.toString());
            circleEl.setAttribute("fill", this.value > 0 ? "currentColor" : "none");
            circleEl.setAttribute("stroke", "currentColor");
            circleEl.setAttribute("stroke-width", "1.25");
        } else {
            const step = 360 / this.max;
            for (let i = 0; i < this.max; i++) {
                const pathEl = this.svgEl.createSvg("path");
                pathEl.setAttribute(
                    "d",
                    this.calculatePath(center, center, radius, i, step)
                );
                pathEl.setAttribute("fill", this.value > i ? "currentColor" : "none");
                pathEl.setAttribute("stroke", "currentColor");
            }
            const circleEl = this.svgEl.createSvg("circle");
            circleEl.setAttribute("cx", center.toString());
            circleEl.setAttribute("cy", center.toString());
            circleEl.setAttribute("r", radius.toString());
            circleEl.setAttribute("fill", "none");
            circleEl.setAttribute("stroke", "currentColor");
            circleEl.setAttribute("stroke-width", "1.25");
        }
    }

    private updateDoc(view: EditorView, value: number) {
        // Replace the whole decorated range, backticks included — see
        // TrackWidget.updateDoc for why an interior-only edit strands the
        // decoration with nothing drawn in it.
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
        this.el = createSpan();
        this.el.classList.add("clocks-trackers-clock");

        this.btnEl = this.el.createEl("button");
        this.btnEl.classList.add("clickable-icon", "clocks-trackers-clock-btn");

        this.svgEl = this.btnEl.createSvg("svg");
        this.svgEl.setAttribute("width", this.size.toString());
        this.svgEl.setAttribute("height", this.size.toString());
        this.svgEl.classList.add("clocks-trackers-clock-svg");

        this.generateSvg();

        this.btnEl.onclick = (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!event.shiftKey) {
                this.addValue(1, view);
            } else {
                this.addValue(-1, view);
            }
        };

        return this.el;
    }
}
