import { TopNav } from "./components/TopNav/TopNav";
import { RouteProvider, useRoute } from "./hooks/useRoute";
import { Visualizador } from "./screens/Visualizador";
import { Aprender } from "./screens/Aprender";
import { Praticar } from "./screens/Praticar";
import { Referencia } from "./screens/Referencia";
import styles from "./App.module.css";

function Screen() {
	const { route } = useRoute();
	switch (route.screen) {
		case "aprender":
			return <Aprender />;
		case "praticar":
			return <Praticar />;
		case "referencia":
			return <Referencia />;
		default:
			return <Visualizador />;
	}
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
