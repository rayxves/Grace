import type { CSSProperties, ReactNode, Ref } from "react";
import styles from "./Panel.module.css";

interface PanelProps {
	title: ReactNode;
	titleClassName?: string;
	dataRole?: string;
	panelClassName?: string;
	contentClassName?: string;
	contentRef?: Ref<HTMLDivElement>;
	emptyClassName?: string;
	badge?: ReactNode;
	badgeClassName?: string;
	badgeStyle?: CSSProperties;
	isEmpty?: boolean;
	emptyIcon?: ReactNode;
	placeholder?: ReactNode;
	placeholderClassName?: string;
	emptyActionLabel?: string;
	onEmptyAction?: () => void;
	emptyActionDisabled?: boolean;
	children?: ReactNode;
}

export function Panel({
	title,
	titleClassName,
	dataRole,
	panelClassName,
	contentClassName,
	contentRef,
	emptyClassName,
	badge,
	badgeClassName,
	badgeStyle,
	isEmpty = false,
	emptyIcon,
	placeholder,
	placeholderClassName,
	emptyActionLabel,
	onEmptyAction,
	emptyActionDisabled = false,
	children,
}: Readonly<PanelProps>) {
	return (
		<section className={panelClassName ?? styles.panel} data-role={dataRole}>
			<h2 className={titleClassName ?? styles.title}>{title}</h2>
			<div ref={contentRef} className={contentClassName ?? styles.content}>
				{isEmpty ? (
					<div className={emptyClassName ?? styles.empty}>
						{emptyIcon && <span className={styles.emptyIcon}>{emptyIcon}</span>}
						<p className={placeholderClassName ?? styles.placeholder}>{placeholder}</p>
						{onEmptyAction && emptyActionLabel && (
							<button
								type="button"
								className={styles.emptyAction}
								onClick={onEmptyAction}
								disabled={emptyActionDisabled}
							>
								{emptyActionLabel}
							</button>
						)}
					</div>
				) : (
					<>
						{badge && (
							<span className={badgeClassName ?? styles.badge} style={badgeStyle}>
								{badge}
							</span>
						)}
						{children}
					</>
				)}
			</div>
		</section>
	);
}
