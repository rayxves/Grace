import styles from "./ViewTabs.module.css";

interface Tab<T extends string> {
	id: T;
	label: string;
}

interface ViewTabsProps<T extends string> {
	tabs: Tab<T>[];
	activeId: T;
	onSelect: (id: T) => void;
}

export function ViewTabs<T extends string>({
	tabs,
	activeId,
	onSelect,
}: Readonly<ViewTabsProps<T>>) {
	return (
		<div className={styles.tabs} role="tablist">
			{tabs.map((tab) => (
				<button
					key={tab.id}
					type="button"
					role="tab"
					aria-selected={tab.id === activeId}
					className={
						tab.id === activeId
							? `${styles.tab} ${styles.tabActive}`
							: styles.tab
					}
					onClick={() => onSelect(tab.id)}
				>
					{tab.label}
				</button>
			))}
		</div>
	);
}
