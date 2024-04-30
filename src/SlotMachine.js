import React, { useState, useRef, useEffect } from 'react';
import './SlotMachine.css';

const symbols = [
    { icon: '🍒', multipliers: [0, 0, 4, 8, 15] },
    { icon: '🍋', multipliers: [0, 0, 4, 8, 15] },
    { icon: '🔔', multipliers: [0, 0, 10, 15, 20] },
    { icon: '🍉', multipliers: [0, 2, 6, 10, 16] },
    { icon: '⭐', multipliers: [0, 2, 6, 10, 16] },
    { icon: '💎', multipliers: [1, 2, 10, 20, 100] },
    { icon: '7️⃣', multipliers: [0, 0, 0, 0, 0] },
];

function SlotMachine() {
    const [reels, setReels] = useState(Array(5).fill(symbols[5].icon));
    const [reels2, setReels2] = useState(Array(5).fill(symbols[4].icon));
    const [reels3, setReels3] = useState(Array(5).fill(symbols[3].icon));
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

    const generateReels = () => {
        const newReels = [];
        for (let i = 0; i < 5; i++) {
            const reelSymbols = [];
            for (let j = 0; j < 20; j++) {
                reelSymbols.push(symbols[Math.floor(Math.random() * symbols.length)].icon);
            }
            newReels.push(reelSymbols);
        }
        return newReels;
    };

    const handleBetChange = (amount) => {
        if (amount > credits) {
            alert("You don't have enough credits.");
        } else if (!spinning) {
            setBet(amount);
        }
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
        const cost = freeSpins > 0 ? 0 : bet;
        setCredits(c => c - cost);
        setFreeSpins(f => f > 0 ? f - 1 : 0);

        const spins = generateReels();
        const spins2 = generateReels();
        const spins3 = generateReels();
        let currentIteration = 0;
        const spinInterval = setInterval(() => {
            setReels(spins.map(reel => reel[currentIteration % reel.length]));
            setReels2(spins2.map(reel => reel[currentIteration % reel.length]));
            setReels3(spins3.map(reel => reel[currentIteration % reel.length]));
            currentIteration++;
            if (currentIteration >= 40) {
                clearInterval(spinInterval);
                setTimeout(() => {
                    const finalSymbols = spins.map(reel => reel[19]);
                    const finalSymbols2 = spins2.map(reel => reel[19]);
                    const finalSymbols3 = spins3.map(reel => reel[19]);
                    setReels(finalSymbols);
                    setReels2(finalSymbols2);
                    setReels3(finalSymbols3);
                    evaluateSpin(finalSymbols, finalSymbols2, finalSymbols3);
                }, 50);
            }
        }, 50);
    };

    const evaluateSpin = (finalSymbols, finalSymbols2, finalSymbols3) => {
        setSpinning(false);
        const { payout: payout1, freeSpins: freeSpins1 } = calculateResult(finalSymbols);
        const { payout: payout2, freeSpins: freeSpins2 } = calculateResult(finalSymbols2);
        const { payout: payout3, freeSpins: freeSpins3 } = calculateResult(finalSymbols3);
        const totalPayout = payout1 + payout2 + payout3;
        const totalFreeSpins = freeSpins1 + freeSpins2 + freeSpins3;
        setCredits(c => c + totalPayout);
        setFreeSpins(f => f + totalFreeSpins);
        let message = `Total Win: ${totalPayout}`;
        if (totalPayout === 0 && totalFreeSpins === 0) {
            message = "Spin Again: Good Luck";
        } else if (totalPayout > 0) {
            if (totalFreeSpins > 0) {
                message += ` | Bonus: ${totalFreeSpins} free spins awarded!`;
            }
        } else if (totalFreeSpins > 0) {
            message = `Bonus: ${totalFreeSpins} free spins awarded!`;
        }
        setWinMessage(message);
    };

    const calculateResult = (spunReels) => {
        let payout = 0;
        let sevenCount = spunReels.filter((icon) => icon === "7️⃣").length;

        symbols.forEach((symbolData) => {
            const consecutive = calculateConsecutiveSymbols(spunReels, symbolData.icon);
            if (symbolData.icon === "💎" && consecutive >= 1 && spunReels[0] === "💎") {
                payout += bet * symbolData.multipliers[consecutive - 1];
            } else if (consecutive >= 2) {
                payout += bet * symbolData.multipliers[consecutive - 1];
            }
        });

        
        let additionalSpins = 0;
        if (sevenCount >= 3) {
            additionalSpins = freeSpins > 0 ? 5 : 10;
        }

        return { payout, freeSpins: additionalSpins };
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

    const buttonClass = (amount) => {
        const isDisabled = spinning || (credits < amount && freeSpins === 0);
        return `button ${isDisabled ? 'button-disabled' : ''} ${bet === amount ? 'button-active' : ''}`;
    };

    return (
        <div className="slot-machine">
            <div className="reels">
                {reels.map((symbol, index) => (
                    <div key={index} className={`reel ${spinning ? "spin" : ""}`}>
                        {symbol}
                        <div className="payline"></div>
                    </div>
                ))}
            </div>
            <div className="reels">
                {reels2.map((symbol, index) => (
                    <div key={index} className={`reel ${spinning ? "spin" : ""}`}>
                        {symbol}
                            <div className="payline"></div>
                    </div>
                ))}
            </div>
            <div className="reels">
                {reels3.map((symbol, index) => (
                    <div key={index} className={`reel ${spinning ? "spin" : ""}`}>
                        {symbol}
                        <div className="payline"></div>
                    </div>
                ))}
            </div>
            <div className="controls">
                <button onClick={toggleMute}>{mute ? 'Unmute' : 'Mute'}</button>
                <button onClick={spinReels} disabled={spinning || credits < bet && freeSpins === 0}>
                    Spin
                </button>
                <button className={buttonClass(1)} onClick={() => handleBetChange(1)} disabled={spinning || credits < 1}>
                    Bet 1
                </button>
                <button className={buttonClass(5)} onClick={() => handleBetChange(5)}>
                    Bet 5
                </button>
                <button className={buttonClass(10)} onClick={() => handleBetChange(10)}>
                    Bet 10
                </button>
                <button className={buttonClass(20)} onClick={() => handleBetChange(20)}>
                    Bet 20
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
                        <li>🍒, 🍋 - 4x for three, 8x for four, 15x for five</li>
                        <li>🔔 - 10x for three, 15x for four, 20x for five</li>
                        <li>🍉, ⭐ - 2x for two, 6x for three, 10x for four, 16x for five</li>
                        <li>💎 - 1x for one, 2x for two, 10x for three, 20x for four, 100x for five</li>
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
