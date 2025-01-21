import { PendingWithdraw } from "@/models/pending-withdraw";
import { ethers } from 'ethers';

export const schema = {
	type: "object",
	properties: {
		_id: { type: "string" },
		signature: { type: "string" },
	},
	required: ["_id", "signature"],
}

export const handler = async (params: any) => {
    const {_id, signature} = params
	const withdraw = await PendingWithdraw.findOne({_id})
    if(!withdraw)
        throw `PendingWithdraw not found`

    // Verify the signature
    const recoveredAddress = ethers.verifyMessage(withdraw.approvalMessage, signature).toLowerCase();
    console.log({withdraw, recoveredAddress})

    if (withdraw.agent.signers.findIndex((s: string) => s.toLowerCase() == recoveredAddress) < 0)
      throw 'Signature verification failed'

    if(!withdraw.signatures){
        withdraw.signatures = {[recoveredAddress]:signature}
    }else{
        withdraw.signatures.set(recoveredAddress, signature)
    }


    await withdraw.save()


	return true;
}