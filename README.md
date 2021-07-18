# [netcardgames.org](https://netcardgames.org/)

A website that hosts functional implementations of various card games, to be played live and with multiplayer support. 

## Impressions

### Main Website

### Liar's Poker

## Games Implemented
- Liar's Poker (also known as Commune)
- President (coming soon!)

## Known Issues
- Main Website
  - Display of website header screws up presentation of front page screen on mobile devices
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
- Javascript - Backend
- HTML - Frontend
- CSS - Frontend formatting
- Node.js - JavaScript applet execution on website
- npm - Node package manager
- [Socket.IO](https://github.com/socketio/socket.io) - supports real-time, bi-directional communication between web clients and servers.
- [card-deck](https://github.com/kadamwhite/node-card-deck) - basic Deck interface 





