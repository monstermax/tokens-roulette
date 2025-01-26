
import { networks } from "./config";

import type { NetworkName, Token, TokensPair } from "./types";
import type { DexscreenerTokensPair } from "./dexscreener.types";



export const networksMapping: {[network: NetworkName]: string} = {
    //ethereum: 'eth',
}



export async function fetchCurrencyPrice(network: NetworkName) {
    const tokenAddress = networks[network].wrapAddress;
    const url = `https://api.dexscreener.com/tokens/v1/${network}/${tokenAddress}`;

    // ex: https://api.dexscreener.com/tokens/v1/solana/So11111111111111111111111111111111111111112

    if (! network) return 0;

    return fetch(url)
        .then((response) => response.json())
        .then((results) => {
            return results
                .filter((result: DexscreenerTokensPair) => result.chainId === network)
                .map((result: DexscreenerTokensPair) => {
                    return Number(result.priceUsd);
                })
                .at(0);
        })
        .catch((err: any) => {
            console.warn(`fetchCurrencyPrice error. ${err.message}`);
            return 0;
        })
}


export async function fetchTrendsPairs(network: NetworkName, tokensAddresses: string[]): Promise<TokensPair[]> {
    const url = `https://api.dexscreener.com/tokens/v1/${network}/${tokensAddresses.slice(0, 30).join(',')}`; // 30 tokens max.

    // ex: https://api.dexscreener.com/tokens/v1/solana/4L13wwBBibKJfJXwmBXiUaRv44MPAKVhikSwJhW6pump

    if (! network) return [];
    if (tokensAddresses.length === 0) return [];

    return fetch(url)
        .then((response) => response.json())
        .then((results) => {
            return results
                .filter((result: DexscreenerTokensPair) => result.chainId === network)
                .map((result: DexscreenerTokensPair) => {
                    return {
                        pairAddress: result.pairAddress,
                        baseToken: { name: result.baseToken.name, address: result.baseToken.address },
                        quoteToken: { name: result.baseToken.name, address: result.quoteToken.address },
                        stats: {
                            txnsM5: result.txns.m5.buys + result.txns.m5.sells,
                            volumeM5: result.volume.m5,
                            priceChangeM5: result.priceChange.m5,
                        },
                    } as TokensPair;
                });
        })
        .catch((err: any) => {
            console.warn(`fetchTrendsPairs error. ${err.message}`);
            return [];
        })
}


export async function fetchTrendsTokens(network: NetworkName): Promise<Token[]> {
    const url = 'https://api.dexscreener.com/token-boosts/top/v1';

    if (! network) return [];

    return fetch(url)
        .then((response) => response.json())
        .then((results) => {
            return results.filter((result: any) => result.chainId === network)
                .map((result: any) => {
                    return {
                        address: result.tokenAddress,
                        name: result.description,
                        capital: result.totalAmount,
                    } as Token;
                });
        })
        .catch((err: any) => {
            console.warn(`fetchTrendsTokens error. ${err.message}`);
            return [];
        })
}

