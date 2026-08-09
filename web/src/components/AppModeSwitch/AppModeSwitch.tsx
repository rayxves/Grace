import { ViewTabs } from "../ViewTabs/ViewTabs";
import { APP_MODES } from "../../content/appModes";
import type { Mode as AppMode } from "../../screens/Visualizer";
import styles from "./AppModeSwitch.module.css";

interface AppModeSwitchProps {
	appMode: AppMode;
	onSelectAppMode: (mode: AppMode) => void;
}

export function AppModeSwitch({ appMode, onSelectAppMode }: Readonly<AppModeSwitchProps>) {
	const current = APP_MODES.find((mode) => mode.id === appMode) ?? APP_MODES[0];

	return (
		<div className={styles.wrapper} title={current.description}>
			<ViewTabs tabs={APP_MODES} activeId={appMode} onSelect={onSelectAppMode} />
			<span className={styles.caption}>{current.caption}</span>
		</div>
	);
}
