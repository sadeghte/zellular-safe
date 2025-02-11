import React from "react";
import "./table.css";

interface NodeProps {
    style?: React.CSSProperties;
    children?: React.ReactNode;
}

export const Table: React.FC<NodeProps> = ({ children, style }) => {
    return <div className="pan1" style={{ padding: 0, ...style }}>
        <table className="custom-table">{children}</table>
    </div>;
}

export const THead: React.FC<NodeProps> = ({ children, style }) => {
    return <thead>{children}</thead>
}

export const TBody: React.FC<NodeProps> = ({ children, style }) => {
    return <tbody>{children}</tbody>
}

export const Tr: React.FC<NodeProps> = ({ children, style, ...props }) => {
    return <tr className="custom-tr" style={style} {...props}>{children}</tr>;
}

export const Th: React.FC<NodeProps> = ({ children, style }) => {
    return <th className="custom-th" style={style}>
        <div style={{display: 'flex', alignItems: 'center'}}>{children}</div>
    </th>;
}

export const Td: React.FC<NodeProps> = ({ children, style }) => {
    return <td className="custom-td" style={style}>
        <div style={{display: 'flex', alignItems: 'center'}}>{children}</div>
    </td>;
}
