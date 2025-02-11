"use client";

import React from "react";
import styles from "../styles/layout.module.css";

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary";
    isLoading?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
    children,
    variant = "primary",
    isLoading = false,
    className,
    ...props
}) => {

    return (
        <button
            className={`button ${variant}`}
            disabled={isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full mr-2"></span>
            ) : null}
            {children}
        </button>
    );
};

export default CustomButton;
