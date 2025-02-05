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

export default function Index() {
    const addAgentRef = useRef<AddAgentRef>(null);
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser);
    const agents = useAppSelector(selectAgents);

    const pendingWithdraws = useAppSelector(selectPendingWithdraws);
    const { sdk, account, provider } = useSDK();
    const [selectedChain, setSelectedChain] = useState("SOL")

    const [error, setError] = useState(null);
    const [selectedAgent, setSelectedAgent] = useState(null);

    const handleWithdrawSign = async (withdraw: PendingWithdrawDoc) => {
        try {
            if (!sdk || !account) 
                throw new Error("Please connect to MetaMask first.");

            const provider = sdk.getProvider();
            if (!provider) 
                throw new Error('MetaMask provider is not available.');

            // Request the user to sign the message
            const signature = await provider.request({
                method: 'personal_sign',
                params: [withdraw.approvalMessage, account],
            });

            await backend.signPendingWithdraw(withdraw._id, signature)
            dispatch(fetchPendingWithdraws(user!))
            alert('Message signed successfully!');
        } catch (err) {
            console.log(err)
            setError((err as Error).message);
        }
    }

    const handleWithdrawSubmit = async (withdraw: PendingWithdrawDoc) => {
        try {
            await CustodyServiceApi.addWithdraw({
                agent: withdraw.agent.id,
                signatures: Object.values(withdraw.signatures!),
                token: withdraw.token.symbol,
                targetChain: withdraw.token.chain,
                amount: withdraw.amount,
                toAddress: withdraw.toAddress
            })
            await backend.submitPendingWithdraw(withdraw._id)
            dispatch(fetchPendingWithdraws(account))
            alert('Withdraw submit successfully!');
        } catch (err) {
            alert(err.message);
            console.log(err)
            setError((err as Error).message);
        }
    }

    useEffect(
        () => {
            if(!selectedAgent)
                setSelectedAgent(agents[0] || null)
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

    const agentsMap = useMemo(
        () => {
            let result = {}
            for (let a of agents) {
                let key = a.id
                result[key] = a
            }
            return result
        },
        [agents]
    );

    return <div className="page-content">
        <h1>Agents List: </h1>
        <Tabs
            tabs={[
                ...agents.map(a => ({key: a.id, label: formatAddress(a.id)})),
                {key: '+', label: "+"}
            ]}
            activeTab={selectedAgent?.id || ''}
            onTabChange={id => {
                if(id === '+') {
                    if (addAgentRef.current) {
                        addAgentRef.current.openModal();
                    }
                }
                else{
                    const agent = agents.find(a => a.id === id)
                    // @ts-ignore
                    setSelectedAgent(agent)
                }
            }}
        >
            {!!selectedAgent && (
                <div>
                    <div>Threshold: {agentsMap[selectedAgent.id].threshold}</div>
                    <div>Signers: </div>
                    {agentsMap[selectedAgent.id].signers.map(addr => (
                        <div key={addr}>{addr}</div>
                    ))}
                </div>
            )}
        </Tabs>
        {!!user && <AddAgent ref={addAgentRef} disableTriggerBtn={true} user={user} />}
        <h1>Pending Withdraws</h1>
        <table border={1}>
            <thead>
                <tr>
                    <th>Coin</th>
                    <th>Target Chain</th>
                    <th>Amount</th>
                    <th>To Address</th>
                    <th>Threshold</th>
                    <th># Owners Signed</th>
                </tr>
            </thead>
            <tbody>
                {pendingWithdraws.filter(w => !w.submitted).map((pw, index) => {
                    const numSigned = Object.keys(pw.signatures || {}).length;
                    const threshold = pw.agent.threshold;
                    const canSubmit = numSigned >= threshold;
                    const alreadySigned = Object.keys(pw.signatures || {}).includes(account!.toLowerCase());
                    const isNeedToSign = numSigned < threshold && !alreadySigned;
                    return <tr key={index}>
                        <td>{pw.token.symbol}</td>
                        <td>{pw.token.chain}</td>
                        <td>{pw.amount}</td>
                        <td>{formatAddress(pw.toAddress)}</td>
                        <td>{pw.agent.threshold}</td>
                        <td>{numSigned}</td>
                        <td>
                            {canSubmit ? (
                                <CustomButton onClick={() => handleWithdrawSubmit(pw)}>Submit</CustomButton>
                            ) : (
                                isNeedToSign && <CustomButton onClick={() => handleWithdrawSign(pw)}>Sign</CustomButton>
                            )}
                        </td>
                    </tr>
                })}
            </tbody>
        </table>
        {/* {JSON.stringify(pendingWithdraws)} */}
        <Tabs 
            activeTab={selectedChain} 
            onTabChange={setSelectedChain} 
            tabs={[{key: "SOL", label: "Solana"}, {key: "TON", label: "Telegram Ton"}]}
        >
            {!!selectedAgent && !!selectedChain &&  <AgentChainPan agent={selectedAgent} chain={selectedChain} />}
        </Tabs>
    </div>;
}
