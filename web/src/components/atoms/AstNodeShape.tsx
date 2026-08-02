import type { CSSProperties, ReactNode } from "react";
import styles from "./AstNodeShape.module.css";

interface AstNodeShapeProps {
	label: string;
	kind: string;
	nodeId: number | null;
	accent?: string;
	accentFill?: string;
	hasError?: boolean;
	isActive?: boolean;
	isTrail?: boolean;
	isHovered?: boolean;
	isCollapsed?: boolean;
	isIncomplete?: boolean;
	onClick?: () => void;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
	badge?: ReactNode;
	tooltip?: string;
}

export function AstNodeShape({
	label,
	kind,
	nodeId,
	accent,
	accentFill,
	hasError = false,
	isActive = false,
	isTrail = false,
	isHovered = false,
	isCollapsed = false,
	isIncomplete = false,
	onClick,
	onMouseEnter,
	onMouseLeave,
	badge,
	tooltip,
}: Readonly<AstNodeShapeProps>) {
	const nodeClass = [
		styles.node,
		hasError ? styles.nodeError : "",
		isActive ? styles.nodeActive : "",
		isTrail ? styles.nodeTrail : "",
		isHovered ? styles.nodeHovered : "",
		isCollapsed ? styles.nodeCollapsed : "",
		isIncomplete ? styles.nodeIncomplete : "",
	].join(" ");

	return (
		<g
			onClick={onClick}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			className={nodeClass}
			data-node-id={nodeId ?? undefined}
			style={
				accent
					? ({ "--node-accent": accent, "--node-accent-fill": accentFill } as CSSProperties)
					: undefined
			}
		>
			{tooltip && <title>{tooltip}</title>}
			<circle r={40} className={styles.nodeShape} />
			<text dy="0.35em" textAnchor="middle" className={styles.nodeLabel}>
				{label}
			</text>
			{kind !== label && (
				<text dy="4em" textAnchor="middle" className={styles.nodeKind}>
					{kind}
				</text>
			)}
			{badge}
		</g>
	);
}
