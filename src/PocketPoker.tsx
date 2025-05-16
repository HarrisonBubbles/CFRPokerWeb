import React, { useState, useEffect } from 'react';
import deckSprite from './assets/8BitDeck.png';
import deckBack from './assets/back.png'
import './PocketPoker.css';

const rankToString = (rank) => {
  switch(rank) {
    case 12: return 'A';
    case 11: return 'K';
    case 10: return 'Q';
    case 9: return 'J';
    case 8: return 'T'; 
    default: return rank.toString();
  }
};


const cardToString = (card) => {
  if (!card) return '';
  const [suit, rank] = card;
  return rankToString(rank);
};

const evaluateHand = (hand, communityCard) => {
  const cards = [...hand, communityCard];
  
  // Extract ranks and count them
  const ranks = cards.map(card => card[1]);
  
  // Count occurrences of each rank
  const rankCounts = {};
  ranks.forEach(rank => {
    rankCounts[rank] = (rankCounts[rank] || 0) + 1;
  });
  
  console.log('Evaluating hand:', cards);
  console.log('Ranks:', ranks);
  console.log('Rank counts:', rankCounts);
  
  // Check for three of a kind
  for (const [rank, count] of Object.entries(rankCounts)) {
    if (count === 3) {
      console.log('Three of a kind found:', rank);
      return [3, parseInt(rank)];
    }
  }
  
  // Check for pair
  for (const [rank, count] of Object.entries(rankCounts)) {
    if (count === 2) {
      console.log('Pair found:', rank);
      return [2, parseInt(rank)];
    }
  }

  // High card
  const highRank = Math.max(...ranks);
  console.log('High card:', highRank);
  return [1, highRank];
};


const compareHands = (evaluation1, evaluation2) => {
  const [type1, highCard1] = evaluation1;
  const [type2, highCard2] = evaluation2;
  
  if (type1 > type2) return 1;
  if (type2 > type1) return 2;
  
  if (highCard1 > highCard2) return 1;
  if (highCard2 > highCard1) return 2;
  
  return 0;
};

