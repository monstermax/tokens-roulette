import React, { useEffect, useRef, useState } from 'react'

import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import './App.css'

import { networks } from './config';

//import { buy, sell } from './swap_api';
import { buy, sell } from './quote_api';

import type { CurrentGame, NetworkName, SlotStatus, Token, TokensPair, Wallet } from './types';
import type { DexscreenerTokensPair } from './dexscreener.types';


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


async function fetchCurrencyPrice(network: NetworkName) {
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
            console.warn(`fetchTrends error. ${err.message}`);
            return 0;
        })
}


async function fetchTrendsPairs(network: NetworkName, tokensAddresses: string[]): Promise<TokensPair[]> {
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
            console.warn(`fetchTrends error. ${err.message}`);
            return [];
        })
}


async function fetchTrendsTokens(network: NetworkName): Promise<Token[]> {
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
            console.warn(`fetchTrends error. ${err.message}`);
            return [];
        })
}

async function fetchBalance(network: NetworkName, wallet: Wallet): Promise<number> {
    // TODO
    return 10 * 1e9;
}



function App() {
    const [network, setNetwork] = useState<NetworkName>('solana');
    const [currencyName, setCurrencyName] = useState<string>('SOL');
    const [currencyPrice, setCurrencyPrice] = useState<number>(0);
    const [tokensList, setTokensList] = useState<Token[]>([]);
    const [pairs, setPairs] = useState<TokensPair[]>(examplePairs);
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [balance, setBalance] = useState(0);


    useEffect(() => {
        // network changed

        // fetch trends tokens
        fetchTrendsTokens(network)
            .then((tokens => {
                //tokens = tokens.filter(token => ! token.capital || token.capital > 1000);
                setTokensList(tokens);
            }));

        // fetch network currency price
        fetchCurrencyPrice(network)
            .then((price => {
                console.log('response price:', price)
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
    }, [network])

    useEffect(() => {
        // tokensList changed

        // fetch trends pairs
        const tokensAddresses = tokensList.map(token => token.address);

        fetchTrendsPairs(network, tokensAddresses)
            .then((tokensPairs => {

                // Filter
                tokensPairs = tokensPairs.filter(pair => pair.stats ? pair.stats.txnsM5 > 100 : true);

                // Sort
                tokensPairs.sort((a, b) => (a.stats && b.stats) ? b.stats.priceChangeM5 - a.stats.priceChangeM5 : 0);

                setPairs(tokensPairs);
            }));

    }, [tokensList])


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
    }, [wallet])


    return (
        <div className='container mt-5'>
            <h1>Tokens Roulette</h1>

            <div className="">

                {/* intro */}
                <div className='alert alert-dark'>
                    <h2>Wallet</h2>

                    <div>
                        <h3>Balance</h3>
                        <p>
                            <span className='me-1'>{Math.round(100 * balance / 1e9) / 100} {currencyName}</span>
                            <small className='ms-1'>({new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(currencyPrice * balance / 1e9)})</small>
                        </p>
                    </div>
                </div>

                {/* tokens list */}
                <div className='alert alert-dark'>
                    <h2>Slot Tokens</h2>

                    <div className='d-flex flex-wrap'>
                        {pairs.map(pair => {
                            return (
                                <SlotToken
                                    key={`${pair.baseToken.address}-${pair.quoteToken.address}`}
                                    network={network}
                                    currencyPrice={currencyPrice}
                                    pair={pair}
                                    balance={balance}
                                    setBalance={setBalance}
                                    />
                            );
                        })}
                    </div>
                </div>

            </div>

        </div>
    )
}




const SlotToken = (props: {network: string, currencyPrice: number, pair: TokensPair, balance: number, setBalance:  React.Dispatch<React.SetStateAction<number>>}) => {
    const pair = props.pair;
    const network = props.network;
    const currencyPrice = props.currencyPrice;
    const balance = props.balance;
    const setBalance = props.setBalance;

    const wheelRef = useRef<{ startSpin: () => void, stopSpin: () => void } | null>(null);
    const timerRemainingRef = useRef<number | null>(null);

    const [remainingTime, setRemainingTime] = useState(10);
    const [amountUsd, setAmountUsd] = useState(0);
    const [slotStatus, setSlotStatus] = useState<SlotStatus>('idle');
    const [currentGame, setCurrentGame] = useState<CurrentGame>({ buyPrice: null, sellPrice: null, buyInputAmount: null, buyOutputAmount: null, sellOutputAmount: null });


    const startGame = async (duration=30) => {
        setSlotStatus('starting');
        setCurrentGame({ buyPrice: null, sellPrice: null, buyInputAmount: null, buyOutputAmount: null, sellOutputAmount: null });

        const inputAmountCoin = Math.round(1e9 * amountUsd / currencyPrice);

        buy(pair, inputAmountCoin)
            .then((tradeResult) => {
                const buyPrice = Number(tradeResult.priceUsd);
                const buyInputAmount = Number(tradeResult.inputAmount);
                const buyOutputAmount = Number(tradeResult.outputAmount);

                setCurrentGame((game) => ({ ...game, buyPrice, buyInputAmount, buyOutputAmount }));

                setSlotStatus('running');

                setBalance((balance) => balance -= buyInputAmount);
                setRemainingTime(duration);

                if (wheelRef.current) {
                    wheelRef.current?.startSpin();
                }

                timerRemainingRef.current = setInterval(() => {
                    setRemainingTime((value) => Math.max(0, value - 1));
                }, 1000);
            })
    }


    const stopGame = async () => {
        if (timerRemainingRef.current) {
            clearInterval(timerRemainingRef.current);
        }

        setSlotStatus('stopping');

        const inputAmountCoin = currentGame.buyOutputAmount;

        if (inputAmountCoin) {
            sell(pair, inputAmountCoin)
                .then((tradeResult) => {
                    const sellPrice = Number(tradeResult.priceUsd);
                    const sellOutputAmount = Number(tradeResult.outputAmount);

                    setCurrentGame((game) => ({ ...game, sellPrice, sellOutputAmount }));

                    setBalance((balance) => balance += sellOutputAmount);

                    if (wheelRef.current) {
                        wheelRef.current?.stopSpin();
                    }

                    setSlotStatus('idle');
                });
        }
    }


    useEffect(() => {
        // remainingTime changed

        if (slotStatus === 'running' && remainingTime <= 0) {
            stopGame();
        }

    }, [remainingTime]);


    useEffect(() => {
        // currentGame changed

        if (currentGame.buyPrice && currentGame.sellPrice && currentGame.sellOutputAmount && currentGame.buyInputAmount) {
            //const diff = currentGame.sellPrice - currentGame.buyPrice;
            //const percent = 100 * diff / currentGame.buyPrice;

            const diffCoin = currentGame.sellOutputAmount - currentGame.buyInputAmount;
            const percent = 100 * diffCoin / currentGame.buyInputAmount;
            const diffFullCoin = diffCoin / 1e9;
            const diffUsd = diffFullCoin * currencyPrice;

            console.log('currentGame:', currentGame)
            console.log('buyPrice: ', currentGame.buyPrice);
            console.log('sellPrice: ', currentGame.sellPrice);
            console.log('diffCoin: ', Math.round(100 * diffFullCoin) / 100, networks[network].symbol);
            console.log('diffUsd: ', Math.round(100 * diffUsd) / 100, '$');
            console.log('percent: ', Math.round(10 * percent) / 10, '%');

            // TODO: show popup gain
        }

    }, [currentGame]);


    return (
        <div className='card mx-1 my-3' style={{ width: '300px' }}>
            <div className='d-flex my-1'>
                <img src={`https://dd.dexscreener.com/ds-data/tokens/${network}/${pair.baseToken.address.toLowerCase()}.png`} alt={`${pair.baseToken.name}`} className='mx-1' />

                <h3 className='m-1 text-truncate'>
                    <a href={`https://dexscreener.com/${network}/${pair.pairAddress}`} target='_blank'>
                        {pair.baseToken.name}
                    </a>
                </h3>
            </div>

            <div className='my-1 text-center'>
                <div className='wheel'>
                    <WheelOfFortune ref={wheelRef} />
                </div>

                <div className='m-1 mx-2'>
                    <div className="input-group">
                        <span className="input-group-text">$</span>
                        <input type="number" className="form-control" aria-label="Dollar amount (with dot and two decimal places)" min={0} step={1} value={amountUsd} onChange={(event) => setAmountUsd(Number(event.target.value))} />

                        {['running', 'stopping'].includes(slotStatus) && 
                            <button
                                onClick={() => stopGame()}
                                className={`btn btn-outline-success ${(slotStatus === 'running') ? "" : "disabled"}`}
                                >
                                Stop ({remainingTime} sec.)
                            </button>
                        }

                        {['idle', 'starting'].includes(slotStatus) && 
                            <button
                            onClick={() => startGame()}
                                className={`btn btn-outline-success ${(slotStatus === 'idle' && amountUsd >= 1 && amountUsd < balance * currencyPrice) ? "" : "disabled"}`}
                                >
                                Launch
                            </button>
                        }

                    </div>
                </div>
            </div>

            <BearishBar priceChangeM5={pair.stats?.priceChangeM5} />
        </div>
    );
}


const BearishBar = (props: { priceChangeM5?: number }) => {
    let bearishPercent: number = 50;

    if (props.priceChangeM5) {
        if (props.priceChangeM5 < 0) {
            if (props.priceChangeM5 < -10) {
                bearishPercent = 5;

            } else if (props.priceChangeM5 < -5) {
                bearishPercent = 30;

            } else if (props.priceChangeM5 < -2) {
                bearishPercent = 40;

            } else {
                bearishPercent = 45;
            }

        } else if (props.priceChangeM5 > 0) {
            if (props.priceChangeM5 > 10) {
                bearishPercent = 95;

            } else if (props.priceChangeM5 > 5) {
                bearishPercent = 70;

            } else if (props.priceChangeM5 > 2) {
                bearishPercent = 60;

            } else {
                bearishPercent = 55;
            }

        }
    }

    return (
        <div className='d-flex' style={{ height: "10px" }} title={`Bearish indicator: ${bearishPercent}%`}>
            <div style={{ backgroundColor: '#d1111c', width: `${100-bearishPercent}%` }}></div>
            <div style={{ backgroundColor: '#1fac9b', width: `${bearishPercent}%` }}></div>
        </div>
    );
}


const WheelOfFortune = React.forwardRef((props, ref) => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const intervalRef = useRef<number | null>(null); // Référence pour l'intervalle

    const segments = ["Prix 1", "Prix 2", "Prix 3", "Prix 4", "Prix 5", "Prix 6"];
    const segmentAngle = 360 / segments.length;

    const startSpin = () => {
        if (isSpinning) return;

        setIsSpinning(true);

        // Début de la rotation avec un intervalle pour mettre à jour l'angle
        intervalRef.current = window.setInterval(() => {
            setRotation((prev) => prev + 5); // Augmente progressivement la rotation
        }, 16); // Mise à jour environ 60 fois par seconde (~16ms)
    };

    const stopSpin = () => {
        if (!isSpinning) return;

        setIsSpinning(false);

        // Arrêt de l'intervalle et rotation
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;

            // Aligne la roue sur un segment exact
            const alignedRotation = Math.round(rotation / segmentAngle) * segmentAngle;
            setRotation(alignedRotation);
        }
    };

    // Expose `startSpin` et `stopSpin` au composant parent via `ref`
    React.useImperativeHandle(ref, () => ({
        startSpin,
        stopSpin,
    }));

    return (
        <div className="d-flex flex-column align-items-center justify-content-center gap-3">
            <div
                className="position-relative rounded-circle border border-dark"
                style={{
                    width: "256px",
                    height: "256px",
                    transform: `rotate(${rotation}deg)`,
                    transition: isSpinning ? "none" : "transform 0.5s ease-out", // Transition pour l'arrêt fluide
                }}
            >
                <svg width="256" height="256" viewBox="0 0 100 100" className="position-absolute top-0 start-0">
                    {segments.map((segment, index) => (
                        <g
                            key={index}
                            transform={`rotate(${index * segmentAngle}, 50, 50)`}
                        >
                            <path
                                d={`M50 50 L50 0 A50 50 0 0 1 ${50 + 50 * Math.sin((segmentAngle * Math.PI) / 180)} ${50 - 50 * Math.cos((segmentAngle * Math.PI) / 180)} Z`}
                                fill={index % 2 === 0 ? "#1fac9b" : "#d1111c"}
                            />
                            <text
                                x="50"
                                y="15"
                                fill="#fff"
                                fontSize="3"
                                fontWeight="bold"
                                textAnchor="middle"
                                transform={`rotate(${segmentAngle / 2}, 50, 50)`}
                            >
                                {segment}
                            </text>
                        </g>
                    ))}
                </svg>
            </div>
        </div>
    );
});




export default App
