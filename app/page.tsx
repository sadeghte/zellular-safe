import type { Metadata } from "next";
import Index from "./components/index/Index";

export const dynamic = "force-static";

export default function IndexPage() {
    return <Index />
}

export const metadata: Metadata = {
    title: "Custody Service",
};
