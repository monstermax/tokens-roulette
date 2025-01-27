// App.tsx

import { useEffect, useState } from 'react'

import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import './App.css'

import { networks } from './config';

import type { GameHistory, NetworkName, Token, TokensPair, Wallet } from './types';
import { fetchCurrencyPrice, fetchTrendsPairs, fetchTrendsTokens } from './dexscreener';
import { SlotToken } from './SlotToken';
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
            //.then((tokens) => logAndDelay(tokens, 'delaying fetchTokens')) // DEBUG
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
            //.then((tokensPairs) => logAndDelay(tokensPairs, 'delaying fetchTrendsPairs')) // DEBUG
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
        setIsFetching(true);

        fetchCurrencyPrice(network)
            //.then((price) => logAndDelay(price, 'delaying fetchCurrencyPrice')) // DEBUG
            .then((price => {
                setCurrencyPrice(price);
            }))
            .finally(() => {
                setIsFetching(false);
            });

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
            setIsFetching(true);

            fetchBalance(network, wallet)
                //.then((balance) => logAndDelay(balance, 'delaying fetchBalance')) // DEBUG
                .then((balance: number) => {
                    setBalance(balance);
                })
                .finally(() => {
                    setIsFetching(false);
                })

        } else {
            setBalance(0);
        }
    }, [wallet]);


    return (
        <div className='container mt-5'>
            <a href="./" className='d-flex mb-2 text-decoration-none'>
                <Logo />

                <h1 className='mx-3'>Tokens Roulette</h1>
            </a>

            <div className="">

                {/* wallet */}
                <div className='alert alert-dark text-light'>
                    <div className='d-flex flex-wrap justify-content-between'>
                        <div>

                            {/* Wallet */}
                            <div className='my-1 d-flex'>
                                <h2 className='m-1 me-3 cursor-default'>Wallet</h2>

                                <div className='badge bg-dark mx-1 text-light cursor-default'>
                                    <div className='m-1'>{wallet?.name}</div>
                                    <div className='m-1 badge'>{wallet?.address}</div>
                                </div>

                                <img src={`https://dd.dexscreener.com/ds-data/chains/${network}.png`} className='m-1' alt={networks[network].name} style={{ width: '32px', height: '32px' }} />
                            </div>

                            {/* Balance + Deposit + Withdraw */}
                            <div className='my-1 d-flex flex-wrap'>
                                <h3 className='m-1 me-3 cursor-default'>Balance</h3>

                                {/* Balance */}
                                <div className="badge bg-dark text-light">
                                    <p className='h4 cursor-default'>
                                        <span className='me-1'>{Math.round(100 * balance / 1e9) / 100} {currencyName}</span>

                                        <small className='ms-1'>({new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(currencyPrice * balance / 1e9)})</small>
                                    </p>
                                </div>

                                {/* Deposit + Withdraw */}
                                <div className='m-1'>
                                    <button className='btn btn-outline-secondary m-1 disabled'>Deposit</button>
                                    <button className='btn btn-outline-secondary m-1 disabled'>Withdraw</button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className='my-1'>
                                <h3 className='m-1 cursor-default'>Network</h3>

                                <select className='form-control bg-dark text-light m-1' value={network} onChange={(event) => setNetwork(event.target.value)}>
                                    {Object.keys(networks).map(network => {
                                        return (
                                            <option key={network} value={network}>{networks[network].name}</option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div className='my-1'>
                                <button className={`btn btn-outline-secondary w-100 fw-bold ${gamesHistory.length === 0 ? 'disabled' : ''}`} onClick={() => showEndGameModal()}>
                                    History
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

                {/* tokens list */}
                <div className='alert alert-dark'>
                    <div className='d-flex'>
                        <h2 className='m-1 cursor-default'>Slot Tokens</h2>

                        <button className="btn btn-sm border-0 m-1" onClick={refreshTokensList} disabled={isFetching}>
                            {isFetching ? (
                                <span className="spinner-border spinner-border-sm text-light" role="status" aria-hidden="true"></span>
                            ) : (
                                <RefreshIcon />
                            )}
                        </button>
                    </div>

                    <div className={`d-flex flex-wrap justify-content-around position-relative ${isFetching ? "disabled-overlay" : ""}`}>
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
                        <option value="200"></option>
                        <option value="500"></option>
                        <option value="1000"></option>
                        <option value="5000"></option>
                    </datalist>
                </div>

            </div>

        </div>
    )
}


export function logAndDelay<T>(val: T, text?: string) {
    if (text) {
        console.log(text);
    }
    return new Promise<T>((r) => setTimeout(() => r(val), 3_000));
}



const Logo = () => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="50"
            height="50"
            viewBox="0 0 50 50"
            fill="none"
        >
            <circle cx="25" cy="25" r="22" fill="#1fac9b" />
            <text
                x="25"
                y="30"
                textAnchor="middle"
                fontFamily="Arial, sans-serif"
                fontSize={16}
                fill="#d1111c"
                fontWeight="bold"
            >
                TKR
            </text>
        </svg>
    );
};



const RefreshIcon = () => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#00adb5"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="icon-refresh"
            style={{
                display: "inline-block",
                verticalAlign: "middle",
            }}
        >
            <path d="M23 4v6h-6"></path>
            <path d="M1 20v-6h6"></path>
            <path d="M3.51 9a9 9 0 0115.43-3.36L23 10"></path>
            <path d="M20.49 15a9 9 0 01-15.43 3.36L1 14"></path>
        </svg>
    );
};



export default App
