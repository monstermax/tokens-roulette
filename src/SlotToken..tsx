
import React, { useEffect, useRef, useState } from "react";
import { Modal } from 'bootstrap';

import { WheelOfFortune } from "./WheelOfFortune";
import { BearishBar } from "./BearishBar";
import { networks } from "./config";

//import { buy, sell } from './swap_api'; // REAL SWAPS (server side)
import { buy, sell } from './quote_api'; // QUOTES ONLY

import type { CurrentGame, GameHistory, SlotStatus, TokensPair } from "./types";


export const SlotToken = (props: {network: string, currencyPrice: number, pair: TokensPair, balance: number, setBalance: React.Dispatch<React.SetStateAction<number>>, saveGame: (newGameHistory: GameHistory) => void}) => {
    const pair = props.pair;
    const network = props.network;
    const currencyPrice = props.currencyPrice;
    const balance = props.balance;
    const setBalance = props.setBalance;
    const saveGame = props.saveGame;

    const wheelRef = useRef<{ startSpin: () => void, stopSpin: () => void } | null>(null);
    const timerRemainingRef = useRef<number | null>(null);

    const [remainingTime, setRemainingTime] = useState(10);
    const [amountUsd, setAmountUsd] = useState(0);
    const [slotStatus, setSlotStatus] = useState<SlotStatus>('idle');
    const [currentGame, setCurrentGame] = useState<CurrentGame>({ buyDate: null, buyPrice: null, sellPrice: null, buyInputAmount: null, buyOutputAmount: null, sellOutputAmount: null });

    const startGame = async (duration=30) => {
        setSlotStatus('starting');
        setCurrentGame({ buyDate: null, buyPrice: null, sellPrice: null, buyInputAmount: null, buyOutputAmount: null, sellOutputAmount: null });

        const inputAmountCoin = Math.round(1e9 * amountUsd / currencyPrice);

        buy(pair, inputAmountCoin)
            .then((tradeResult) => {
                console.log(`Buy result:`, tradeResult);

                if (! tradeResult || ! tradeResult.inputAmount) {
                    throw new Error(`invalid buy result`);
                }

                const buyDate = new Date;
                const buyPrice = Number(tradeResult.priceUsd);
                const buyInputAmount = Number(tradeResult.inputAmount);
                const buyOutputAmount = Number(tradeResult.outputAmount);

                // update local states
                setCurrentGame((game) => ({ ...game, buyDate, buyPrice, buyInputAmount, buyOutputAmount }));
                setSlotStatus('running');
                setBalance((balance) => balance -= buyInputAmount);
                setRemainingTime(duration);

                // start wheel
                if (wheelRef.current) {
                    wheelRef.current?.startSpin();
                }

                // start countdown timer
                timerRemainingRef.current = setInterval(() => {
                    setRemainingTime((value) => Math.max(0, value - 1));
                }, 1000);
            })
            .catch((err: any) => {
                console.warn(`BUY ERROR: ${err}`);

                // revert to 'idle' status
                setSlotStatus('idle');
            });
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
                    console.log(`Sell result:`, tradeResult);

                    if (! tradeResult || ! tradeResult.outputAmount) {
                        throw new Error(`invalid buy result`);
                    }

                    const sellPrice = Number(tradeResult.priceUsd);
                    const sellOutputAmount = Number(tradeResult.outputAmount);

                    // update local states
                    setCurrentGame((game) => ({ ...game, sellPrice, sellOutputAmount }));
                    setBalance((balance) => balance += sellOutputAmount);
                    setSlotStatus('idle');

                    // stop wheel
                    if (wheelRef.current) {
                        wheelRef.current?.stopSpin();
                    }
                })
                .catch((err: any) => {
                    console.warn(`SELL ERROR: ${err}`);

                    // revert to 'running' status
                    setSlotStatus('running');
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

        if (currentGame.buyPrice && currentGame.sellPrice && currentGame.sellOutputAmount && currentGame.buyInputAmount && currentGame.buyDate && currentGame.sellDate) {
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

            const gameHistory: GameHistory = {
                tokenName: pair.baseToken.name,
                pairAddress: pair.pairAddress,
                buyDate: currentGame.buyDate,
                buyAmountIn: currentGame.buyInputAmount,
                buyAmountOut: currentGame.buyOutputAmount ?? 0,
                sellDate: currentGame.sellDate,
                sellAmountOut: currentGame.sellOutputAmount,
                diffCoin,
                diffUsd,
                percent,
            }

            saveGame(gameHistory);

            // show popup gain
            const endGameModal = new Modal(document.getElementById('modal-game-end')!, {})
            endGameModal.show()
        }

    }, [currentGame]);

    const pairLinkTitle = pair.stats ? `${pair.baseToken.name}\n\n${pair.stats.priceChangeM5 > 0 ? "+" : ""}${pair.stats.priceChangeM5}% last 5 minutes` : pair.baseToken.name

    const imgSrc = `https://dd.dexscreener.com/ds-data/tokens/${network}/${pair.baseToken.address.toLowerCase()}.png`;

    const svgFallback = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><circle cx="32" cy="32" r="30" fill="#edc" stroke="#000" stroke-width="2"/><text x="32" y="42" font-size="30" text-anchor="middle" fill="#000" font-family="Arial, sans-serif">${pair.baseToken.name.charAt(0).toUpperCase()}</text></svg>`
    )}`;


    return (
        <div className='card mx-1 my-3' style={{ width: '300px' }}>

            {/* image + title  */}
            <div className='d-flex my-1'>
                {/* image  */}
                <img
                    src={imgSrc}
                    alt={`${pair.baseToken.name}`}
                    className='mx-1 rounded'
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; // Prevent infinite loop
                        target.src = svgFallback;
                    }}
                    />

                {/* title  */}
                <h3 className='m-1 text-truncate text-center flex-grow-1'>
                    <a href={`https://dexscreener.com/${network}/${pair.pairAddress}`} title={pairLinkTitle} target='_blank' className="text-decoration-none text-dark">
                        {pair.baseToken.name}
                    </a>
                </h3>
            </div>

            {/* WheelOfFortune + buttons */}
            <div className='my-1 text-center'>

                {/* WheelOfFortune */}
                <div className='wheel'>
                    <WheelOfFortune ref={wheelRef} />
                </div>

                {/* buttons */}
                <div className='m-1 mx-2'>

                    {/* start button */}
                    {['idle', 'starting'].includes(slotStatus) &&
                        <div className="input-group">
                            <span className="input-group-text">$</span>
                            <input type="number" className="form-control" list="betsValues" aria-label="Dollar amount (with dot and two decimal places)" min={0} step={1} value={amountUsd} onChange={(event) => setAmountUsd(Number(event.target.value))} />

                            <button className="btn btn-outline-secondary" onClick={() => setAmountUsd(10)}>10</button>
                            <button className="btn btn-outline-secondary" onClick={() => setAmountUsd(100)}>100</button>

                            <button
                            onClick={() => startGame()}
                                className={`btn btn-outline-success ${(slotStatus === 'idle' && amountUsd >= 1 && amountUsd < balance * currencyPrice) ? "" : "disabled"}`}
                                >
                                Launch
                            </button>
                        </div>
                    }

                    {/* stop button */}
                    {['running', 'stopping'].includes(slotStatus) && 
                            <button
                                onClick={() => stopGame()}
                                className={`btn btn-outline-danger ${(slotStatus === 'running') ? "" : "disabled"}`}
                                >
                                Stop ({remainingTime} sec.)
                            </button>
                        }
                </div>
            </div>

            {/* BearishBar  */}
            <BearishBar priceChangeM5={pair.stats?.priceChangeM5} />
        </div>
    );
}
