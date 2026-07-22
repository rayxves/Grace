import { useEffect } from "react";

interface KeyboardShortcutsOptions {
	enabled: boolean;
	onNext: () => void;
	onPrevious: () => void;
	onTogglePlay: () => void;
	onReset: () => void;
}

function isEditableTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false;
	if (
		target.tagName === "INPUT" ||
		target.tagName === "TEXTAREA" ||
		target.tagName === "SELECT"
	) {
		return true;
	}
	return target.isContentEditable;
}

export function useKeyboardShortcuts({
	enabled,
	onNext,
	onPrevious,
	onTogglePlay,
	onReset,
}: Readonly<KeyboardShortcutsOptions>) {
	useEffect(() => {
		if (!enabled) return;

		function handleKeyDown(event: KeyboardEvent) {
			if (isEditableTarget(event.target)) return;

			switch (event.key) {
				case "ArrowRight":
					event.preventDefault();
					onNext();
					break;
				case "ArrowLeft":
					event.preventDefault();
					onPrevious();
					break;
				case " ":
					event.preventDefault();
					onTogglePlay();
					break;
				case "Home":
					event.preventDefault();
					onReset();
					break;
				default:
					break;
			}
		}

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [enabled, onNext, onPrevious, onTogglePlay, onReset]);
}
