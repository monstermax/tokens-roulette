import { useEffect, useRef, useState } from 'react'


import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import './App.css'

type Token = {
    address: string,
    name: string,
    capital?: number,
}

type TokensPair = {
    pairAddress: string,
    baseToken: Token,
    quoteToken: Token,
}

type Wallet = {
    network: string,
    privateKey: string,
    address: string,
}

type Network = {
    slug: string,
    name: string,
    symbol: string,
    wrapAddress: string,
}

type NetworkName = keyof typeof networks;


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

const networks: Record<string, Network> = {
    solana: { slug: 'solana', name: 'Solana', symbol: 'SOL', wrapAddress: 'So11111111111111111111111111111111111111112' }
};


async function fetchCurrencyPrice(network: NetworkName) {
    const tokenAddress = networks[network].wrapAddress;
    const url = `https://api.dexscreener.com/tokens/v1/${network}/${tokenAddress}`;

    // ex: https://api.dexscreener.com/tokens/v1//solana/So11111111111111111111111111111111111111112

    if (! network) return 0;

    return fetch(url)
        .then((response) => response.json())
        .then((results) => {
            return results.filter((result: any) => result.chainId === network)
                .map((result: any) => {
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
            return results.filter((result: any) => result.chainId === network)
                .map((result: any) => {
                    return {
                        pairAddress: result.pairAddress,
                        baseToken: { name: result.baseToken.name, address: result.baseToken.address },
                        quoteToken: { name: result.baseToken.name, address: result.quoteToken.address },
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
    return 10;
}


async function startGame(tokensPair: TokensPair) {

}


async function stopGame(tokensPair: TokensPair) {

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
                setPairs(tokensPairs);
            }));

    }, [tokensList])


    useEffect(() => {
        // wallet changed

        if (wallet) {
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
                            <span className='me-1'>{balance} {currencyName}</span>
                            <small className='ms-1'>({new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(balance * currencyPrice)})</small>
                        </p>
                    </div>
                </div>

                {/* tokens list */}
                <div className='alert alert-dark'>
                    <h2>Slot Tokens</h2>

                    <div className='d-flex flex-wrap'>
                        {pairs.map(pair => {
                            return (
                                <div key={`${pair.baseToken.address}-${pair.quoteToken.address}`} className='card mx-1 my-3' style={{ width: '300px' }}>
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
                                            <WheelOfFortune pair={pair} balance={balance} currencyPrice={currencyPrice} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>

        </div>
    )
}


const WheelOfFortune = (props: { pair: TokensPair, balance: number, currencyPrice: number }) => {
    const { pair, balance, currencyPrice } = props;

    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [remainingTime, setRemainingTime] = useState(10);
    const [amount, setAmount] = useState(0);
    const timerRef = useRef<number | null>(null);

    const segments = ["Prix 1", "Prix 2", "Prix 3", "Prix 4", "Prix 5", "Prix 6"];
    const segmentAngle = 360 / segments.length;

    const handleSpin = () => {
        if (isSpinning) {
            handleStop();
            return;
        }

        startGame(pair);

        setIsSpinning(true);
        setRemainingTime(10);

        const randomRotation = Math.floor(Math.random() * 360) + 3600; // Toujours au moins 10 tours
        setRotation((prev) => prev + randomRotation);

        timerRef.current = setInterval(() => {
            setRemainingTime((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                    }
                    stopGame(pair);
                    setIsSpinning(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleStop = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        stopGame(pair);
        setIsSpinning(false);
        setRemainingTime(0);
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    return (
        <div className="d-flex flex-column align-items-center justify-content-center gap-3">
            <div
                className="position-relative rounded-circle border border-dark"
                style={{
                    width: "256px",
                    height: "256px",
                    transform: `rotate(${rotation}deg)`,
                    transition: isSpinning ? "transform 10s cubic-bezier(0.17, 0.67, 0.83, 0.67)" : "none",
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
                                fill={index % 2 === 0 ? "#FFD700" : "#FF4500"}
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

            <div className='m-1 mx-2'>
                <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input type="number" className="form-control" aria-label="Dollar amount (with dot and two decimal places)" min={0} step={1} value={amount} onChange={(event) => setAmount(Number(event.target.value))} />

                    <button
                        onClick={handleSpin}
                        className={`btn btn-outline-success ${(amount >= 1 && amount < balance * currencyPrice) ? "" : "disabled"}`}
                    >
                        {isSpinning ? `Stop (${remainingTime} sec.)` : "Launch"}
                    </button>
                </div>
            </div>

        </div>
    );
};


export default App
