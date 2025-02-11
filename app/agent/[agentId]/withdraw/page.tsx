import WithdrawPage from "@/app/components/WithdrawPage";
import type { Metadata } from "next";

export const dynamic = "force-static";

export default function page() {
    return <WithdrawPage />
}

export const metadata: Metadata = {
    title: "Withdraw",
};
