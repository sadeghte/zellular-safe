import axios from 'axios'


export const formatBalance = (rawBalance: string) => {
	const balance = (parseInt(rawBalance) / 1000000000000000000).toFixed(2);
	return balance;
};

export const formatChainAsNum = (chainIdHex: string) => {
	const chainIdNum = parseInt(chainIdHex);
	return chainIdNum;
};

export const formatAddress = (addr: string | undefined) => {
	return `${addr?.substring(0, 6)}...${addr?.substr(-4)}`;
};

export async function callRpc(url: string, method: string, params?: any, id: number = 1): Promise<any> {
    const payload = {
        jsonrpc: "2.0",
        method,
        params,
        id,
    };

    try {
        const response = await axios.post(url, payload, {
            headers: { 'Content-Type': 'application/json' },
        });

        if (response.data.error) {
            throw new Error(
                `RPC Error: ${response.data.error.message} (Code: ${response.data.error.code})`
            );
        }

        return response.data.result;
    } catch (error) {
        console.error("JSON-RPC call failed:", error.message);
        throw error;
    }
}

export function cloneObject(input: any) {
    return JSON.parse(JSON.stringify(input))
}