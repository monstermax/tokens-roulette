
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


export type SlotStatus = 'idle' | 'starting' | 'running' | 'stopping';


export type TradeResult = {
    "inputAmount": number,
    "outputAmount": number,
    "priceUsd": number,
};


export type CurrentGame = {
    buyDate: Date | null,
    buyPrice: number | null,
    buyInputAmount: number | null,
    buyOutputAmount: number | null,
    sellDate: Date | null,
    sellPrice: number | null,
    sellOutputAmount: number | null,
};


export type GameHistory = {
    tokenName: string,
    pairAddress: string,
    buyDate: Date,
    buyAmountIn: number,
    buyAmountOut: number,
    sellDate: Date,
    sellAmountOut: number,
    diffCoin: number,
    diffUsd: number,
    percent: number,
}

