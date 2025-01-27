
import type { TokensPair, TradeResult } from "./types";


// Note: requires a server implementation to programatic transactions... or use unsafe private keys on client side...


export async function buy(pair: TokensPair, amount: number): Promise<TradeResult> {
    //const apiUrl = "http://localhost:3000/buy";
    const apiUrl = "/buy-mock.json";

    const params = {
        inputToken: pair.quoteToken.address,
        outputToken: pair.baseToken.address,
        amount,
    };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    });

    const result = await response.json();

    return result.data as TradeResult;
}


export async function sell(pair: TokensPair, amount?: number | null): Promise<TradeResult> {
    //const apiUrl = "http://localhost:3000/sell";
    const apiUrl = "/sell-mock.json";

    const params = {
        inputToken: pair.baseToken.address,
        outputToken: pair.quoteToken.address,
        amount,
    };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    });

    const result = await response.json();

    return result.data as TradeResult;
}



