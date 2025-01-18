"use client";

import React, { useEffect } from "react";
import { useSDK } from "@metamask/sdk-react";
import { formatAddress } from "../../lib/utils";
import * as Popover from "@radix-ui/react-popover"
import styles from "../styles/layout.module.css";
import { setUser, setAgents, fetchAgents } from "@/lib/features/custody/custodySlice"
import "../styles/popover.css";
import { useAppDispatch } from "@/lib/hooks";

export const ConnectWalletButton = () => {
    const dispatch = useAppDispatch();
    const { sdk, account, chainId } = useSDK();

    const connect = async () => {
        try {
            await sdk?.connect();
        } catch (err) {
            console.warn(`No accounts found`, err);
        }
    };

    const disconnect = async () => {
        if (sdk) {
            await sdk.terminate();
        }
        else {
            alert("metamask sdk missing.")
        }
    };

    useEffect(() => {
        if (!!account) {
            dispatch(setUser(account));
            dispatch(fetchAgents(account))
        } else {
            dispatch(setUser(null));
            dispatch(setAgents([]));
        }
    }, [account]);

    return !!account ? (
        <Popover.Root>
            <Popover.Trigger asChild>
                {/* <span>{formatAddress(account)}</span> */}
                <div className={styles.navItem}>
                    <span className={styles.avatar}></span>
                    <div className={styles.addrBalance}>
                        <span>0x7D43...45Fd</span>
                        <span>12.2 ETH 0000</span>
                    </div>
                </div>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content className="PopoverContent" sideOffset={5}>
                    <button
                        onClick={disconnect}
                        className="block w-full pl-2 pr-4 py-2 text-left text-[#F05252] hover:bg-gray-200"
                    >
                        Disconnect
                    </button>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    ) : (
        <div className={styles.navItem}>
            <button onClick={connect}>
                Connect Wallet
            </button>
        </div>
    )
};