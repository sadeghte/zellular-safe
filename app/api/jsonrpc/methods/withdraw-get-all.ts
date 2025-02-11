import { PendingWithdraw } from "@/models/pending-withdraw";

export const schema = {
	type: "object",
	properties: {
		user: { type: "string" },
		submitted: { type: "boolean" },
	},
	required: ["user"],
}

export const handler = async (params: any = {}) => {
    const {user, submitted} = params;
	if (typeof user !== "string") {
		throw { code: -32602, message: "Invalid user address" };
	}
    const withdraws = await PendingWithdraw.find({
        'agent.signers': { $regex: params.user, $options: "i" },
        ...(submitted !== undefined ? {"submitted": submitted} : {})
    });

    return withdraws;
}