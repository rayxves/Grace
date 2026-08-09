import { TopNav } from "./components/TopNav/TopNav";
import { RouteProvider } from "./hooks/RouteProvider";
import { useRoute } from "./hooks/useRoute";
import { Visualizer } from "./screens/Visualizer";
import { Reference } from "./screens/Reference";
import { About } from "./screens/About";
import styles from "./App.module.css";

function Screen() {
	const { route } = useRoute();
	if (route.screen === "reference") return <Reference />;
	if (route.screen === "about") return <About />;
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
