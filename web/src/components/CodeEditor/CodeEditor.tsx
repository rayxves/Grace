import { useEffect, useRef } from "react";
import {
	EditorView,
	keymap,
	lineNumbers,
	highlightActiveLine,
	highlightActiveLineGutter,
	drawSelection,
	dropCursor,
	rectangularSelection,
	Decoration,
	type DecorationSet,
} from "@codemirror/view";
import { EditorState, StateEffect, StateField } from "@codemirror/state";
import {
	defaultKeymap,
	history,
	historyKeymap,
	indentWithTab,
} from "@codemirror/commands";
import {
	autocompletion,
	closeBrackets,
	closeBracketsKeymap,
	completionKeymap,
	completeAnyWord,
} from "@codemirror/autocomplete";
import { bracketMatching, indentOnInput, indentUnit } from "@codemirror/language";
import { graceLanguage, graceCompletions } from "./graceLanguage";
import styles from "./CodeEditor.module.css";

interface CodeEditorProps {
	value: string;
	onChange: (value: string) => void;
	currentLine: number | null;
	errorLine: number | null;
	hoverLine: number | null;
}

interface LineHighlight {
	line: number;
	error: boolean;
}

const setHighlightedLine = StateEffect.define<LineHighlight | null>();

const highlightedLineField = StateField.define<DecorationSet>({
	create: () => Decoration.none,
	update(decorations, transaction) {
		decorations = decorations.map(transaction.changes);
		for (const effect of transaction.effects) {
			if (effect.is(setHighlightedLine)) {
				const highlight = effect.value;
				if (
					highlight === null ||
					highlight.line < 1 ||
					highlight.line > transaction.state.doc.lines
				) {
					decorations = Decoration.none;
				} else {
					const docLine = transaction.state.doc.line(highlight.line);
					const className = highlight.error ? "cm-errorLine" : "cm-execLine";
					decorations = Decoration.set([
						Decoration.line({ class: className }).range(docLine.from),
					]);
				}
			}
		}
		return decorations;
	},
	provide: (field) => EditorView.decorations.from(field),
});

const setHoverLine = StateEffect.define<number | null>();

const hoverLineField = StateField.define<DecorationSet>({
	create: () => Decoration.none,
	update(decorations, transaction) {
		decorations = decorations.map(transaction.changes);
		for (const effect of transaction.effects) {
			if (effect.is(setHoverLine)) {
				const line = effect.value;
				if (line === null || line < 1 || line > transaction.state.doc.lines) {
					decorations = Decoration.none;
				} else {
					const docLine = transaction.state.doc.line(line);
					decorations = Decoration.set([
						Decoration.line({ class: "cm-hoverLine" }).range(docLine.from),
					]);
				}
			}
		}
		return decorations;
	},
	provide: (field) => EditorView.decorations.from(field),
});

