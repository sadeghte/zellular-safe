"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { StoreProvider } from "./StoreProvider";
import { MetaMaskProvider } from "@metamask/sdk-react";
import { Nav } from "./components/Nav";

import "./styles/globals.css";
import styles from "./styles/layout.module.css";

interface Props {
	readonly children: ReactNode;
}

export default function RootLayout({ children }: Props) {

	const host = typeof window !== "undefined" ? window.location.host : "defaultHost";
	const sdkOptions = {
		logging: { developerMode: false },
		checkInstallationImmediately: false,
		dappMetadata: {
			name: "Next-Metamask-Boilerplate",
			url: host, // using the host constant defined above
		},
	};
    
	return (
		<StoreProvider>
			<html lang="en">
				<body>
			<MetaMaskProvider debug={false} sdkOptions={sdkOptions}>
						<section className={styles.container}>
							<Nav />

							<main className={styles.main}>{children}</main>

							<footer className={styles.footer}>
								<span>Learn </span>
								<a
									className={styles.link}
									href="https://reactjs.org"
									target="_blank"
									rel="noopener noreferrer"
								>
									React
								</a>
								<span>, </span>
								<a
									className={styles.link}
									href="https://redux.js.org"
									target="_blank"
									rel="noopener noreferrer"
								>
									Redux
								</a>
								<span>, </span>
								<a
									className={styles.link}
									href="https://redux-toolkit.js.org"
									target="_blank"
									rel="noopener noreferrer"
								>
									Redux Toolkit
								</a>
								<span>, </span>
								<a
									className={styles.link}
									href="https://react-redux.js.org"
									target="_blank"
									rel="noopener noreferrer"
								>
									React Redux
								</a>
								,<span> and </span>
								<a
									className={styles.link}
									href="https://reselect.js.org"
									target="_blank"
									rel="noopener noreferrer"
								>
									Reselect
								</a>
							</footer>
						</section>
                </MetaMaskProvider>
				</body>
			</html>
		</StoreProvider>
	);
}
