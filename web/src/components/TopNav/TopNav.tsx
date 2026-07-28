import { BookOpen, Dumbbell, Library, MonitorPlay } from "lucide-react";
import { useRoute, type Screen } from "../../hooks/useRoute";
import styles from "./TopNav.module.css";

const ICON_SIZE = "1rem";

const DESTINATIONS: { screen: Screen; label: string; icon: typeof BookOpen }[] = [
	{ screen: "aprender", label: "Aprender", icon: BookOpen },
	{ screen: "praticar", label: "Praticar", icon: Dumbbell },
	{ screen: "referencia", label: "Referência", icon: Library },
];

export function TopNav() {
	const { route, navigate } = useRoute();

	return (
		<nav className={styles.nav} aria-label="navegação principal">
			<button
				type="button"
				className={styles.brand}
				onClick={() => navigate("visualizador")}
				aria-current={route.screen === "visualizador" ? "page" : undefined}
			>
				<MonitorPlay size={ICON_SIZE} />
				Grace
			</button>
			<div className={styles.destinations}>
				{DESTINATIONS.map(({ screen, label, icon: Icon }) => (
					<button
						key={screen}
						type="button"
						className={route.screen === screen ? `${styles.link} ${styles.linkActive}` : styles.link}
						onClick={() => navigate(screen)}
						aria-current={route.screen === screen ? "page" : undefined}
					>
						<Icon size={ICON_SIZE} />
						{label}
					</button>
				))}
			</div>
		</nav>
	);
}
