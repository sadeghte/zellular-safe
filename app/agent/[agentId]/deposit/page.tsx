"use client";

import DepositPage from "@/app/components/DepositPage";
import type { Metadata } from "next";

export default function page() {
    return <DepositPage />
}

export const metadata: Metadata = {
    title: "Deposit",
};
