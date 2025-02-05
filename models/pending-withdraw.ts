import mongoose from 'mongoose';

interface IAgentInfo {
    id: string;
    signers: string [];
    threshold: number;
}

const AgentInfoSchema = new mongoose.Schema({
    id: { type: String, required: true },
    signers: { type: [String], required: true },
    threshold: { type: Number, required: true },
}, { _id: false });

interface ITokenInfo {
    chain: string,
    symbol: string,
    contract?: string,
}

const TokenInfoSchema = new mongoose.Schema({
    symbol: { type: String, required: true },
    contract: { type: String },
    chain: { type: String, required: true },
}, { _id: false });

export interface PendingWithdrawDoc {
    _id: string,
    agent: IAgentInfo,
    token: ITokenInfo,
    amount: string,
    toAddress: string,
    signatures?: Record<string, string>,
    approvalMessage: string,
    submitted?: boolean
}

const PendingWithdrawSchema = new mongoose.Schema({
    agent: { type: AgentInfoSchema, required: true },
    token: { type: TokenInfoSchema, required: true },
    amount: { type: Number, required: true },
    toAddress: { type: String, required: true },
    signatures: { type: Map, of: String },
    submitted: { type: Boolean, default: false },
}, 
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

PendingWithdrawSchema.virtual('approvalMessage').get(function () {
    if(this.token.chain === 'TON') {
        const token = !!this.token.contract ? 'Jetton' : 'TON';
        return `allowed withdraw ${token}`
    }
    return `I confirm withdrawal of ${this.amount} ${this.token.symbol} to the address ${this.toAddress} on the chain ${this.token.chain}`;
});

export const PendingWithdraw = mongoose.models.PendingWithdraw || mongoose.model('PendingWithdraw', PendingWithdrawSchema);
