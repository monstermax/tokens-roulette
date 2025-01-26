

export type CoingeckoTerminalTokensPair = {
}


export type CoingeckoTerminalToken = {
    id: string
    type: string
    attributes: {
        address: string
        name: string
        symbol: string
        decimals: number
        image_url: string
        coingecko_coin_id: any
        websites: Array<string>
        description: string
        gt_score: number
        metadata_updated_at: string
        discord_url: any
        telegram_handle: string
        twitter_handle: string
    }
    relationships: {
        network: {
            data: {
                id: string
                type: string
            }
        }
    }
}

