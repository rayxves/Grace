import { Code, Library, Moon, MonitorPlay, Sun } from "lucide-react";
import { useRoute } from "../../hooks/useRoute";
import type { Screen } from "../../hooks/routeContext";
import { useTheme } from "../../hooks/useTheme";
import styles from "./TopNav.module.css";

const ICON_SIZE = "1rem";

const DESTINATIONS: { screen: Screen; label: string; icon: typeof Library }[] = [
	{ screen: "visualizer", label: "Visualizador", icon: MonitorPlay },
	{ screen: "reference", label: "Referência", icon: Library },
];

export function TopNav() {
	const { route, navigate } = useRoute();
	const { theme, toggleTheme } = useTheme();

	return (
		<nav className={styles.nav} aria-label="navegação principal">
			<div className={styles.left}>
				<span className={styles.brand}>
					<MonitorPlay size={ICON_SIZE} />
					Grace
				</span>
			</div>

			<div className={styles.center}>
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

			<div className={styles.right}>
				<a
					className={styles.iconButton}
					href="https://github.com/rayxves/Grace"
					target="_blank"
					rel="noopener noreferrer"
					title="repositório no GitHub"
				>
					<Code size={ICON_SIZE} />
				</a>
				<button
					type="button"
					className={styles.iconButton}
					onClick={toggleTheme}
					title={theme === "light" ? "tema escuro" : "tema claro"}
				>
					{theme === "light" ? <Moon size={ICON_SIZE} /> : <Sun size={ICON_SIZE} />}
				</button>
			</div>
		</nav>
	);
}
