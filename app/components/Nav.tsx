"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

import styles from "../styles/layout.module.css";
import { ConnectWalletButton } from "./web3-connect";

export const Nav = () => {
	const pathname = usePathname();
    const params = useParams();
    // @ts-ignore
    const agentId:string = params.agentId; // Access the `id` parameter

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
            {!!agentId && (
                <>
                    <div className={styles.navItem}>
                        <Link
                            className={`${styles.link} ${pathname === `/agent/${agentId}` ? styles.active : ""
                                }`}
                            href={`/agent/${agentId}`}
                        >
                            Home
                        </Link>
                    </div>
                    <div className={styles.navItem}>
                        <Link
                            className={`${styles.link} ${pathname === `/agent/${agentId}/deposit` ? styles.active : ""
                                }`}
                            href={`/agent/${agentId}/deposit`}
                        >
                            Deposit
                        </Link>
                    </div>
                    <div className={styles.navItem}>
                        <Link
                            className={`${styles.link} ${pathname === `/agent/${agentId}/withdraw` ? styles.active : ""
                                }`}
                            href={`/agent/${agentId}/withdraw`}
                        >
                            Withdraw
                        </Link>
                    </div>
                </>
            )}
            <ConnectWalletButton />
		</nav>
	);
};
