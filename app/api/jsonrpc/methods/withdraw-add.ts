import {PendingWithdraw} from '@/models/pending-withdraw';

export const schema = {
    type: "object",
    properties: {
        agent: {
            type: "object",
            properties: {
                id: { type: "string" },
                threshold: { type: "number", minimum: 1 },
                signers: {
                    type: "array",
                    items: { type: "string" }, // Array of strings
                },
            },
            required: ["id", "threshold", "signers"],
        },
        token: { 
            type: "object",
            properties: {
                symbol: { type: "string" },
                contract: { type: "string" },
                chain: { type: "string" }
            },
            required: ["symbol", "chain"] 
        },
        amount: { type: "number" },
        toAddress: { type: "string" },
    },
    required: ["agent", "token", "amount", "toAddress"],
};

export const handler = async (params: any) => {
    delete params.agent._id;

    console.log(params);

    let doc = new PendingWithdraw(params);
    await doc.save()
    return true;
}