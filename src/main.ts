import { MarkdownPostProcessorContext, Plugin, TFile } from "obsidian";
import { TrackWidget, TRACK_REGEX } from "./track";
import { ClockWidget, CLOCK_REGEX } from "./clock";
import { TallyWidget, TALLY_REGEX } from "./tally";
import { clocksTrackersExtension } from "./live";

export default class ClocksTrackersPlugin extends Plugin {
	async onload() {
		// Reading view
		this.registerMarkdownPostProcessor(this.processTrackAndClock);
		// Live Preview
		this.registerEditorExtension(clocksTrackersExtension());
	}

	processTrackAndClock = (el: HTMLElement, ctx: MarkdownPostProcessorContext): void => {
		const nodeList: HTMLElement[] = [];
		if (el.tagName === "CODE") nodeList.push(el);
		el.querySelectorAll("code").forEach((code) => {
			if (!nodeList.includes(code)) nodeList.push(code);
		});
		if (!nodeList.length) return;

		const file = this.app.vault.getAbstractFileByPath(ctx.sourcePath);
		if (!(file instanceof TFile)) return;

		// Section info scopes the write-back to this block; fall back to the whole file.
		const section = ctx.getSectionInfo(el);
		const lineStart = section?.lineStart ?? 0;
		const lineEnd = section?.lineEnd ?? 9999;
		const indexMap = { track: 0, clock: 0, tally: 0 };

		for (const node of nodeList) {
			const innerText = node.innerText.trim();
			if (!innerText) continue;
			const mdText = `\`${innerText}\``;

			// `boxes:1/5` or `circles:1/5`
			if (TRACK_REGEX.test(mdText)) {
				const widget = new TrackWidget({
					app: this.app,
					file,
					lineStart,
					lineEnd,
					index: indexMap.track++,
					originalText: mdText,
				});
				node.replaceWith(widget.toDOM());
			}

			// `clocks:1/5` or `clock:1/5`
			if (CLOCK_REGEX.test(mdText)) {
				const widget = new ClockWidget({
					app: this.app,
					file,
					lineStart,
					lineEnd,
					index: indexMap.clock++,
					originalText: mdText,
				});
				node.replaceWith(widget.toDOM());
			}

			// `tally:7/20`
			if (TALLY_REGEX.test(mdText)) {
				const widget = new TallyWidget({
					app: this.app,
					file,
					lineStart,
					lineEnd,
					index: indexMap.tally++,
					originalText: mdText,
				});
				node.replaceWith(widget.toDOM());
			}
		}
	};
}
