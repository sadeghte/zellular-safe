"use client";

import WithdrawPage from "@/app/components/WithdrawPage";
import type { Metadata } from "next";

export default function page() {
    return <WithdrawPage />
}

export const metadata: Metadata = {
    title: "Withdraw",
};
