import styles from "./Placeholder.module.css";

interface PlaceholderProps {
	title: string;
	description: string;
}

export function Placeholder({ title, description }: Readonly<PlaceholderProps>) {
	return (
		<div className={styles.screen}>
			<div className={styles.card}>
				<h1 className={styles.title}>{title}</h1>
				<p className={styles.description}>{description}</p>
			</div>
		</div>
	);
}
