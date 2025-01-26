import React, { useEffect, useRef, useState } from 'react'

import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import './App.css'

import { networks } from './config';

import type { GameHistory, NetworkName, Token, TokensPair, Wallet } from './types';
import { fetchCurrencyPrice, fetchTrendsPairs, fetchTrendsTokens } from './dexscreener';
import { SlotToken } from './SlotToken.';
import { EndGameModal } from './EndGameModal';
import { fetchRecentTokens } from './coingeckoterminal';


const examplePairs: TokensPair[] = [
    {
        pairAddress: 'HKuJrP5tYQLbEUdjKwjgnHs2957QKjR2iWhJKTtMa1xs',
        baseToken: { name: 'TRUMP', address: '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN' },
        quoteToken: { name: 'SOL', address: 'So11111111111111111111111111111111111111112' },
    },
    {
        pairAddress: 'Bzc9NZfMqkXR6fz1DBph7BDf9BroyEf6pnzESP7v5iiw',
        baseToken: { name: 'FARTCOIN', address: '9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump' },
        quoteToken: { name: 'SOL', address: 'So11111111111111111111111111111111111111112' },
    },
];


async function fetchBalance(network: NetworkName, wallet: Wallet): Promise<number> {
    // TODO
    return 10 * 1e9; // hardcoded balance
}



function App() {
    const [network, setNetwork] = useState<NetworkName>('solana');
    const [currencyName, setCurrencyName] = useState<string>('SOL');
    const [currencyPrice, setCurrencyPrice] = useState<number>(0);
    const [tokensList, setTokensList] = useState<Token[]>([]);
    const [pairs, setPairs] = useState<TokensPair[]>(examplePairs);
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [balance, setBalance] = useState(0);
    const [isFetching, setIsFetching] = useState(false);
    const [gamesHistory, setGamesHistory] = useState<GameHistory[]>([]);


    const saveGame = (newGameHistory: GameHistory) => {
        setGamesHistory((gamesHistory => {
            return [...gamesHistory, newGameHistory];
        }))
    }

    const refreshTokensList = () => {
        setIsFetching(true);

        // fetch trends tokens
        //fetchTrendsTokens(network)
        fetchRecentTokens(network)
            .then((tokens => {
                //tokens = tokens.filter(token => ! token.capital || token.capital > 1000);
                setTokensList(tokens);
            }))
            .finally(() => {
                setIsFetching(false);
            })
    };

    const refreshPairsList = (tokensAddresses: string[]) => {
        setIsFetching(true);

        fetchTrendsPairs(network, tokensAddresses)
            .then((tokensPairs => {

                // Filter
                //tokensPairs = tokensPairs.filter(pair => pair.stats ? pair.stats.txnsM5 > 100 : true);

                // Sort
                tokensPairs.sort((a, b) => (a.stats && b.stats) ? b.stats.priceChangeM5 - a.stats.priceChangeM5 : 0);

                setPairs(tokensPairs);
            }))
            .finally(() => {
                setIsFetching(false);
            })
    };


    useEffect(() => {
        // network changed

        // fetch trends tokens
        refreshTokensList();

        // fetch network currency price
        fetchCurrencyPrice(network)
            .then((price => {
                setCurrencyPrice(price);
            }));

        // set currency name
        setCurrencyName(networks[network].symbol)

        // TODO: fetch & setPairs

        // TODO: fetch & setWallets

        // TODO: fetch & setWallet
        if (network) {
            setWallet({network, address: 'test', privateKey: 'test'})

        } else {
            setWallet(null);
        }
    }, [network]);

    useEffect(() => {
        // tokensList changed

        // fetch trends pairs
        const tokensAddresses = tokensList.map(token => token.address);
        refreshPairsList(tokensAddresses);

    }, [tokensList]);


    useEffect(() => {
        // wallet changed

        if (wallet) {
            // Fetch balance
            fetchBalance(network, wallet)
                .then((balance: number) => {
                    setBalance(balance);
                })

        } else {
            setBalance(0);
        }
    }, [wallet]);


    return (
        <div className='container mt-5'>
            <h1>Tokens Roulette</h1>

            <div className="">

                {/* wallet */}
                <div className='alert alert-dark'>
                    <h2>Wallet</h2>

                    <div>
                        <h3>Balance</h3>
                        <p>
                            <span className='me-1'>{Math.round(100 * balance / 1e9) / 100} {currencyName}</span>
                            <small className='ms-1'>({new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(currencyPrice * balance / 1e9)})</small>
                        </p>
                    </div>

                    <h2>Network</h2>
                    <select value={network} onChange={(event) => setNetwork(event.target.value)}>
                        {Object.keys(networks).map(network => {
                            return (
                                <option key={network} value={network}>{network}</option>
                            );
                        })}
                    </select>
                </div>

                {/* tokens list */}
                <div className='alert alert-dark'>
                    <div className='d-flex'>
                        <h2>Slot Tokens</h2>

                        <button className='btn btn-sm' onClick={() => refreshTokensList()}>
                            <img src="/refresh.png" alt="Refresh tokens list" />
                        </button>

                        {isFetching && "..."}
                    </div>

                    <div className='d-flex flex-wrap'>
                        {pairs.map(pair => {
                            return (
                                <SlotToken
                                    key={`${pair.pairAddress}`}
                                    network={network}
                                    currencyPrice={currencyPrice}
                                    pair={pair}
                                    balance={balance}
                                    setBalance={setBalance}
                                    saveGame={saveGame}
                                    />
                            );
                        })}
                    </div>

                    {/* Modal */}
                    <EndGameModal gamesHistory={gamesHistory} network={network} />

                    {/* Bet suggested values */}
                    <datalist id="betsValues">
                        <option value="10"></option>
                        <option value="50"></option>
                        <option value="100"></option>
                        <option value="500"></option>
                        <option value="1000"></option>
                    </datalist>
                </div>

            </div>

        </div>
    )
}


export default App
