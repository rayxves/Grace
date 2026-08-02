import { TopNav } from "./components/TopNav/TopNav";
import { RouteProvider, useRoute } from "./hooks/useRoute";
import { Visualizer } from "./screens/Visualizer";
import { Reference } from "./screens/Reference";
import styles from "./App.module.css";

function Screen() {
	const { route } = useRoute();
	if (route.screen === "reference") return <Reference />;
	return <Visualizer />;
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
