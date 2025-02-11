"use client";
export const dynamic = "force-static";

import React, { useEffect } from "react";
import { useParams } from "next/navigation"; // Import useParams
import { fetchAgentData, selectAgents, selectAgentsData, selectDeposits } from "@/lib/features/custody/custodySlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useMemo } from "react";
import { cloneObject } from "@/lib/utils";
import { Table, TBody, Td, THead, Tr } from "@/app/components/table";


export default function ItemPage() {
    const params = useParams();
    // @ts-ignore
    const agentId: string = params.agentId; // Access the `id` parameter
    const dispatch = useAppDispatch();

    const agents = useAppSelector(selectAgents);
    const agentsData = useAppSelector(selectAgentsData)
    const deposits = useAppSelector(selectDeposits);

    const agent = useMemo(() => {
        return agents[agentId]
    }, [agents, agentId])

    useEffect(() => {
        if (!!agentId) {
            dispatch(fetchAgentData(agentId))
        }
    }, [agentId]);

    const currentAgentData = useMemo(() => agentsData[agentId], [agentId, agentsData])

    const balances = useMemo(
        () => {
            let result: any = {}
            for (let d of currentAgentData?.deposits || []) {
                let key = `${d.chain}-${d.deposit.token}`
                if (!result[key]) {
                    result[key] = {
                        chain: d.chain,
                        ...cloneObject(d.deposit)
                    }
                    result[key].amount = parseInt(d.deposit.amount)
                }
                else {
                    result[key].amount += parseInt(d.deposit.amount)
                }
            }
            return result
        },
        [currentAgentData]
    );

    return (
        <div className="page-content">
            <div style={{ marginTop: '1rem' }} className="pan1">
                <div className="head">Signers</div>
                {agent && agent.signers.map(s => (
                    <div key={s}>{s}</div>
                ))}
            </div>
            <Table style={{ marginTop: '1rem' }}>
                <THead>
                    <Tr>
                        <Td>Asset</Td>
                        <Td>Balance</Td>
                        <Td>Value</Td>
                        <Td></Td>
                    </Tr>
                </THead>
                <TBody>
                    {Object.keys(balances).map(key => (
                        <Tr key={key}>
                            <Td>
                                <img className="token-icon" src={`/asset-icon/${balances[key].token.toLowerCase()}.svg`} />
                                <img className="token-icon chain-ind" src={`/asset-icon/${balances[key].chain.toLowerCase()}.svg`} />
                                <span style={{ paddingLeft: '1rem' }}>{balances[key].token}</span>
                            </Td>
                            <Td>{balances[key].amount / (10 ** balances[key].decimals)}</Td>
                            <Td>$120,0</Td>
                            <Td></Td>
                        </Tr>
                    ))}
                </TBody>
            </Table>
        </div>
    );
}