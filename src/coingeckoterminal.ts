
import type { NetworkName, Token } from "./types";
import type { CoingeckoTerminalToken } from "./coingeckoterminal.types";



export const networksMapping: {[network: NetworkName]: string} = {
    ethereum: 'eth',
    avalanche: 'avax',
    cronos: 'cro',
    fantom: 'ftm',
    sui: 'sui-network',
}



export async function fetchRecentTokens(network: NetworkName): Promise<Token[]> {
    const url = `https://api.geckoterminal.com/api/v2/tokens/info_recently_updated?network=${network}`;

    // ex: https://api.geckoterminal.com/api/v2/tokens/info_recently_updated?network=bsc

    if (! network) return [];

    return fetch(url)
        .then((response) => response.json())
        .then((results: { data: CoingeckoTerminalToken[] }) => {
            return results.data
                .filter((result) => result.relationships.network.data.id === network)
                .map((result) => {
                    return {
                        address: result.attributes.address,
                        name: result.attributes.name,
                        capital: undefined,
                    } as Token;
                });
        })
        .catch((err: any) => {
            console.warn(`fetchRecentTokens error. ${err.message}`);
            return [];
        })
}