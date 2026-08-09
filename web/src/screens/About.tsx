import { ABOUT_HOMAGE, ABOUT_LEAD, ABOUT_SECTIONS, ABOUT_TCC } from "../content/about";
import styles from "./About.module.css";

export function About() {
	return (
		<div className={styles.screen}>
			<div className={styles.content}>
				<h1 className={styles.title}>Sobre</h1>
				<p className={styles.lead}>{ABOUT_LEAD}</p>

				{ABOUT_SECTIONS.map((section) => (
					<section key={section.id} className={styles.section}>
						<h2 className={styles.sectionTitle}>{section.title}</h2>
						{section.paragraphs.map((paragraph) => (
							<p key={paragraph}>{paragraph}</p>
						))}
					</section>
				))}

				<section className={styles.section}>
					<h2 className={styles.sectionTitle}>{ABOUT_TCC.title}</h2>
					{ABOUT_TCC.paragraphs.map((paragraph) => (
						<p key={paragraph}>{paragraph}</p>
					))}
					<p>
						<a
							className={styles.link}
							href={ABOUT_TCC.repoUrl}
							target="_blank"
							rel="noopener noreferrer"
						>
							{ABOUT_TCC.repoLabel}
						</a>
					</p>
				</section>

				<div className={styles.note}>
					<h2 className={styles.sectionTitle}>{ABOUT_HOMAGE.title}</h2>
					{ABOUT_HOMAGE.paragraphs.map((paragraph) => (
						<p key={paragraph}>{paragraph}</p>
					))}
				</div>
			</div>
		</div>
	);
}