const PocketPoker = () => {
  const [playerChips, setPlayerChips] = useState(1000);
  const [cpuChips, setCpuChips] = useState(1000);
  const [playerCards, setPlayerCards] = useState<number[][]>([]);
  const [cpuCards, setCpuCards] = useState<number[][]>([]);
  const [communityCard, setCommunityCard] = useState<number[]>([]);
  const [showdown, setShowdown] = useState<boolean>(false);
  const [deck, setDeck] = useState([]);

  const [pot, setPot] = useState(0);
  const [currentBet, setCurrentBet] = useState(0);
  const [playerActed, setPlayerActed] = useState(false);
  const [cpuActed, setCpuActed] = useState(false);
  const [playerAction, setPlayerAction] = useState(null);
  const [cpuAction, setCpuAction] = useState(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [actionHistory, setActionHistory] = useState([]);
  const [winner, setWinner] = useState(null);
  const [message, setMessage] = useState('');
  
  const createAndShuffleDeck = () => {
    const suits = [0, 1, 2, 3];
    const ranks = [8, 9, 10, 11, 12];
    
    let newDeck = [];
    for (const suit of suits) {
      for (const rank of ranks) {
        newDeck.push([suit, rank]);
      }
    }
    
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    
    return newDeck;
  };
  

  const dealHand = () => {
    const newDeck = createAndShuffleDeck();

    const newPlayerCards = [newDeck[0], newDeck[1]];
    const newCpuCards = [newDeck[2], newDeck[3]];
    const newCommunityCard = newDeck[4];
    
    setPlayerCards(newPlayerCards);
    setCpuCards(newCpuCards);
    setCommunityCard(newCommunityCard);
    
    setDeck(newDeck.slice(5));

    setShowdown(false);
    setIsPlayerTurn(true);
    setPlayerActed(false);
    setCpuActed(false);
    setPlayerAction(null);
    setCpuAction(null);
    setActionHistory([]);
    setGameOver(false);
    setWinner(null);
    setMessage('Your turn. Check or Raise?');

    setPlayerChips(prevChips => prevChips - 1);
    setCpuChips(prevChips => prevChips - 1);
    setPot(2);
    setCurrentBet(1);
  };
  
  useEffect(() => {
    dealHand();
  }, []);
  
  const getCardStyle = (card: number[], isHidden: boolean) => {
    if (isHidden) {
      return {
        backgroundImage: `url(${deckBack})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
      };
    }

    if (!card) return {};
    
    const [suit, rank] = card;
    
    return {
      backgroundImage: `url(${deckSprite})`,
      backgroundPosition: `-${71 * rank}px -${95 * suit}px`,
      backgroundRepeat: 'no-repeat'
    };
  };

  const handleCheck = () => {
    if (!isPlayerTurn || gameOver) return;

    const newHistory = [...actionHistory, 'CHECK'];
    
    setPlayerAction('CHECK');
    setPlayerActed(true);
    setActionHistory(newHistory);
    setMessage('You checked. CPU is thinking...');
    
    setIsPlayerTurn(false);
    
    if (cpuActed) {
      if (cpuAction === 'RAISE') {
        setMessage('You cannot check against a raise. Please call or fold.');
        setIsPlayerTurn(true);
        return;
      } else {
        setTimeout(() => {
          goToShowdown();
        }, 1000);
        return;
      }
    }
    
    setTimeout(() => {
      cpuTurn(newHistory);
    }, 1000);
  };
  
  const handleRaise = () => {
    if (!isPlayerTurn || gameOver) return;
    
    if (actionHistory.includes('RAISE')) {
      setMessage('There has already been a raise this round. You can only call.');
      return;
    }

    const newHistory = [...actionHistory, 'RAISE'];
    
    setPlayerChips(prevChips => prevChips - 1);
    setPot(prevPot => prevPot + 1);
    setCurrentBet(2);
    
    setPlayerAction('RAISE');
    setPlayerActed(true);
    setActionHistory(newHistory);
    setMessage('You raised. CPU is thinking...');
    
    setIsPlayerTurn(false);
    
    setTimeout(() => {
      cpuTurn(newHistory);
    }, 1000);
  };

  const handleFold = () => {
    if (!isPlayerTurn || gameOver) return;
    
    setPlayerAction('FOLD');
    setPlayerActed(true);
    setActionHistory(prev => [...prev, 'FOLD']);
    
    setCpuChips(prevChips => prevChips + pot);
    setWinner('CPU');
    setGameOver(true);
    setMessage('You folded. CPU wins the pot!');
  };
  
  const handleCall = () => {
    if (!isPlayerTurn || gameOver) return;
    
    if (!actionHistory.includes('RAISE')) {
      setMessage('There has been no raise to call.');
      return;
    }
    
    setPlayerChips(prevChips => prevChips - 1);
    setPot(prevPot => prevPot + 1);
    
    setPlayerAction('CALL');
    setPlayerActed(true);
    setIsPlayerTurn(false);
    setActionHistory(prev => [...prev, 'CALL']);
    setMessage('You called. Going to showdown...');
    
    setTimeout(() => {
      goToShowdown();
    }, 1000);
  };

  const cpuTurn = async (history: string[]) => {
    if (gameOver) return;
    
    try {
      cpuCards.sort(function(a, b) {
        return a[1] - b[1];
      });
      const cpuHand = cpuCards.map(card => cardToString(card)).join('');
      const communityStr = cardToString(communityCard);
      const actionsStr = history.join(',');

      const infosetKey = `${cpuHand}|${communityStr}|${actionsStr}`;
      console.log('Sending infoset to API:', infosetKey);
      
      const response = await fetch('https://cfrpoker.onrender.com/api/choose_move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ infoset_key: infosetKey }),
      });
      
      if (!response.ok) {
        throw new Error('API call failed');
      }
      
      const data = await response.json();
      const move = data.action;
      console.log('API returned move:', move);
      
      switch (move) {
        case 0:
          setCpuAction('FOLD');
          setActionHistory(prev => [...prev, 'FOLD']);
          setWinner('Player');
          setPlayerChips(prevChips => prevChips + pot);
          setGameOver(true);
          setMessage('CPU folded. You win the pot!');
          break;
          
        case 1:
          setCpuAction('CHECK');
          setActionHistory(prev => [...prev, 'CHECK']);
          setMessage('CPU checked. Going to showdown...');
          
          setShowdown(true)
          break;
          
        case 2:
          setCpuChips(prevChips => prevChips - 1);
          setPot(prevPot => prevPot + 1);
          
          setCpuAction('CALL');
          setActionHistory(prev => [...prev, 'CALL']);
          setMessage('CPU called. Going to showdown...');

          setShowdown(true)
          break;
          
        case 3:
          setCpuChips(prevChips => prevChips - 1);
          setPot(prevPot => prevPot + 1);
          setCurrentBet(2);
          
          setCpuAction('RAISE');
          setActionHistory(prev => [...prev, 'RAISE']);
          setMessage('CPU raised. You can call, or fold.');
          
          setIsPlayerTurn(true);
          break;
          
        default:
          console.error('Unknown move from API:', move);
          setMessage('CPU is thinking...');
          break;
      }
    } catch (error) {
      console.error('Error during CPU turn:', error);
      setMessage('API error!');
    }
    
    setCpuActed(true);
  };

  useEffect(() => {
    if (showdown) {
      setTimeout(() => {
        goToShowdown();
      }, 1000);
    }
  }, [showdown]);

  const goToShowdown = () => {
    setGameOver(true);
    
    const playerEvaluation = evaluateHand(playerCards, communityCard);
    const cpuEvaluation = evaluateHand(cpuCards, communityCard);
    const result = compareHands(playerEvaluation, cpuEvaluation);

    if (result === 1) {
      setWinner('Player');
      setPlayerChips(prevChips => prevChips + pot);
      
      let handType = '';
      switch (playerEvaluation[0]) {
        case 3: handType = 'three of a kind'; break;
        case 2: handType = 'pair'; break;
        case 1: handType = 'high card'; break;
      }
      
      setMessage(`You win with ${handType}!`);
    } 
    else if (result === 2) {
      setWinner('CPU');
      setCpuChips(prevChips => prevChips + pot);
      
      let handType = '';
      switch (cpuEvaluation[0]) {
        case 3: handType = 'three of a kind'; break;
        case 2: handType = 'pair'; break;
        case 1: handType = 'high card'; break;
      }
      
      setMessage(`CPU wins with ${handType}!`);
    } 
    else {
      const halfPot = Math.floor(pot / 2);
      setPlayerChips(prevChips => prevChips + halfPot);
      setCpuChips(prevChips => prevChips + (pot - halfPot));
      setWinner('Draw');
      setMessage('Tie game! The pot is split.');
    }
  };
  
  return (
    <div className="poker-app">
      {/* Header */}
      <div className="poker-header">
        <h1>Pocket Poker!</h1>
      </div>
      
      {/* Main game area */}
      <div className="game-area">
        {/* CPU area */}
        <div className="cpu-area">
          <div className="chip-count">CPU: {cpuChips} chips</div>
          <div className="cards-container">
            {cpuCards.map((card, index) => (
              <div 
                key={`cpu-card-${index}`} 
                className="card"
                style={getCardStyle(card, !gameOver)}
              ></div>
            ))}
          </div>
        </div>
        
        {/* Middle area with community card */}
        <div className="community-area">
          <div className="pot-display">Pot: {pot} chips</div>
          <div className="community-label">Community Card</div>
          {communityCard && (
            <div 
              className="card"
              style={getCardStyle(communityCard, false)}
            ></div>
          )}
          <div className="message-display">{message}</div>
        </div>
        
        {/* Action buttons */}
        <div className="action-buttons">
        {!gameOver ? (
            <>
              {isPlayerTurn && (
                <>
                  {!actionHistory.includes('RAISE') && (
                    <>
                  <button 
                    onClick={handleCheck} 
                    className="passive-button"
                  >
                    Check
                  </button>
                  <button 
                    onClick={handleRaise} 
                    className="aggro-button"
                  >
                    Raise
                  </button> </>)}
                  {actionHistory.includes('RAISE') && (
                    <>
                      <button 
                        onClick={handleFold} 
                        className="passive-button"
                      >
                        Fold
                      </button>
                      <button 
                        onClick={handleCall} 
                        className="aggro-button"
                      >
                        Call
                      </button>
                    </>
                  )}
                </>
              )}
              {!isPlayerTurn && (
                <div className="waiting-message">CPU is thinking...</div>
              )}
            </>
          ) : (
            <button 
              onClick={dealHand} 
              className="aggro-button"
            >
              New Round
            </button>
          )}
        </div>
        
        {/* Player area */}
        <div className="player-area">
          <div className="chip-count">Player: {playerChips} chips</div>
          <div className="cards-container">
            {playerCards.map((card, index) => (
              <div 
                key={`player-card-${index}`} 
                className="card"
                style={getCardStyle(card, false)}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PocketPoker;