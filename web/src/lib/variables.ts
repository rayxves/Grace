import type { Variable } from "../types";

export function changedVariableNames(
	previous: Variable[],
	current: Variable[],
): Set<string> {
	const previousValues = new Map(previous.map((v) => [v.name, v.value]));
	const changed = new Set<string>();
	for (const variable of current) {
		if (previousValues.get(variable.name) !== variable.value) {
			changed.add(variable.name);
		}
	}
	return changed;
}
