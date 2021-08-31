# [netcardgames.org](https://netcardgames.org/)

A website that hosts functional implementations of various card games, to be played live and with multiplayer support. 

## Impressions

### Main Website
![img](https://i.imgur.com/b95VQJf.png)

### Liar's Poker
![img](https://i.imgur.com/RhMIaXe.png)
![img](https://i.imgur.com/GMlVY9X.png)
![img](https://i.imgur.com/VN0CIL0.png)

### President

## Games Implemented
- Liar's Poker (also known as Commune)
- President

## Known Issues
- General
  - Need to fix frontend display spacing and sizing on mobile devices
  - Accordions overlapping over each other
  - SEO (Lighthouse)
    - Add meta description
    - Add robots.txt
    - Configure Progressive Web App stuff
- Liar's Poker
  - On join screen, hostship of game does not switch if host leaves
  - Name changing
    - Some text doesn't update immediately after name change
- President
  - Fix point display 
  - Change some show/noshow elements depending on position in game
  - Change text input to need only rank (needs rank and suit currently) 

## Roadmap
- Main Website
  - Add more info pages (about, faq, etc.) 
  - Persist data (including reconnection capabilities)
  - Add more documentation
  - Display "there are no cards in the pile" when there are no cards in the pile (keep getting null error for some reason)
- Liar's Poker
  - Refactor frontend code
  - Add spectators to active games
  - Add name length limit
- President
  - Drag/drop cards rather than text input