const editorTheme = EditorView.theme({
	"&": {
		backgroundColor: "var(--color-editor-bg)",
		color: "var(--syntax-variable)",
		fontSize: "0.875rem",
		height: "100%",
	},
	".cm-scroller": {
		fontFamily: "var(--font-mono)",
		lineHeight: "1.6",
	},
	".cm-content": {
		padding: "0.75rem 0",
		caretColor: "var(--color-editor-cursor)",
	},
	".cm-gutters": {
		backgroundColor: "var(--color-editor-gutter-bg)",
		color: "var(--color-editor-gutter-text)",
		border: "none",
	},
	".cm-activeLine": {
		backgroundColor: "var(--color-editor-active-line)",
	},
	".cm-activeLineGutter": {
		backgroundColor: "var(--color-editor-active-line)",
	},
	"&.cm-focused": {
		outline: "none",
	},
	".cm-cursor": {
		borderLeftColor: "var(--color-editor-cursor)",
	},
	"&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
		backgroundColor: "var(--color-editor-selection) !important",
	},
	".cm-selectionMatch": {
		backgroundColor: "var(--color-accent-soft)",
	},
	".cm-matchingBracket": {
		backgroundColor: "var(--color-accent-soft)",
		outline: "1px solid var(--color-accent-border)",
	},
	".cm-execLine": {
		backgroundColor: "var(--color-exec-line)",
		boxShadow: "inset 0.1875rem 0 0 var(--color-exec-line-border)",
	},
	".cm-errorLine": {
		backgroundColor: "var(--color-error-line)",
		boxShadow: "inset 0.1875rem 0 0 var(--color-error-line-border)",
	},
	".cm-hoverLine": {
		boxShadow: "inset 0.1875rem 0 0 var(--color-accent)",
	},
	".cm-tooltip": {
		backgroundColor: "var(--color-surface)",
		color: "var(--color-text)",
		border: "1px solid var(--color-border)",
		borderRadius: "var(--radius-sm)",
		boxShadow: "var(--shadow-raised)",
		overflow: "hidden",
	},
	".cm-tooltip.cm-tooltip-autocomplete > ul": {
		fontFamily: "var(--font-mono)",
		fontSize: "0.8125rem",
	},
	".cm-tooltip.cm-tooltip-autocomplete > ul > li": {
		padding: "0.25rem 0.5rem",
	},
	".cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected]": {
		backgroundColor: "var(--color-accent-soft)",
		color: "var(--color-heading)",
	},
	".cm-completionDetail": {
		color: "var(--color-text-muted)",
		fontStyle: "normal",
	},
	".cm-completionIcon": {
		color: "var(--color-text-muted)",
	},
	".cm-snippetField": {
		backgroundColor: "var(--color-accent-soft)",
	},
});

export function CodeEditor({
	value,
	onChange,
	currentLine,
	errorLine,
	hoverLine,
}: Readonly<CodeEditorProps>) {
	const containerRef = useRef<HTMLDivElement>(null);
	const viewRef = useRef<EditorView | null>(null);
	const initialValueRef = useRef(value);
	const onChangeRef = useRef(onChange);

	useEffect(() => {
		onChangeRef.current = onChange;
	}, [onChange]);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const state = EditorState.create({
			doc: initialValueRef.current,
			extensions: [
				lineNumbers(),
				highlightActiveLine(),
				highlightActiveLineGutter(),
				drawSelection(),
				dropCursor(),
				rectangularSelection(),
				history(),
				indentOnInput(),
				indentUnit.of("\t"),
				bracketMatching(),
				closeBrackets(),
				autocompletion({ override: [graceCompletions, completeAnyWord] }),
				keymap.of([
					...closeBracketsKeymap,
					...defaultKeymap,
					...historyKeymap,
					...completionKeymap,
					indentWithTab,
				]),
				...graceLanguage,
				highlightedLineField,
				hoverLineField,
				editorTheme,
				EditorView.updateListener.of((update) => {
					if (update.docChanged) {
						onChangeRef.current(update.state.doc.toString());
					}
				}),
			],
		});

		const view = new EditorView({ state, parent: container });
		viewRef.current = view;

		return () => {
			view.destroy();
			viewRef.current = null;
		};
	}, []);

	useEffect(() => {
		const view = viewRef.current;
		if (!view) return;
		const line = errorLine ?? currentLine;
		const highlight =
			line === null ? null : { line, error: errorLine !== null };
		const effects: StateEffect<unknown>[] = [setHighlightedLine.of(highlight)];
		if (line !== null && line >= 1 && line <= view.state.doc.lines) {
			effects.push(
				EditorView.scrollIntoView(view.state.doc.line(line).from, {
					y: "center",
				}),
			);
		}
		view.dispatch({ effects });
	}, [currentLine, errorLine]);

	useEffect(() => {
		const view = viewRef.current;
		if (!view) return;
		view.dispatch({ effects: [setHoverLine.of(hoverLine)] });
	}, [hoverLine]);

	return (
		<section className={styles.panel}>
			<h2 className={styles.title}>código-fonte</h2>
			<div ref={containerRef} className={styles.editorWrapper} />
		</section>
	);
}
