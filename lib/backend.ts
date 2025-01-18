import { callRpc } from "./utils";

export type AddWithdrawData = {
    agent: {
        id: string,
        threshold: number,
        signers: string[],
    },
    token: {
        symbol: string,
        contract?: string,
        chain: string
    },
    amount: number,
    toAddress: string
}

export async function addPendingWithdraw(data: AddWithdrawData) {
    return await callRpc('/api/jsonrpc', "addWithdraw", data);
}

export async function signPendingWithdraw(_id: string, signature: string) {
    return await callRpc('/api/jsonrpc', "signWithdraw", {_id, signature});
}

export async function submitPendingWithdraw(_id: string) {
    return await callRpc('/api/jsonrpc', "submitWithdraw", {_id});
}

export async function getPendingWithdraws(user: string) {
    return await callRpc('/api/jsonrpc', "getWithdraws", {user});
}