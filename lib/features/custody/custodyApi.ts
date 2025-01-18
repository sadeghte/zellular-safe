const CUSTODY_URL = "http://127.0.0.1:5000/jsonrpc/"

const callRpcMethod = async (method: string, params: any) => {
    const response = await fetch(CUSTODY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", method , params }),
    });
    return await response.json();
}

export const registerAgent = async (signers: string[], threshold: number) => {
    const response = await callRpcMethod("registerAgent", { signers, threshold });
    return response.result;
}

// A mock function to mimic making an async request for data
export const getUserAgents = async (userAddress: string) => {
    const response = await callRpcMethod("getUserAgents", { userAddress });
    return response.result;
};

export const createDepositAddressRange = async (agent: string, chain: string, addressRange: number[]): Promise<Record<string, string>> => {
    const response = await callRpcMethod("createDepositAddressRange", { agent, chain, addressRange });
    return response.result;
}

export const getDepositAddresses = async (agent: string, chain: string): Promise<Record<string, string>> => {
    const response = await callRpcMethod("getDepositAddresses", { agent, chain });
    return response.result;
}

export const getDeposits = async (agent: string, account?: number, user?: number): Promise<any> => {
    const response = await callRpcMethod("getDeposits", { agent, account, user });
    return response.result;
}

export const getWithdraws = async (agent: string, account?: number, user?: number): Promise<any> => {
    const response = await callRpcMethod("getWithdraws", { agent, account, user });
    return response.result;
}

type WithdrawParams = {
    agent: string,
    signatures: string[], 
    token: string, 
    targetChain: string, 
    amount: number, 
    toAddress: string
}

export const addWithdraw = async (params: WithdrawParams) => {
    const response = await callRpcMethod("addWithdraw", params);
    return response.result;
}
