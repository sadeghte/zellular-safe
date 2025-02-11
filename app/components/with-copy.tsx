import React from "react"

interface ComponentProps {
    value: string,
    children: React.ReactNode;
}

export const WithCopy: React.FC<ComponentProps> = ({ value, children }) => {
    const copyToClipboard = async () => {
        try {
            const permissionStatus = await navigator.permissions.query({ name: "clipboard-write" });
            if (permissionStatus.state === "granted") {
                await navigator.clipboard.writeText(value);
                alert("Text copied.")
            }
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };
    return <div style={{display: "inline-block"}}>
        {children}
        <span style={{cursor: 'pointer'}} onClick={copyToClipboard}> ⧉</span>
    </div>
}