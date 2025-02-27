"use client";

import {
    selectAgents,
    selectAgentsData,
    fetchAgents,
    fetchAgentData,
    fetchPendingWithdraws,
    selectPendingWithdraws,
    fetchAvailableTokens,
    selectAvailableTokens,
} from "@/lib/features/custody/custodySlice";
import { useSDK } from "@metamask/sdk-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { cloneObject, formatAddress } from "@/lib/utils";
import { Table, TBody, Td, Th, THead, Tr } from "./table";
import CustomInput from "./input";
import CustomButton from "./button";
import * as backend from "@/lib/backend";
import * as CustodyServiceApi from "@/lib/features/custody/custodyApi"
import styles from "../styles/layout.module.css";
import { PendingWithdrawDoc } from "@/models/pending-withdraw";
import { calculateAgentBalance } from "@/lib/agent-utils";


export default function WithdrawPage() {
    const { sdk, account, chainId } = useSDK();
    const dispatch = useAppDispatch();
    const params = useParams();
    // @ts-ignore
    const agentId: string = params.agentId;

    const agents = useAppSelector(selectAgents);
    const agentsData = useAppSelector(selectAgentsData);
    const pendingWithdraws = useAppSelector(selectPendingWithdraws);
    const availableTokens = useAppSelector(selectAvailableTokens);

    const [selectedBalance, setSelectedBalance] = useState(null);
    const [amount, setAmount] = useState('');
    const [address, setAddress] = useState('');
    const [error, setError] = useState('');

    const handleWithdraw = async (e: any) => {
        e.preventDefault();

        if (!selectedBalance) {
            alert("select token")
            return;
        }

        const withdrawAmount = parseFloat(amount) * (10 ** selectedBalance.decimals)
        if (withdrawAmount > selectedBalance.amount) {
            alert("High amount.")
            return;
        }

        if (!address) {
            alert("Enter recepient address.")
            return;
        }

        if (!agents[agentId]) {
            alert("Agents data not loaded.")
            return;
        }

        try {
            await backend.addPendingWithdraw({
                agent: agents[agentId],
                token: {
                    symbol: selectedBalance.token,
                    contract: selectedBalance.contract,
                    chain: selectedBalance.chain,
                },
                amount: withdrawAmount,
                toAddress: address
            })
            dispatch(fetchPendingWithdraws(account!))
            alert("success");
        }
        catch (e) {
            alert(e.message)
        }
    }

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
            dispatch(fetchPendingWithdraws(account!))
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
            dispatch(fetchPendingWithdraws(account!))
            alert('Withdraw submit successfully!');
        } catch (err) {
            alert(err.message);
            console.log(err)
            setError((err as Error).message);
        }
    }

    const handleTokenChange = (event: any) => {
        const selectedValue = JSON.parse(event.target.value);
        setSelectedBalance(selectedValue);
    };

    const balances = useMemo(
        () => {
            let result: any = calculateAgentBalance(
                agentsData[agentId]?.deposits || [],
                agentsData[agentId]?.withdraws || []
            )
            return result
        },
        [agentsData, agentId]
    );

    const tokenDecimals = useMemo(
        () => {
            let result:Record<string, number> = {}
            for(const chain in availableTokens) {
                for(const info of availableTokens[chain]) {
                    result[`${chain}-${info.symbol}`] = info.decimals;
                }
            }
            return result
        },
        [availableTokens]
    )

    useEffect(() => {
        if (!account)
            return;
        dispatch(fetchPendingWithdraws(account!));
        dispatch(fetchAgents(account!));
        dispatch(fetchAgentData(agentId));
        dispatch(fetchAvailableTokens());
    }, [account, agentId])

    return !agentsData[agentId] ? (
        <span>Loading ...</span>
    ) : (
        <div className="page-content" style={{ marginTop: '1rem' }}>
            {(pendingWithdraws.length > 0) && (
                <div className="pan1" style={{marginBottom: '1rem'}}>
                    <h1>Pending Withdraws</h1>
                    <Table>
                        <THead>
                            <Tr>
                                <Th>Coin</Th>
                                <Th>Target Chain</Th>
                                <Th>Amount</Th>
                                <Th>To Address</Th>
                                <Th>Threshold</Th>
                                <Th># Owners Signed</Th>
                            </Tr>
                        </THead>
                        <TBody>
                            {pendingWithdraws.map((pw, index) => {
                                const numSigned = Object.keys(pw.signatures || {}).length;
                                const threshold = pw.agent.threshold;
                                const canSubmit = numSigned >= threshold;
                                const alreadySigned = Object.keys(pw.signatures || {}).includes(account!.toLowerCase());
                                const isNeedToSign = numSigned < threshold && !alreadySigned;
                                const {chain, symbol} = pw.token;
                                const decimal = tokenDecimals[`${chain}-${symbol}`] || 0
                                return <Tr key={index}>
                                    <Td>{symbol}</Td>
                                    <Td>{chain}</Td>
                                    <Td>{pw.amount / (10**decimal)}</Td>
                                    <Td>{formatAddress(pw.toAddress)}</Td>
                                    <Td>{pw.agent.threshold}</Td>
                                    <Td>{numSigned}</Td>
                                    <Td>
                                        {canSubmit ? (
                                            <CustomButton onClick={() => handleWithdrawSubmit(pw)}>Submit</CustomButton>
                                        ) : (
                                            isNeedToSign && <CustomButton onClick={() => handleWithdrawSign(pw)}>Sign</CustomButton>
                                        )}
                                    </Td>
                                </Tr>
                            })}
                        </TBody>
                    </Table>
                </div>
            )}
            <div className="pan1" >
                <ol style={{ width: "30rem" }}>
                    <li>
                        <div>Select coin/token to withdraw</div>
                        {/* <div>{JSON.stringify(selectedBalance)}</div> */}
                        <select onChange={handleTokenChange} style={{ width: '100%' }} className={styles.Input}>
                            <option value={"null"}> </option>
                            {Object.entries(balances)
                                .filter(([key, balance]) => balance.amount>0)
                                .map(([key, balance]) => (
                                    <option
                                        key={key}
                                        value={JSON.stringify(balance)}
                                    >
                                        {balance.token} on {balance.chain} network
                                    </option>
                                ))}
                        </select>
                    </li>
                    <li>
                        <div>
                            Enter amount to withdraw
                            {!!selectedBalance && (
                                <span
                                    className="pointer"
                                    onClick={() => setAmount((selectedBalance.amount / (10 ** selectedBalance.decimals)).toString())}
                                >
                                    (max {selectedBalance.amount / (10 ** selectedBalance.decimals)})
                                </span>
                            )}
                        </div>
                        <CustomInput
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            style={{ width: '100%' }}
                        />
                    </li>
                    <li>
                        <div>Enter receiving address</div>
                        <CustomInput
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            style={{ width: '100%' }}
                        />
                    </li>
                    <li>
                        <div> </div>
                        <CustomButton onClick={handleWithdraw}>Withdraw</CustomButton>
                    </li>
                </ol>
                {/* <WithdrawAddBox
                        chain={chain}
                        agent={agent}
                        balances={balances}
                        token={selectedToken}
                    /> */}
                <h1>Withdraw History </h1>
                <Table style={{ margin: "0 -1rem" }}>
                    <THead>
                        <Tr>
                            <Th>Token</Th>
                            <Th>Network</Th>
                            <Th>Amount</Th>
                            <Th>To Address</Th>
                            <Th>Status</Th>
                            <Th>TX</Th>
                        </Tr>
                    </THead>
                    <TBody>
                        {agentsData[agentId].withdraws.map(d => (
                            <Tr key={d.id}>
                                <Td>{d.token.symbol}</Td>
                                <Td>{d.targetChain}</Td>
                                <Td>{d.amount / (10 ** d.token.decimals)}</Td>
                                <Td>{formatAddress(d.toAddress)}</Td>
                                <Td>{d.status}</Td>
                                <Td>{formatAddress(d.txHash)}</Td>
                            </Tr>
                        ))}
                    </TBody>
                </Table>
            </div>
        </div>
    );
}