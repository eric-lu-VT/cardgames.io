# [netcardgames.org](https://netcardgames.org/)

A website that hosts functional implementations of various card games, to be played live and with multiplayer support. 

## Impressions

### Main Website
![img](https://i.imgur.com/rCGWfnR.png)

### Liar's Poker
![img](https://i.imgur.com/UEw1NFB.png)
![img](https://i.imgur.com/E0Grf4y.png)
![img](https://i.imgur.com/tBK6wdg.png)

## Games Implemented
- Liar's Poker (also known as Commune)
- President (coming soon!)

## Known Issues
- Main Website
  - A lot of empty space on front page
- Liar's Poker
  - On join screen, hostship of game does not switch if host leaves
  - Name changing
    - Game menu box misaligned temporarily on some name changes (long name being changed to short name)
    - Some text doesn't updte immediately after name change

## Roadmap
- Main Website
  - Add more info pages (contact, about, etc.) 
  - Save client name across all subpages of website
  - Adjust frontend presentation (underlining, colors, etc.)
- Liar's Poker
  - Refactor frontend code
  - Add spectators to active games
  - Add reconnection capabilities
  - Make info on Poker ranks accessable directly on website
  - Add name length limit

## Built With
- Javascript - Backend & Frontend functionality
- HTML - Frontend
- CSS - Frontend formatting
- Node.js - JavaScript applet execution on website
- npm - Node package manager
- [Socket.IO](https://github.com/socketio/socket.io) - supports real-time, bi-directional communication between web clients and servers.
- [Express](https://github.com/expressjs/express) - Backend web application framework
- [card-deck](https://github.com/kadamwhite/node-card-deck) - basic Deck interface 
- [Bootstrap 5.0.2](https://github.com/twbs/bootstrap) - Frontend display 





