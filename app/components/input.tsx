"use client";

import React from "react";
import styles from "../styles/layout.module.css";

interface CustomInputProps extends React.ButtonHTMLAttributes<HTMLInputElement> {
    variant?: "primary" | "secondary";
    disabled?: boolean;
}

const CustomInput: React.FC<CustomInputProps> = ({
    children,
    variant = "primary",
    disabled,
    className,
    style,
    ...props
}) => {

    return (
        <input
            style={style}
            className={styles.Input}
            disabled={disabled}
            {...props}
        />
    );
};

export default CustomInput;
