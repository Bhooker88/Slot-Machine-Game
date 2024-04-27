import React, { useState, useRef, useEffect } from 'react';
import './SlotMachine.css';

const symbols = [
    { icon: '🍒', multipliers: [0, 2, 4, 6, 8] },
    { icon: '🍋', multipliers: [0, 2, 4, 6, 8] },
    { icon: '🔔', multipliers: [0, 6, 10, 15, 20] },
    { icon: '🍉', multipliers: [0, 4, 6, 10, 16] },
    { icon: '⭐', multipliers: [0, 4, 6, 10, 16] },
    { icon: '💎', multipliers: [5, 15, 25, 35, 100] },
    { icon: '7️⃣', multipliers: [0, 0, 0, 0, 0] },
];

function SlotMachine() {
    const [reels, setReels] = useState(Array(5).fill(symbols[4].icon));
    const [bet, setBet] = useState(1);
    const [credits, setCredits] = useState(1000);
    const [spinning, setSpinning] = useState(false);
    const [freeSpins, setFreeSpins] = useState(0);
    const [winMessage, setWinMessage] = useState('Good Luck!');
    const [showRules, setShowRules] = useState(false);
    const [mute, setMute] = useState(false);
    const spinSound = useRef(null);

    useEffect(() => {
        spinSound.current = new Audio('/audio/playful-casino-slot-machine-jackpot-3-183921.mp3');
        spinSound.current.onerror = () => {
            console.error("Failed to load audio file.");
        };
    }, []);

    const toggleRules = () => {
        setShowRules(!showRules);
    };

    const toggleMute = () => {
        setMute(!mute);
    };


    const calculateConsecutiveSymbols = (reelSymbols, symbol) => {
        let currentConsecutive = 0;
        for (let i = 0; i < reelSymbols.length; i++) {
            if (reelSymbols[i] === symbol) {
                currentConsecutive++;
            } else {
                break;
            }
        }
        return currentConsecutive;
    };

    const generateReels = () => {
        const reels = [];
        for (let i = 0; i < 5; i++) {
            const reelSymbols = [];
            for (let j = 0; j < 20; j++) {
                reelSymbols.push(symbols[Math.floor(Math.random() * symbols.length)].icon);
            }
            reels.push(reelSymbols);
        }
        return reels;
    };

    const spinReels = () => {
        if (credits < bet && freeSpins === 0) {
            alert("You don't have enough credits to bet.");
            return;
        }

        if (spinSound.current && !mute) {
            spinSound.current.currentTime = 0;
            spinSound.current.play();
        }

        setSpinning(true);
        if (freeSpins === 0) {
            setCredits(c => c - bet);
        } else {
            setFreeSpins(spins => spins - 1);
        }

        const spins = generateReels();
        let currentIteration = 0;
        const spinInterval = setInterval(() => {
            setReels(spins.map(reel => reel[currentIteration % reel.length]));
            currentIteration++;
            if (currentIteration >= 20) {
                clearInterval(spinInterval);
                setTimeout(() => {
                    const finalSymbols = spins.map(reel => reel[19]);
                    setReels(finalSymbols);
                    evaluateSpin(finalSymbols);
                }, 600);
            }
        }, 30);
    };

    const evaluateSpin = (finalSymbols) => {
        setSpinning(false);
        calculateResult(finalSymbols);
    };

    const calculateResult = (spunReels) => {
        let payout = 0;
        let sevenCount = spunReels.filter((icon) => icon === "7️⃣").length;

        symbols.forEach((symbolData) => {
            if (symbolData.icon !== "7️⃣") {
                const consecutive = calculateConsecutiveSymbols(spunReels, symbolData.icon);
                if (symbolData.icon === "💎") {
                    if (consecutive >= 1 && spunReels[0] === "💎") {
                        payout += bet * symbolData.multipliers[consecutive - 1];
                    }
                } else {
                    if (consecutive >= 2) {
                        payout += bet * symbolData.multipliers[consecutive - 1];
                    }
                }
            }
        });

        setCredits(c => c + payout);

        if (sevenCount >= 3) {
            const additionalSpins = freeSpins > 0 ? 5 : 10;
            setFreeSpins(spins => spins + additionalSpins);
            setWinMessage(`Bonus activated! ${additionalSpins} free spins awarded!`);
        } else if (payout > 0) {
            setWinMessage(`You Win: ${payout}`);
        } else {
            setWinMessage('Spin Again: Good Luck');
        }

        return payout;
    };


    const handleBetChange = (amount) => {
        if (amount > credits) {
            alert("You don't have enough credits.");
        } else if (!spinning) {
            setBet(amount);
        }
    };

    const buttonClass = (amount) => (
        `button ${spinning || bet === amount ? 'button-disabled' : ''} ${bet === amount ? 'button-active' : ''}`
    );

    return (
        <div className="slot-machine">
            <div className="reels">
                {reels.map((symbol, index) => (
                    <div key={index} className={`reel ${spinning ? "spin" : ""}`}>
                        {symbol}
                    </div>
                ))}
            </div>
            <div className="controls">
                <button onClick={toggleMute}>{mute ? 'Unmute' : 'Mute'}</button>
                <button className={buttonClass(1)} onClick={spinReels} disabled={spinning || (credits < bet && freeSpins === 0)}>
                    Spin
                </button>
                <button className={buttonClass(5)} onClick={() => handleBetChange(5)} disabled={spinning || bet === 5}>
                    Bet 5
                </button>
                <button className={buttonClass(10)} onClick={() => handleBetChange(10)} disabled={spinning || bet === 10}>
                    Bet 10
                </button>
                <div>Credits: {credits}</div>
                <div>Free Spins: {freeSpins}</div>
                <div className="message-container">{winMessage}</div>
                <button className="rules-button" onClick={toggleRules}>Show Rules</button>
            </div>
            {showRules && (
                <div className="rules-modal">
                    <h2>Game Rules & Payouts</h2>
                    <ul>
                        <li>🍒, 🍋 - 2x for two, 4x for three, 6x for four, 8x for five</li>
                        <li>🔔 - 6x for two, 10x for three, 15x for four, 20x for five</li>
                        <li>🍉, ⭐ - 4x for two, 6x for three, 10x for four, 16x for five</li>
                        <li>💎 - 5x for one, 15x for two, 25x for three, 35x for four, 100x for five</li>
                        <li>7️⃣ - No payout, but 3 or more scattered triggers bonus free spins</li>
                    </ul>
                    <p>Bonus: 3 or more '7️⃣' symbols award 10 free spins. Retrigger during bonus spins awards 5 more.</p>
                    <button onClick={toggleRules}>Close</button>
                </div>
            )}
        </div>
    );


}

export default SlotMachine;