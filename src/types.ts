
import { networks } from "./config";


export type Token = {
    address: string,
    name: string,
    capital?: number,
}

export type TokensPair = {
    pairAddress: string,
    baseToken: Token,
    quoteToken: Token,
    stats?: {
        txnsM5: number,
        volumeM5: number,
        priceChangeM5: number,
    },
}

export type Wallet = {
    network: string,
    privateKey: string,
    address: string,
}

export type Network = {
    slug: string,
    name: string,
    symbol: string,
    wrapAddress: string,
}

export type NetworkName = keyof typeof networks;
