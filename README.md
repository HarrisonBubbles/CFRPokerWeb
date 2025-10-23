# CFRPokerWeb

![CFR Poker Screenshot](pocket_poker.png)

This is the frontend portion of a project I did for the [ML Summer School 2025](https://sites.google.com/view/rtg-northeastern/graduate/summer-schools/ml-summer-school-2025?authuser=0) at Northeastern University. I created a variation of Poker (which I deem "Pocket Poker") and then utilized Counterfactual Regret Minimization (CFR) to train a playable opponent bot.

Play against the bot [here!](https://cfr-poker-web.vercel.app/)

### Pocket Poker Rules

- 20 card deck (4 suits of 10,J,Q,K,A)
- 2 hole cards dealt to each player
- 1 shared community card
- 1 chip mandatory blind bet
- 1 round of fixed betting
- If no player folds, go to showdown and compare hands
- **Hand ranking:**
  - Three-of-a-kind
  - Pair
  - High card
