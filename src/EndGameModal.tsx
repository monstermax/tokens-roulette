// EndGameModal.tsx

import humanTime from 'human-time';

import { networks } from "./config";

import type { GameHistory } from "./types";


export const EndGameModal = (props: { gamesHistory: GameHistory[], network: string }) => {
    const gamesHistory = props.gamesHistory;
    const network = props.network;

    return (
        <div id="modal-game-end" className="modal" tabIndex={-1}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Game History</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>

                    <div className="modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>

                        {[...gamesHistory].reverse().map((gameHistory, index) => {
                            return (
                                <div key={`${gameHistory.pairAddress}-${gameHistory.buyDate.getTime()}`} className="p-3 mb-3 border rounded">
                                    <ul className="list-unstyled">
                                        <li className='token mb-2'>
                                            <strong>Token:</strong>
                                            <span className='ms-2'>{gameHistory.tokenName}</span>
                                        </li>
                                        <li className='date mb-2'>
                                            <strong>Date:</strong>
                                            <span className='ms-2'>{humanTime(gameHistory.buyDate)}</span>
                                        </li>
                                        <li className='bought mb-2'>
                                            <strong>Bought:</strong>
                                            <span className='ms-2'>{Math.round(1000 * gameHistory.buyAmountIn / 1e9) / 1000} {networks[network].symbol}</span>
                                        </li>
                                        <li className='sold mb-2'>
                                            <strong>Sold:</strong>
                                            <span className='ms-2'>{Math.round(1000 * gameHistory.sellAmountOut / 1e9) / 1000} {networks[network].symbol}</span>
                                        </li>
                                        <li className='pnl'>
                                            <strong>PNL:</strong>
                                            <span className={`ms-2 ${gameHistory.diffUsd > 0 ? 'text-success' : 'text-danger'}`}>
                                                $ {Math.round(100 * gameHistory.diffUsd) / 100}
                                            </span>
                                            <span className='ms-2'>({Math.round(10 * gameHistory.percent) / 10} %)</span>
                                            <span className='ms-2'>{Math.round(1000 * gameHistory.diffCoin / 1e9) / 1000} {networks[network].symbol}</span>
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
};

