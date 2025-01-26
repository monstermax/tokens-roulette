
import React, { useRef, useState } from "react";


export const WheelOfFortune = React.forwardRef((props, ref) => {
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
