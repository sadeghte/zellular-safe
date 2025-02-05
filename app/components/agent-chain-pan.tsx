'use client';

import React, { useMemo, useState, useEffect } from "react";
import { useSDK } from "@metamask/sdk-react";
import {

    selectDepositAddresses,
    selectDeposits,
    fetchDepositAddresses,
    fetchDeposits,
    fetchPendingWithdraws,
    selectPendingWithdraws,
    fetchWithdraws,
    selectWithdraws,
} from "@/lib/features/custody/custodySlice"
import "./tabs.css"; // Import the CSS file
import CustomInput from "./input";
import CustomButton from "./button";
import { WithdrawAddBox } from "./index/withdraw-add-box";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import * as CustodyServiceApi from "@/lib/features/custody/custodyApi"
import * as backend from "@/lib/backend"
import { cloneObject, formatAddress } from "@/lib/utils";

// Define the interface for the Tabs component props
interface AgentChainPanProps {
    agent: any,
    chain: string
}

export const AgentChainPan: React.FC<AgentChainPanProps> = ({ agent, chain }) => {

    const { sdk, account, provider } = useSDK();
    const dispatch = useAppDispatch();
    
    // page state variables
    const [rangeFrom, setRangeFrom] = useState('0');
    const [rangeTo, setRangeTo] = useState('5');
    const [selectedToken, setSelectedToken] = useState('');
    const [error, setError] = useState('');

    // storage state variables
    const allDepositAddresses = useAppSelector(selectDepositAddresses);
    const allDeposits = useAppSelector(selectDeposits);
    const allWithdraws = useAppSelector(selectWithdraws);

    const depositAddresses = useMemo(
        () => allDepositAddresses.filter(d => d.chain === chain),
        [allDepositAddresses, chain]
    )

    const deposits = useMemo(
        () => allDeposits.filter(d => d.chain === chain),
        [allDeposits, chain]
    )

    const withdraws = useMemo(
        () => allWithdraws.filter(d => d.targetChain === chain),
        [allWithdraws, chain]
    )
    
    const balances = useMemo(
        () => {
            const chainDeposits = deposits.filter(d => d.chain === chain)
            let result:any = {}
            for (let d of chainDeposits) {
                let key = d.deposit.token
                if (!result[key]) {
                    result[key] = cloneObject(d.deposit)
                    result[key].amount = parseInt(d.deposit.amount)
                }
                else {
                    result[key].amount += parseInt(d.deposit.amount)
                }
            }
            return result
        },
        [deposits, chain]
    );
    
    const handleCreateAddress = async (e: any) => {
        e.preventDefault();
        try {
            const result = await CustodyServiceApi.createDepositAddressRange(
                agent.id!,
                chain,
                [parseInt(rangeFrom), parseInt(rangeTo)]
            );
            alert("Addresses created, TX: " + result)
            dispatch(fetchDepositAddresses({ agent: agent.id }))
        } catch (err) {
            setError("Invalid JSON format");
        }
    }

    const editToken = (e: any) => {
        setSelectedToken(e.target.value)
    }

    const rangeBtnStyle = { marginLeft: ".5rem", marginRight: ".5rem", width: "3rem" }

    return !chain ? (<span>Select the chain</span>) : (
        <div>
            <span>Create Deposit Address in range </span>
            <CustomInput
                style={rangeBtnStyle}
                variant="primary"
                className=""
                value={rangeFrom}
                // @ts-ignore
                onChange={e => setRangeFrom(e.target.value)}
            />
            <span>, </span>
            <CustomInput
                style={rangeBtnStyle}
                variant="primary"
                className=""
                value={rangeTo}
                // @ts-ignore
                onChange={e => setRangeTo(e.target.value)}
            />
            <span> : </span>
            <CustomButton
                variant="primary"
                onClick={handleCreateAddress}
            >Create</CustomButton>
            <h1>Deposit Addresses: </h1>
            <div>
                {depositAddresses.map((d, i) => (
                    <div key={i}>
                        [{i}]: {d.address}
                        {!!d.memo && <span style={{paddingLeft: "2rem"}}>Comment/Tag ({d.memo})</span>}
                    </div>
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
                    chain={chain}
                    agent={agent}
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
                        {(deposits).map(d => (
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
    )
}