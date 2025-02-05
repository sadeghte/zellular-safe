import { createAppSlice } from "@/lib/createAppSlice";
import type { PayloadAction } from "@reduxjs/toolkit";
import * as CustodyApi from "./custodyApi";
import * as backendApi from "@/lib/backend"

export interface Agent {
    id: string;
    signers: string[];
    threshold: number;
}

export interface DepositAddressDoc {
    agent: string;
    account: number;
    user: number;
    chain: string;
    address: string;
    memo?: string,
    active: boolean;
}

export interface CustodySliceState {
    user: string|null;
    // user agents list
    agents: Agent[];
    // map user index to its address
    depositAddresses: DepositAddressDoc[];
    // agent deposit history
    deposits: any[];
    // withdraws that is not signed completely or not sent to the zellular network
    pendingWithdraws: any[],
    // agent withdraw history
    withdraws: any[];
    // async request status
    status: "idle" | "loading" | "failed";
}

const initialState: CustodySliceState = {
    user: null,
    agents: [],
    depositAddresses: [],
    deposits: [],
    pendingWithdraws: [],
    withdraws: [],
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
            state.agents = action.payload;
        }),
        setDepositAddresses: create.reducer((state, action: PayloadAction<DepositAddressDoc[]>) => {
            state.depositAddresses = action.payload;
        }),
        fetchAgents: create.asyncThunk(
            async (user: string) => {
                const response = await CustodyApi.getUserAgents(user);
                // The value we return becomes the `fulfilled` action payload
                return response;
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
        fetchDepositAddresses: create.asyncThunk(
            async (args: {agent: string}) => {
                const response:DepositAddressDoc[] = await CustodyApi.getDepositAddresses(args.agent);
                return response;
            },
            {
                pending: (state) => {
                    state.status = "loading";
                },
                fulfilled: (state, action) => {
                    state.status = "idle";
                    state.depositAddresses = action.payload;
                },
                rejected: (state) => {
                    state.status = "failed";
                },
            },
        ),
        fetchDeposits: create.asyncThunk(
            async (params: {agent: string, account?: number, user?: number}) => {
                const response = await CustodyApi.getDeposits(params.agent, params.account, params.user);
                return response;
            },
            {
                pending: (state) => {
                    state.status = "loading";
                },
                fulfilled: (state, action) => {
                    state.status = "idle";
                    state.deposits = action.payload;
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
        fetchWithdraws: create.asyncThunk(
            async (params: {agent: string, account?: number, user?: number}) => {
                const response = await CustodyApi.getWithdraws(params.agent, params.account, params.user);
                return response;
            },
            {
                pending: (state) => {
                    state.status = "loading";
                },
                fulfilled: (state, action) => {
                    state.status = "idle";
                    state.withdraws = action.payload;
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
        selectDepositAddresses: (custody) => custody.depositAddresses,
        selectDeposits: (custody) => custody.deposits,
        selectPendingWithdraws: (custody) => custody.pendingWithdraws,
        selectWithdraws: (custody) => custody.withdraws,
    },
});

// Action creators are generated for each case reducer function.
export const { setUser, setAgents, fetchAgents, fetchDepositAddresses, fetchDeposits, fetchPendingWithdraws, fetchWithdraws } = custodySlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { selectUser, selectAgents, selectDepositAddresses, selectDeposits, selectPendingWithdraws, selectWithdraws } = custodySlice.selectors;
