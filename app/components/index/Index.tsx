"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import {
    setUser,
    setAgents,
    fetchAgents,
    selectUser,
    selectAgents,
    selectDepositAddresses,
    selectDeposits,
    fetchDepositAddresses,
    fetchDeposits,
    fetchPendingWithdraws,
    selectPendingWithdraws,
    fetchWithdraws,
    selectWithdraws,
} from "@/lib/features/custody/custodySlice"
import { useSDK } from "@metamask/sdk-react";
import { ethers } from "ethers";
import * as CustodyServiceApi from "@/lib/features/custody/custodyApi"
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import CustomButton from "../button";
import styles from '@/app/styles/layout.module.css'
import { cloneObject, formatAddress } from "@/lib/utils";
import CustomInput from "../input";
import { WithdrawAddBox } from "./withdraw-add-box";
import AddAgent , {AddAgentRef} from "./add-agent";
import * as backend from "@/lib/backend"
import Link from "next/link";
import { Tabs } from "../tabs";
import { AgentChainPan } from "../agent-chain-pan";
import { PendingWithdrawDoc } from "@/models/pending-withdraw";
import { Span } from "next/dist/trace";

export default function Index() {
    const addAgentRef = useRef<AddAgentRef>(null);
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser);
    const agents = useAppSelector(selectAgents);

    const { sdk, account, provider } = useSDK();
    const [selectedChain, setSelectedChain] = useState("SOL")

    const [error, setError] = useState(null);
    const [selectedAgent, setSelectedAgent] = useState(null);

    useEffect(
        () => {
            if(!selectedAgent) {
                let id:string = Object.keys(agents)[0];
                // @ts-ignore
                setSelectedAgent(agents[id] || null)
            }
        },
        [agents]
    )

    useEffect(() => {
        if (!!selectedAgent) {
            dispatch(fetchDepositAddresses({ agent: selectedAgent.id }))
            dispatch(fetchDeposits({ agent: selectedAgent.id }))
            dispatch(fetchWithdraws({ agent: selectedAgent.id }))
        }
    }, [selectedAgent]);

    useEffect(() => {
        if (!!user) {
            dispatch(fetchPendingWithdraws(user))
        }
    }, [user]);

    return <div className="page-content">

        <div style={{display: 'flex', alignItems: 'center'}}>
            <h1 style={{flexGrow: 1}}>My Safe Accounts</h1>
            {!!user && <AddAgent ref={addAgentRef} user={user} />}
        </div>
        <div className="pan1">
            {Object.values(agents).map(a => (
                <Link key={a.id} href={`/agent/${a.id}`}>
                    <div className="box-hover-1">
                        <div className="avatar x2"></div>
                        <span className="acc-threshold">{a.threshold}/{a.signers.length}</span>
                        {a.signers.map(s => <span style={{margin: '0 0.5rem'}} key={s}>{formatAddress(s)}</span>)}
                    </div>
                </Link>
            ))}
        </div>
    </div>;
}
