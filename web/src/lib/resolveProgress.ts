import type { ResolveStep } from "../types";

export interface SymbolRow {
	id: string;
	name: string;
	line: number;
	depth: number;
	defined: boolean;
	closed: boolean;
}

export interface ScopeFrame {
	frameId: number;
	depth: number;
	closed: boolean;
	symbols: SymbolRow[];
}

export interface ResolveLogEntry {
	index: number;
	name: string;
	depth: number;
	targetSymbolId: string | null;
}

export interface ResolveProgress {
	frames: ScopeFrame[];
	log: ResolveLogEntry[];
	currentStepIndex: number;
	currentTargetSymbolId: string | null;
}

interface ReplayState {
	frames: ScopeFrame[];
	openFrameIds: number[];
	log: ResolveLogEntry[];
	nextFrameId: number;
	currentTargetSymbolId: string | null;
}

function frameById(state: ReplayState, id: number): ScopeFrame | null {
	return state.frames.find((f) => f.frameId === id) ?? null;
}

function findSymbol(frame: ScopeFrame, name: string): SymbolRow | null {
	for (let i = frame.symbols.length - 1; i >= 0; i--) {
		if (frame.symbols[i].name === name) return frame.symbols[i];
	}
	return null;
}

function applyScopeBegin(state: ReplayState) {
	const frameId = state.nextFrameId++;
	state.frames.push({ frameId, depth: state.openFrameIds.length + 1, closed: false, symbols: [] });
	state.openFrameIds.push(frameId);
}

function applyScopeEnd(state: ReplayState) {
	const frameId = state.openFrameIds.pop();
	if (frameId === undefined) return;
	const frame = frameById(state, frameId);
	if (frame) frame.closed = true;
}

function applyDeclare(state: ReplayState, step: Extract<ResolveStep, { kind: "declare" }>, isCurrent: boolean) {
	const frameId = state.openFrameIds.at(-1);
	if (frameId === undefined) return;
	const frame = frameById(state, frameId);
	if (!frame) return;
	frame.symbols.push({
		id: `${frameId}:${frame.symbols.length}:${step.name}`,
		name: step.name,
		line: step.line,
		depth: frame.depth,
		defined: false,
		closed: false,
	});
	if (isCurrent) state.currentTargetSymbolId = frame.symbols.at(-1)?.id ?? null;
}

function applyDefine(state: ReplayState, step: Extract<ResolveStep, { kind: "define" }>, isCurrent: boolean) {
	const frameId = state.openFrameIds.at(-1);
	if (frameId === undefined) return;
	const frame = frameById(state, frameId);
	const symbol = frame ? findSymbol(frame, step.name) : null;
	if (!symbol) return;
	symbol.defined = true;
	if (isCurrent) state.currentTargetSymbolId = symbol.id;
}

function applyResolve(state: ReplayState, i: number, step: Extract<ResolveStep, { kind: "resolve" }>, isCurrent: boolean) {
	const targetFrameId = state.openFrameIds.at(-1 - step.depth);
	const targetFrame = targetFrameId !== undefined ? frameById(state, targetFrameId) : null;
	const symbol = targetFrame ? findSymbol(targetFrame, step.name) : null;
	state.log.push({ index: i, name: step.name, depth: step.depth, targetSymbolId: symbol?.id ?? null });
	if (isCurrent) state.currentTargetSymbolId = symbol?.id ?? null;
}

export function computeResolveProgress(resolveSteps: ResolveStep[], index: number): ResolveProgress {
	const state: ReplayState = {
		frames: [],
		openFrameIds: [],
		log: [],
		nextFrameId: 0,
		currentTargetSymbolId: null,
	};

	for (let i = 0; i <= index && i < resolveSteps.length; i++) {
		const step = resolveSteps[i];
		const isCurrent = i === index;
		switch (step.kind) {
			case "scopeBegin":
				applyScopeBegin(state);
				break;
			case "scopeEnd":
				applyScopeEnd(state);
				break;
			case "declare":
				applyDeclare(state, step, isCurrent);
				break;
			case "define":
				applyDefine(state, step, isCurrent);
				break;
			case "resolve":
				applyResolve(state, i, step, isCurrent);
				break;
			default:
				break;
		}
	}

	return {
		frames: state.frames,
		log: state.log,
		currentStepIndex: index,
		currentTargetSymbolId: state.currentTargetSymbolId,
	};
}
