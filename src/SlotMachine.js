
import React, { useState } from 'react';
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

    const calculateConsecutiveSymbols = (reelSymbols, symbol) => {
        let currentConsecutive = 0;
        for (let i = 0; i < reelSymbols.length; i++) {
            if (reelSymbols[i] === symbol) {
                currentConsecutive++;
            } else {
                break; // Stop counting if there is a break in the sequence
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
                }, 600); // Adjust based on animation timing
            }
        }, 30);
    };

    const evaluateSpin = (finalSymbols) => {
      setSpinning(false);
      calculateResult(finalSymbols); // calculateResult will handle setting the win message
  };
  
  const calculateResult = (spunReels) => {
    let payout = 0;
    let sevenCount = spunReels.filter((icon) => icon === "7️⃣").length;

    symbols.forEach((symbolData) => {
        if (symbolData.icon !== "7️⃣") {
            const consecutive = calculateConsecutiveSymbols(spunReels, symbolData.icon);
            if (symbolData.icon === "💎") {
                // Diamonds pay from the first symbol, but only if they start from the first reel
                if (consecutive >= 1 && spunReels[0] === "💎") {
                    payout += bet * symbolData.multipliers[consecutive - 1];
                }
            } else {
                // Other symbols need at least 2 consecutive symbols to count and must start from the first reel
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
                <div className="message-container">{winMessage}</div> {/* Display win message */}
            </div>
        </div>
    );
}

export default SlotMachine;