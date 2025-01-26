
import type { Token } from "./types"


export type DexscreenerTokensPair = {
    chainId: string
    dexId: string
    url: string
    pairAddress: string
    baseToken: Token
    quoteToken: Token
    priceNative: string
    priceUsd: string
    txns: Txns
    volume: Volume
    priceChange: PriceChange
    liquidity: Liquidity
    fdv: number
    marketCap: number
    pairCreatedAt: number
    info: Info
    boosts: Boosts
}


export type Txns = {
    m5: BuysSells,
    h1: BuysSells,
    h6: BuysSells,
    h24: BuysSells,
}


export type BuysSells = {
    buys: number
    sells: number
}


export interface Volume {
    h24: number
    h6: number
    h1: number
    m5: number
}

export interface PriceChange {
    m5: number
    h1: number
    h6: number
    h24: number
}

export interface Liquidity {
    usd: number
    base: number
    quote: number
}

export type Info = {
    imageUrl: string
    header: string
    openGraph: string
    websites: any[]
    socials: Social[]
}

export type Social = {
    type: string
    url: string
}

export type Boosts = {
    active: number
}

