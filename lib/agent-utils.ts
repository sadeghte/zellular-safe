import { cloneObject } from "./utils"


export function calculateAgentBalance(deposits: any[]=[], withdraws: any[]=[]) {
    let result: any = {}
    for (let d of deposits) {
        let key = `${d.chain}-${d.deposit.token}`
        if (!result[key]) {
            result[key] = {
                chain: d.chain,
                ...cloneObject(d.deposit)
            }
            result[key].amount = parseInt(d.deposit.amount)
        }
        else {
            result[key].amount += parseInt(d.deposit.amount)
        }
    }
    for (let w of withdraws) {
        let key = `${w.targetChain}-${w.token.symbol}`
        const amount = parseInt(w.amount)
        if (!result[key]) {
            result[key] = {
                chain: w.targetChain,
                amount: -amount,
                decimals: w.token.decimals,
                token: w.token.symbol
            }
        }
        else {
            result[key].amount -= amount
        }
    }

    return result
}