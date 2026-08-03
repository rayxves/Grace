import { motion } from "framer-motion";
import styles from "./StackBlock.module.css";

interface StackBlockProps {
	value: string;
	isTop?: boolean;
	layoutId?: string;
}

export function StackBlock({ value, isTop = false, layoutId }: Readonly<StackBlockProps>) {
	return (
		<motion.div
			layoutId={layoutId}
			className={isTop ? `${styles.block} ${styles.blockTop}` : styles.block}
			data-stack-top={isTop || undefined}
			initial={{ opacity: 0, y: -12, scale: 0.9 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, y: -12, scale: 0.9 }}
			transition={{ duration: 0.18 }}
			layout
		>
			{value}
		</motion.div>
	);
}
