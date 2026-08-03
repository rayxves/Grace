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
	placeholder?: ReactNode;
	placeholderClassName?: string;
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
	placeholder,
	placeholderClassName,
	children,
}: Readonly<PanelProps>) {
	return (
		<section className={panelClassName ?? styles.panel} data-role={dataRole}>
			<h2 className={titleClassName ?? styles.title}>{title}</h2>
			<div ref={contentRef} className={contentClassName ?? styles.content}>
				{isEmpty ? (
					<div className={emptyClassName ?? styles.empty}>
						<p className={placeholderClassName ?? styles.placeholder}>{placeholder}</p>
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
