import mongoose from 'mongoose';

const AgentInfoSchema = new mongoose.Schema({
    id: { type: String, required: true },
    signers: { type: [String], required: true },
    threshold: { type: Number, required: true },
}, { _id: false });


const TokenInfoSchema = new mongoose.Schema({
    symbol: { type: String, required: true },
    contract: { type: String },
    chain: { type: String, required: true },
}, { _id: false });

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
    return `I confirm withdrawal of ${this.amount} ${this.token.symbol} to the address ${this.toAddress} on the chain ${this.token.chain}`;
});

export const PendingWithdraw = mongoose.models.PendingWithdraw || mongoose.model('PendingWithdraw', PendingWithdrawSchema);
