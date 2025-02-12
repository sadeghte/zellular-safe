"use client";

import type { Metadata } from "next";
import Index from "./components/index/Index";

export default function IndexPage() {
    return <Index />
}

export const metadata: Metadata = {
    title: "Custody Service",
};
