import { TopNav } from "./components/TopNav/TopNav";
import { RouteProvider, useRoute } from "./hooks/useRoute";
import { Visualizador } from "./screens/Visualizador";
import { Referencia } from "./screens/Referencia";
import styles from "./App.module.css";

function Screen() {
	const { route } = useRoute();
	if (route.screen === "referencia") return <Referencia />;
	return <Visualizador />;
}

function AppShell() {
	return (
		<div className={styles.shell}>
			<TopNav />
			<div className={styles.screenArea}>
				<Screen />
			</div>
		</div>
	);
}

function App() {
	return (
		<RouteProvider>
			<AppShell />
		</RouteProvider>
	);
}

export default App;
