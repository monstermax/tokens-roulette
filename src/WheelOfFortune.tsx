// WheelOfFortune.tsx

import React, { useRef, useState } from "react";


export const WheelOfFortune = React.forwardRef((props, ref) => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [spinSpeed, setSpinSpeed] = useState(5);
    const intervalRef = useRef<number | null>(null); // Référence pour l'intervalle

    const segments = ["Prix 1", "Prix 2", "Prix 3", "Prix 4", "Prix 5", "Prix 6"];
    const segmentAngle = 360 / segments.length;

    const startSpin = () => {
        if (isSpinning) return;

        setIsSpinning(true);
        setSpinSpeed(10); // Vitesse initiale
        intervalRef.current = window.setInterval(() => {
            setRotation((prev) => prev + spinSpeed);
            setSpinSpeed((prev) => Math.max(prev - 0.1, 1)); // Réduction progressive de la vitesse
        }, 16);
    };

    const stopSpin = () => {
        if (!isSpinning) return;

        setIsSpinning(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;

            const alignedRotation = Math.round(rotation / segmentAngle) * segmentAngle;
            setRotation(alignedRotation); // Aligner la roue sur un segment
        }
    };

    React.useImperativeHandle(ref, () => ({
        startSpin,
        stopSpin,
    }));

    return (
        <div className='wheel-container mb-1'>

            {/* Roue */}
            <div
                className="wheel"
                style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: isSpinning ? "none" : "transform 0.5s ease-out",
                }}
            >
                <svg width="200" height="200" viewBox="0 0 100 100">
                    {segments.map((segment, index) => (
                        <g key={index} transform={`rotate(${index * segmentAngle}, 50, 50)`}>
                            <path
                                d={`M50 50 L50 0 A50 50 0 0 1 ${
                                    50 + 50 * Math.sin((segmentAngle * Math.PI) / 180)
                                } ${50 - 50 * Math.cos((segmentAngle * Math.PI) / 180)} Z`}
                                fill={index % 2 === 0 ? "#1fac9b" : "#d1111c"}
                            />
                            <text
                                x="50"
                                y="10"
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
