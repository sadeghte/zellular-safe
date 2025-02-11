"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Tabs } from "./tabs";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchAgentData, fetchDepositAddresses, selectAgents, selectAgentsData } from "@/lib/features/custody/custodySlice";
import { formatAddress } from "@/lib/utils";
import { Table, TBody, Td, THead, Tr } from "./table";
import CustomInput from "./input";
import * as CustodyServiceApi from "@/lib/features/custody/custodyApi"
import * as backend from "@/lib/backend"
import CustomButton from "./button";
import { ChainToken } from "./ChainToken";
import { WithCopy } from "./with-copy";

export default function DepositPage() {
    const dispatch = useAppDispatch();
    const params = useParams();
    // @ts-ignore
    const agentId: string = params.agentId;

    const [selectedChain, setSelectedChain] = useState("SOL")
    const [rangeFrom, setRangeFrom] = useState('0');
    const [rangeTo, setRangeTo] = useState('5');
    const [error, setError] = useState('');
    
    const handleCreateAddress = async (e: any) => {
        e.preventDefault();
        try {
            const result = await CustodyServiceApi.createDepositAddressRange(
                agent.id!,
                selectedChain,
                [parseInt(rangeFrom), parseInt(rangeTo)]
            );
            alert("Addresses created, TX: " + result)
            dispatch(fetchDepositAddresses({ agent: agent.id }))
        } catch (err) {
            setError("Invalid JSON format");
        }
    }

    const agents = useAppSelector(selectAgents);
    const agentsData = useAppSelector(selectAgentsData);

    const agent = useMemo(
        () => agents[agentId],
        [agents, agentId]
    )

    useEffect(() => {
        dispatch(fetchAgentData(agentId))
    }, [agentId])

    const rangeBtnStyle = { marginLeft: ".5rem", marginRight: ".5rem", width: "3rem" }

    return !agentsData[agentId] ? (
        <span>Loading ...</span>
    ) : (
        <div className="page-content">
            <Tabs
                activeTab={selectedChain}
                onTabChange={setSelectedChain}
                tabs={[{ key: "SOL", label: "Solana" }, { key: "TON", label: "Telegram Ton" }]}
            >
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
                    <Table style={{margin: "0 -1rem"}}>
                        <THead>
                            <Tr>
                                <Td>Index</Td>
                                <Td>Deposit Address</Td>
                                <Td>Memo/Comment</Td>
                            </Tr>
                        </THead>
                        <TBody>
                            {agentsData[agent.id].depositAddresses.filter(d => d.chain === selectedChain).map((d, i) => (
                                <Tr key={i}>
                                    <Td>{i}</Td>
                                    <Td><WithCopy value={d.address}>{d.address}</WithCopy></Td>
                                    <Td>
                                        {!!d.memo && <WithCopy value={d.memo}>{d.memo}</WithCopy>}
                                    </Td>
                                    {/* {!!d.memo && <span style={{ paddingLeft: "2rem" }}>Comment/Tag ({d.memo})</span>} */}
                                </Tr>
                            ))}
                        </TBody>
                    </Table>
                </div>
            </Tabs >

            <h1>Deposit History: </h1>
            <div>
                <Table>
                    <THead>
                        <Tr>
                            <Td>Asset</Td>
                            <Td>Address</Td>
                            <Td>amount</Td>
                            <Td>TX</Td>
                        </Tr>
                    </THead>
                    <TBody>
                        {agentsData[agentId]?.deposits.map(d => (
                            <Tr key={d.txHash}>
                                {/* <Td>{d.chain}</Td>
                                <Td>{d.deposit.token}</Td> */}
                                <Td>
                                    <ChainToken chain={d.chain} token={d.deposit.token} />
                                </Td>
                                <Td>
                                    <WithCopy value={d.txHash}>{formatAddress(d.address)}</WithCopy>
                                </Td>
                                <Td>{d.deposit.amount / (10 ** d.deposit.decimals)}</Td>
                                <Td>
                                    <WithCopy value={d.txHash}>{formatAddress(d.txHash)}</WithCopy>
                                </Td>
                            </Tr>
                        ))}
                    </TBody>
                </Table>
            </div>
        </div >
    )
}