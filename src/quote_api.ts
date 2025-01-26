
import type { TokensPair, TradeResult } from "./types";


type swapMode = string;
type QuoteGetRequest = any;
type QuoteResponse = any;


const jupiterEndpoint = "https://quote-api.jup.ag/v6";


export function getQuoteRequest(inputMint: string, outputMint: string, amount: number, slippageBps: number=100, swapMode: swapMode="ExactIn"): QuoteGetRequest {
    const quoteRequest: QuoteGetRequest = {
        inputMint,
        outputMint,
        amount,
        slippageBps,
        swapMode,
        //platformFeeBps: "0",
        //dynamicSlippage: { "maxBps": 500 },
    };

    return quoteRequest;
}


export async function getQuoteCurlAlt(inputMint: string, outputMint: string, amount: number, slippageBps: number=100, swapMode: swapMode="ExactIn"): Promise<QuoteResponse | null> {
    const quoteUrl = `${jupiterEndpoint}/quote`;

    const url = `${quoteUrl}?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}&swapMode=${swapMode}`;
    //console.info(`Fetching quote from: ${url}`);

    try {
        const response = await fetch(url);

        const result = await response.json();

        return result as QuoteResponse;

    } catch (err: any) {
        console.error('Error fetching quote:', err.message);
        return null;
    }
}



export async function buy(pair: TokensPair, amount: number): Promise<TradeResult> {
    const quote = await getQuoteCurlAlt(pair.quoteToken.address, pair.baseToken.address, amount);
    
    return {
        inputAmount: quote.inAmount,
        outputAmount: quote.outAmount,
        priceUsd: quote.swapUsdValue,
    } as TradeResult;
}


export async function sell(pair: TokensPair, amount: number): Promise<TradeResult> {
    const quote = await getQuoteCurlAlt(pair.baseToken.address, pair.quoteToken.address, amount);

    return {
        inputAmount: quote.inAmount,
        outputAmount: quote.outAmount,
        priceUsd: quote.swapUsdValue,
    } as TradeResult;
}



