// App.tsx

import { useEffect, useRef, useState } from 'react'

import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import './App.css'

import { networks } from './config';

import type { GameHistory, NetworkName, Token, TokensPair, Wallet } from './types';
import { fetchCurrencyPrice, fetchTrendsPairs, fetchTrendsTokens } from './dexscreener';
import { SlotToken } from './SlotToken.';
import { EndGameModal } from './EndGameModal';
import { fetchRecentTokens } from './coingeckoterminal';
import { Modal } from 'bootstrap';


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


const virtualWallet: Wallet = {
    name: 'Virtual Wallet 01',
    address: `VirtualWallet_${Date.now()}`,
    network: 'solana',
    privateKey: '',
};


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
    const [wallet, setWallet] = useState<Wallet | null>(virtualWallet);
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
        const fetchTokens = (network === 'solana') ? fetchTrendsTokens : fetchRecentTokens;

        fetchTokens(network)
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
                tokensPairs = tokensPairs.filter(pair => pair.stats ? pair.stats.txnsM5 > 50 : true);

                // Sort
                tokensPairs.sort((a, b) => (a.stats && b.stats) ? b.stats.priceChangeM5 - a.stats.priceChangeM5 : 0);

                setPairs(tokensPairs);
            }))
            .finally(() => {
                setIsFetching(false);
            })
    };

    const showEndGameModal = () => {
        const endGameModal = new Modal(document.getElementById('modal-game-end')!, {})
        endGameModal.show()
    }


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
            setWallet(virtualWallet)

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
                <div className='alert alert-dark text-light'>
                    <div className='d-flex flex-wrap justify-content-between'>
                        <div>
                            <div className='my-1 d-flex'>
                                <h2 className='m-1 me-3'>Wallet</h2>

                                <div className='badge bg-dark text-light'>
                                    <div className='m-1'>{wallet?.name}</div>
                                    <div className='m-1 badge'>{wallet?.address}</div>
                                </div>
                            </div>

                            <div className='my-1 d-flex'>
                                <h3 className='m-1 me-3'>Balance</h3>

                                <div className="badge bg-dark text-light">
                                    <p className='h4'>
                                        <span className='me-1'>{Math.round(100 * balance / 1e9) / 100} {currencyName}</span>

                                        <small className='ms-1'>({new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(currencyPrice * balance / 1e9)})</small>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className='my-1'>
                                <h3 className='m-1'>Network</h3>

                                <select className='form-control bg-dark text-light m-1' value={network} onChange={(event) => setNetwork(event.target.value)}>
                                    {Object.keys(networks).map(network => {
                                        return (
                                            <option key={network} value={network}>{networks[network].name}</option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div className='my-1'>
                                <button className='btn btn-outline-secondary w-100' onClick={() => showEndGameModal()}>
                                    History
                                </button>
                            </div>
                        </div>
                    </div>

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
                                    showEndGameModal={showEndGameModal}
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
