import { APP_MODES } from "../../content/appModes";
import type { Mode as AppMode } from "../../screens/Visualizer";
import { Tooltip } from "../Tooltip/Tooltip";
import styles from "./AppModeSwitch.module.css";

interface AppModeSwitchProps {
	appMode: AppMode;
	onSelectAppMode: (mode: AppMode) => void;
}

export function AppModeSwitch({ appMode, onSelectAppMode }: Readonly<AppModeSwitchProps>) {
	return (
		<div className={styles.tabs} role="tablist">
			{APP_MODES.map((mode) => (
				<Tooltip key={mode.id} content={mode.description}>
					<button
						type="button"
						role="tab"
						aria-selected={mode.id === appMode}
						className={mode.id === appMode ? `${styles.tab} ${styles.tabActive}` : styles.tab}
						onClick={() => onSelectAppMode(mode.id)}
					>
						{mode.label}
					</button>
				</Tooltip>
			))}
		</div>
	);
}
