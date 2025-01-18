"use client";

import { useEffect, useState, useMemo } from "react";
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
import { AddAgent } from "./add-agent";
import * as backend from "@/lib/backend"
import Link from "next/link";

export default function Index() {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser);
    const agents = useAppSelector(selectAgents);
    const [selectedToken, setSelectedToken] = useState(null);
    const depositAddresses = useAppSelector(selectDepositAddresses);
    const deposits = useAppSelector(selectDeposits);
    const pendingWithdraws = useAppSelector(selectPendingWithdraws);
    const withdraws = useAppSelector(selectWithdraws);
    const { sdk, account, provider } = useSDK();
    const [signature, setSignature] = useState<string | null>(null);

    const [error, setError] = useState(null);
    const [selectedAgent, setSelectedAgent] = useState(null);

    const [rangeFrom, setRangeFrom] = useState(0);
    const [rangeTo, setRangeTo] = useState(5);

    const handleCreateAddress = async (e: any) => {
        e.preventDefault();
        try {
            if (selectedAgent == null)
                return;

            const result = await CustodyServiceApi.createDepositAddressRange(
                selectedAgent.id!,
                "SOL",
                [parseInt(rangeFrom), parseInt(rangeTo)]
            );
            alert("Addresses created, TX: " + result)
            dispatch(fetchDepositAddresses({ agent: selectedAgent.id, chain: "SOL" }))
        } catch (err) {
            setError("Invalid JSON format");
        }
    }

    const handleWithdrawSign = async (index: number) => {
        try {
            if (!sdk || !account) 
                throw new Error("Please connect to MetaMask first.");

            const provider = sdk.getProvider();
            if (!provider) 
                throw new Error('MetaMask provider is not available.');

            const withdraw = pendingWithdraws[index];
            // Request the user to sign the message
            const signature = await provider.request({
                method: 'personal_sign',
                params: [withdraw.approvalMessage, account],
            });

            await backend.signPendingWithdraw(withdraw._id, signature)
            alert('Message signed successfully!');
        } catch (err) {
            console.log(err)
            setError((err as Error).message);
        }
    }

    const handleWithdrawSubmit = async (index: number) => {
        try {
            const withdraw = pendingWithdraws[index];
            await CustodyServiceApi.addWithdraw({
                agent: withdraw.agent.id,
                signatures: Object.values(withdraw.signatures),
                token: withdraw.token.symbol,
                targetChain: withdraw.token.chain,
                amount: withdraw.amount,
                toAddress: withdraw.toAddress
            })
            await backend.submitPendingWithdraw(withdraw._id)
            alert('Withdraw submit successfully!');
        } catch (err) {
            console.log(err)
            setError((err as Error).message);
        }
    }

    useEffect(() => {
        if (!!selectedAgent) {
            dispatch(fetchDepositAddresses({ agent: selectedAgent.id, chain: "SOL" }))
            dispatch(fetchDeposits({ agent: selectedAgent.id }))
            dispatch(fetchWithdraws({ agent: selectedAgent.id }))
        }
    }, [selectedAgent]);

    useEffect(() => {
        if (!!user) {
            dispatch(fetchPendingWithdraws(user))
        }
    }, [user]);

    const editToken = (e: any) => {
        setSelectedToken(e.target.value)
    }

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

    const balances = useMemo(
        () => {
            let result = {}
            for (let d of deposits) {
                let key = d.deposit.token
                if (!result[key]) {
                    result[key] = cloneObject(d.deposit)
                }
                else {
                    result[key].amount += d.deposit.amount
                }
            }
            return result
        },
        [deposits]
    );

    const rangeBtnStyle = { marginLeft: ".5rem", marginRight: ".5rem", width: "3rem" }

    return <div>
        <h1>Agents List: </h1>
        {agents.map(a => (<p key={a.id} onClick={() => setSelectedAgent(a)} >
            <span className={`${styles.clickable} ${a.id == selectedAgent?.id ? styles.selected : null}`} >{formatAddress(a.id)}</span>
        </p>))}
        {!!user && <AddAgent user={user} />}
        {!!selectedAgent && (
            <div>
                <h5>Threshold</h5>
                <div>{agentsMap[selectedAgent.id].threshold}</div>
                <h5>Signers</h5>
                {agentsMap[selectedAgent.id].signers.map(addr => (
                    <div key={addr}>{addr}</div>
                ))}
            </div>
        )}
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
                {pendingWithdraws.map((pw, index) => {
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
                                <CustomButton onClick={() => handleWithdrawSubmit(index)}>Submit</CustomButton>
                            ) : (
                                isNeedToSign && <CustomButton onClick={() => handleWithdrawSign(index)}>Sign</CustomButton>
                            )}
                        </td>
                    </tr>
                })}
            </tbody>
        </table>
        {/* {JSON.stringify(pendingWithdraws)} */}
        <h1>Chain: Solana</h1>
        {!!selectedAgent &&
            <div>
                <span>Create Deposit Address in range </span>
                <CustomInput
                    style={rangeBtnStyle}
                    variant="primary"
                    className=""
                    value={rangeFrom}
                    onChange={e => setRangeFrom(e.target.value)}
                />
                <span>, </span>
                <CustomInput
                    style={rangeBtnStyle}
                    variant="primary"
                    className=""
                    value={rangeTo}
                    onChange={e => setRangeTo(e.target.value)}
                />
                <span> : </span>
                <CustomButton
                    variant="primary"
                    onClick={handleCreateAddress}
                >Create</CustomButton>
                <h1>Deposit Addresses: </h1>
                <div>
                    {Object.keys(depositAddresses).map(i => (
                        <div key={i}>[{i}]: {depositAddresses[i].address}</div>
                    ))}
                </div>
                <h1>Balance: </h1>
                <div>
                    {Object.keys(balances).map(token => (
                        <div key={token}>
                            <label>
                                <input
                                    type="radio"
                                    name="withdrawToken"
                                    value={token}
                                    checked={selectedToken == token}
                                    onChange={editToken}
                                />
                                {token}: {balances[token].amount / (10 ** balances[token].decimals)}
                            </label>
                        </div>
                    ))}
                    <WithdrawAddBox
                        agent={selectedAgent}
                        balances={balances}
                        token={selectedToken}
                    />
                </div>
                <h1>Deposit History: </h1>
                <div>
                    <table border={1}>
                        <thead>
                            <tr>
                                <th>Chain</th>
                                <th>Address</th>
                                <th>Token</th>
                                <th>amount</th>
                                <th>TX</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deposits.map(d => (
                                <tr key={d.txHash}>
                                    <td>{d.chain}</td>
                                    <td>{formatAddress(d.address)}</td>
                                    <td>{d.deposit.token}</td>
                                    <td>{d.deposit.amount / (10 ** d.deposit.decimals)}</td>
                                    <td>{formatAddress(d.txHash)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <h1>Withdraw History: </h1>
                <div>
                    <table border={1}>
                        <thead>
                            <tr>
                                <th>To Chain</th>
                                <th>Token</th>
                                <th>amount</th>
                                <th>To Address</th>
                                <th>Status</th>
                                <th>TX</th>
                            </tr>
                        </thead>
                        <tbody>
                            {withdraws.map(d => (
                                <tr key={d.id}>
                                    <td>{d.targetChain}</td>
                                    <td>{d.token.symbol}</td>
                                    <td>{d.amount / (10 ** d.token.decimals)}</td>
                                    <td>{formatAddress(d.toAddress)}</td>
                                    <td>{d.status}</td>
                                    <td>{formatAddress(d.txHash)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        }
    </div>;
}
