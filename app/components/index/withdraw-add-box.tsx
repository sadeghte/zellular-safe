"use client";

import { useState, useMemo } from "react";
import { useSDK } from "@metamask/sdk-react";
import CustomInput from "../input";
import CustomButton from "../button";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchWithdraws, selectDeposits, fetchPendingWithdraws } from "@/lib/features/custody/custodySlice";
import * as CustodyServiceApi from "@/lib/features/custody/custodyApi"
import * as backend from "@/lib/backend";

interface WithdrawBoxProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    agent: any,
    balances: Record<string, bigint>;
    token: string;
    chain: string;
}

export const WithdrawAddBox: React.FC<WithdrawBoxProps> = ({chain, agent, token, balances}) => {
    const dispatch = useAppDispatch();
    const { sdk, account, chainId } = useSDK();
    const [amount, setAmount] = useState("")
    const [toAddress, setWithdrawTo] = useState("")

    const withdraw = async (e: any) => {
        e.preventDefault();

        if(!token) {
            alert("select token")
            return;
        }

        const withdrawAmount = parseFloat(amount) * (10 ** balances[token].decimals)
        if(withdrawAmount > balances[token].amount) {
            alert("High amount.")
            return;
        }

        if(!toAddress) {
            alert("Enter recepient address.")
            return;
        }

        try {
            await backend.addPendingWithdraw({
                agent, 
                token: {
                    symbol: token,
                    contract: balances[token].contract,
                    chain,
                }, 
                amount: withdrawAmount, 
                toAddress
            })
            dispatch(fetchPendingWithdraws(account!))
            alert("success");
        }
        catch(e) {
            alert(e.message)
        }
        
        // let result = await CustodyServiceApi.withdraw({
        //     agent: params.agent.id,
        //     signatures: [],
        //     token: params.token,
        //     targetChain: "SOL",
        //     amount: withdrawAmount, 
        //     toAddress,
        // })
        // alert(`Withdraw registered successfully: ${result}`)
        // // setAmount("")
        // // setWithdrawTo("")
        // dispatch(fetchWithdraws({agent: params.agent.id}))
    }

    const editAmount = (e: any) => {
        setAmount(e.target.value)
    }

    const editAddress = (e: any) => {
        setWithdrawTo(e.target.value)
    }

    return (
            <div>
                <div>{JSON.stringify(balances)}</div>
                Amount: <CustomInput value={amount} onChange={editAmount} style={{marginRight: '1rem'}} />
                To Address: <CustomInput value={toAddress} onChange={editAddress} style={{marginRight: '1rem'}} />
                <CustomButton onClick={withdraw}>Withdraw</CustomButton>
            </div>
    )
}