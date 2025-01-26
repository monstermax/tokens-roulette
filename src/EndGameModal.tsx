
import humanTime from 'human-time';
//const humanTime = (d: Date) => d.toJSON().slice(0, 19).replace('T', ' ');

import { networks } from "./config";

import type { GameHistory } from "./types";


export const EndGameModal = (props: { gamesHistory: GameHistory[], network: string }) => {
    const gamesHistory = props.gamesHistory;
    const network = props.network;

    return (
        <div id="modal-game-end" className="modal" tabIndex={-1}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Game History</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>

                    <div className="modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>

                        {[...gamesHistory].reverse().map(gameHistory => {
                            return (
                                <div key={`${gameHistory.pairAddress}-${gameHistory.buyDate.getTime()}`}>

                                    <ul>
                                        <li className='token'>
                                            Token:
                                            <span className='mx-2'>{gameHistory.tokenName}</span>
                                        </li>
                                        <li className='token'>
                                            Date:
                                            <span className='mx-2'>{humanTime(gameHistory.buyDate)}</span>
                                        </li>
                                        <li className='bought'>
                                            Bought:
                                            <span className='mx-2'>{Math.round(1000 * gameHistory.buyAmountIn / 1e9) / 1000} {networks[network].symbol}</span>
                                        </li>
                                        <li className='sold'>
                                            Sold:
                                            <span className='mx-2'>{Math.round(1000 * gameHistory.sellAmountOut / 1e9) / 1000} {networks[network].symbol}</span>
                                        </li>
                                        <li className='pnl'>
                                            PNL:
                                            <span className='mx-2'>$ {Math.round(100 * gameHistory.diffUsd) / 100}</span>
                                            <span className='mx-2'>({Math.round(10 * gameHistory.percent) / 10} %)</span>
                                            <span className='mx-2'>{Math.round(1000 * gameHistory.diffCoin / 1e9) / 1000} {networks[network].symbol}</span>
                                        </li>
                                    </ul>
                                </div>
                            );
                        })}

                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
}