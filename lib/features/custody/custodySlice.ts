import { createAppSlice } from "@/lib/createAppSlice";
import type { PayloadAction } from "@reduxjs/toolkit";
import * as CustodyApi from "./custodyApi";
import * as backendApi from "@/lib/backend"

export interface Agent {
    id: string;
    signers: string[];
    threshold: number;
}

export interface AgentData {
    depositAddresses: DepositAddressDoc[];
    deposits: any[];
    withdraws: any[];
    status: "idle" | "loading" | "failed";
}

export interface DepositAddressDoc {
    agent: string;
    account: number;
    user: number;
    chain: string;
    address: string;
    memo?: string;
    active: boolean;
}

export interface AvailableTokenInfo {
    symbol: string;
    name: string;
    decimals: number;
    contract?: string;
}

export interface CustodySliceState {
    user: string|null;
    // user agents list
    agents: Record<string, Agent>;
    // user agens data
    agentsData: Record<string, AgentData>;
    // withdraws that is not signed completely or not sent to the zellular network
    pendingWithdraws: any[];
    // list of all available tokens
    availableTokens: Record<string, AvailableTokenInfo[]>;
    // async request status
    status: "idle" | "loading" | "failed";
}

const initialState: CustodySliceState = {
    user: null,
    agents: {},
    agentsData: {},
    
    pendingWithdraws: [],
    availableTokens: {},
    status: "idle",
};

// If you are not using async thunks you can use the standalone `createSlice`.
export const custodySlice = createAppSlice({
    name: "custody",
    initialState,
    reducers: (create) => ({
        setUser: create.reducer((state, action: PayloadAction<string>) => {
            state.user = action.payload;
        }),
        setAgents: create.reducer((state, action: PayloadAction<Agent[]>) => {
            state.agents = action.payload.reduce((obj: any, a) => (obj[a.id] = a, obj), {});
        }),
        setAgentData: create.reducer((state, action: PayloadAction<{agent: string, agentData: AgentData}>) => {
            let {agent, agentData} = action.payload;
            state.agentsData = {
                ...state.agentsData,
                [agent]: agentData,
            };
        }),
        fetchAgents: create.asyncThunk(
            async (user: string) => {
                const response = await CustodyApi.getUserAgents(user);
                // The value we return becomes the `fulfilled` action payload
                return response.reduce((obj: any, a) => (obj[a.id] = a, obj), {});
            },
            {
                pending: (state) => {
                    state.status = "loading";
                },
                fulfilled: (state, action) => {
                    state.status = "idle";
                    state.agents = action.payload;
                },
                rejected: (state) => {
                    state.status = "failed";
                },
            },
        ),
        fetchAgentData: create.asyncThunk(
            async (agent: string) => {
                const response = await CustodyApi.getAgentData(agent);
                return {agent, agentData: response};
            },
            {
                pending: (state) => {
                    state.status = "loading";
                },
                fulfilled: (state, action) => {
                    state.status = "idle";
                    state.agentsData = {
                        ...state.agentsData,
                        [action.payload.agent]: action.payload.agentData
                    }
                },
                rejected: (state) => {
                    state.status = "failed";
                },
            },
        ),
        fetchPendingWithdraws: create.asyncThunk(
            async (user: string) => {
                const response = await backendApi.getPendingWithdraws(user);
                return response;
            },
            {
                pending: (state) => {
                    state.status = "loading";
                },
                fulfilled: (state, action) => {
                    state.status = "idle";
                    state.pendingWithdraws = action.payload;
                },
                rejected: (state) => {
                    state.status = "failed";
                },
            },
        ),
        fetchAvailableTokens: create.asyncThunk(
            async () => {
                const response = await CustodyApi.getAvailableTokens();
                return response;
            },
            {
                pending: (state) => {
                    state.status = "loading";
                },
                fulfilled: (state, action) => {
                    state.status = "idle";
                    state.availableTokens = action.payload;
                },
                rejected: (state) => {
                    state.status = "failed";
                },
            },
        ),
    }),
    selectors: {
        selectUser: (custody) => custody.user,
        selectAgents: (custody) => custody.agents,
        selectAgentsData: (custody) => custody.agentsData,
        selectPendingWithdraws: (custody) => custody.pendingWithdraws,
        selectAvailableTokens: (custody) => custody.availableTokens,
    },
});

// Action creators are generated for each case reducer function.
export const { 
    setUser, 
    setAgents, 
    setAgentData,
    fetchAgents, 
    fetchAgentData,
    fetchPendingWithdraws, 
    fetchAvailableTokens,
} = custodySlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { 
    selectUser, 
    selectAgents, 
    selectAgentsData,
    selectPendingWithdraws, 
    selectAvailableTokens,
} = custodySlice.selectors;
