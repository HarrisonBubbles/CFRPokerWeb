import React, { useState, useEffect } from 'react';
import deckSprite from './assets/8BitDeck.png';
import deckBack from './assets/back.png'
import './PocketPoker.css';

const PocketPoker = () => {
  const [playerChips, setPlayerChips] = useState(1000);
  const [cpuChips, setCpuChips] = useState(1000);
  const [playerCards, setPlayerCards] = useState<number[][]>([]);
  const [cpuCards, setCpuCards] = useState<number[][]>([]);
  const [communityCard, setCommunityCard] = useState<number[]>([]);
  const [showdown, setShowdown] = useState<boolean>(false);
  const [deck, setDeck] = useState([]);
  
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
  };
  
  // Deal a hand when the component mounts
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
  
  // These functions will be replaced with actual game logic
  const handleCall = () => {
    console.log('Call button clicked');
  };
  
  const handleRaise = () => {
    console.log('Raise button clicked');
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
                style={getCardStyle(card, !showdown)}
              ></div>
            ))}
          </div>
        </div>
        
        {/* Middle area with community card */}
        <div className="community-area">
          <div className="community-label">Community Card</div>
          <div 
            className="card"
            style={getCardStyle(communityCard, false)}
          ></div>
        </div>
        
        {/* Action buttons */}
        <div className="action-buttons">
          <button 
            onClick={handleCall} 
            className="call-button"
          >
            Call
          </button>
          <button 
            onClick={handleRaise} 
            className="raise-button"
          >
            Raise
          </button>
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