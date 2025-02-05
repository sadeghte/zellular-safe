'use client';

import React, { useMemo, useState } from "react";
import "./tabs.css"; // Import the CSS file

interface Tab {
    key: string;
    label: string | React.ReactNode;
}

// Define the interface for the Tabs component props
interface TabsProps {
    tabs: Tab[];
    activeTab: string; // Controlled by the parent
    onTabChange: (name: string) => void; // Callback to notify parent,
    children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange, children }) => {

    return (
        <div className="tabs-container">
            {/* Tab Buttons */}
            <div className="tabs-buttons">
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        onClick={() => onTabChange(tab.key)}
                        className={activeTab === tab.key ? "tab-button active" : "tab-button"}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Active Tab Content */}
            <div className="tab-content">
                {children}
            </div>
        </div>
    );
};