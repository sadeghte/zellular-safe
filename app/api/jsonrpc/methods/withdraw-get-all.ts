import { PendingWithdraw } from "@/models/pending-withdraw";

export const schema = {
	type: "object",
	properties: {
		user: { type: "string" },
	},
	required: ["user"],
}

export const handler = async (params: any) => {
	if (!params || typeof params.user !== "string") {
		throw { code: -32602, message: "Invalid param userAddress" };
	}
    const withdraws = await PendingWithdraw.find({
        'agent.signers': { $regex: params.user, $options: "i" }
    });

    return withdraws;
}