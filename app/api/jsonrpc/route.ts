import { NextRequest, NextResponse } from "next/server";
import * as addWithdraw from './methods/withdraw-add'
import * as getWithdraws from './methods/withdraw-get-all'
import * as signWithdraw from './methods/withdraw-sign'
import * as submitWithdraw from './methods/withdraw-submit'
import Ajv from "ajv";
import connectMongoDB from "@/lib/mongoose";

const ajv = new Ajv();

// Define JSON-RPC schema
const jsonRpcSchema = {
	type: "object",
	properties: {
		jsonrpc: { type: "string", const: "2.0" },
		method: { type: "string" },
		id: { type: ["string", "number", "null"] },
		additionalProperties: true,
	},
	required: ["jsonrpc", "method"],
};
const validateJsonRpc = ajv.compile(jsonRpcSchema);

const allModules = {
	"addWithdraw": addWithdraw,
	"signWithdraw": signWithdraw,
	"submitWithdraw": submitWithdraw,
	"getWithdraws": getWithdraws,
};

// compile all methods validators
const methodsValidator: any = {};
for (const [methodName, module] of Object.entries(allModules)) {
	methodsValidator[methodName] = ajv.compile(module.schema);
}

// API handler
export async function POST(request: NextRequest) {
	try {
		const body: { method: string, params: any, id?: string | number } = await request.json();
        // console.log("jsonrpc request", body)

		// Validate JSON-RPC request
		if (!validateJsonRpc(body)) {
			return NextResponse.json(
				{
					jsonrpc: "2.0",
					error: { code: -32600, message: "Invalid Request" },
					id: null,
				}
			);
		}

		const { method, params, id } = body;

		// Check if the method exists
		//@ts-ignore
		if (!allModules[method]) {
			return NextResponse.json(
				{
					jsonrpc: "2.0",
					error: { code: -32601, message: "Method not found" },
					id,
				},
			);
		}

		// Validate method params
		const validateParams = methodsValidator[method];
		if (validateParams && !validateParams(params)) {
			return NextResponse.json(
				{
					jsonrpc: "2.0",
					error: { code: -32602, message: "Invalid params", details: validateParams.errors },
					id,
				}
			);
		}

		// Execute the method
		try {
            await connectMongoDB()
			//@ts-ignore
			const result = await allModules[method].handler(params);
			return NextResponse.json(
				{ jsonrpc: "2.0", result, id }
			);
		} catch (err) {
            console.log("error on jsonrpc handler", err)
			return NextResponse.json(
				{
					jsonrpc: "2.0",
					error: err,
					id,
				}
			);
		}
	} catch (err: any) {
		return NextResponse.json(
			{
				jsonrpc: "2.0",
				error: { code: -32700, message: err.message },
				id: null,
			}
		);
	}
}
