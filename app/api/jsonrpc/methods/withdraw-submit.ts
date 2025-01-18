import { PendingWithdraw } from "@/models/pending-withdraw";
import { ethers } from 'ethers';

export const schema = {
	type: "object",
	properties: {
		_id: { type: "string" },
	},
	required: ["_id"],
}

export const handler = async (params: any) => {
    const {_id} = params
	const withdraw = await PendingWithdraw.findOne({_id})
    if(!withdraw)
        throw `PendingWithdraw not found`

    if (Object.keys(withdraw.signatures).length < withdraw.agent.threshold)
      throw 'Withdraw not signed with enough signers'

    withdraw["submitted"] = true
    await withdraw.save()

	return true;
}