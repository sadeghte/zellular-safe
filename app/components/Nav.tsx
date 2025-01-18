"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "../styles/layout.module.css";
import { ConnectWalletButton } from "./web3-connect";

export const Nav = () => {
	const pathname = usePathname();

	return (
		<nav className={styles.nav}>
			<div className={`${styles.navItem} ${styles.flexFill}`}>
				<Link
					className={`${styles.link} ${pathname === "/" ? styles.active : ""}`}
					href="/"
				>
					Zellular Safe
				</Link>
			</div>
			<div className={styles.navItem}>
				<Link
					className={`${styles.link} ${pathname === "/api-test" ? styles.active : ""
						}`}
					href="/api-test"
				>
					Api Test
				</Link>
			</div>
			<div className={styles.navItem}>
				<Link
					className={`${styles.link} ${pathname === "/counter" ? styles.active : ""
						}`}
					href="/counter"
				>
					Counter
				</Link>
			</div>
			<div className={styles.navItem}>
				<Link
					className={`${styles.link} ${pathname === "/withdraw" ? styles.active : ""
						}`}
					href="/withdraw"
				>
					Withdraw
				</Link>
			</div>
            <ConnectWalletButton />
		</nav>
	);
};
