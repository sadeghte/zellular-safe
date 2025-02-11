import React from "react"

interface ComponentProps {
    chain: string,
    token: string
}

export const ChainToken: React.FC<ComponentProps> = ({ chain, token }) => {
    return (
        <>
            <img className="token-icon" src={`/asset-icon/${token.toLowerCase()}.svg`} />
            <img className="token-icon chain-ind" src={`/asset-icon/${chain.toLowerCase()}.svg`} />
            <span style={{ paddingLeft: '1rem' }}>{token}</span>
        </>
    )
}