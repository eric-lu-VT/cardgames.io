'use strict';

module.exports = {
  cardCompare
}
const {makeHand, handAsString, handAsURL, handCompare} = require('./Hand.js');

//hashmap clientsf
const clients = {};
const games = {};

const express = require('express');
const socketIO = require('socket.io');
const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';
const path = require('path');

const server = express()
  .use('/', express.static(path.join(__dirname, 'public')))
  .get("/", (req,res)=> res.sendFile(__dirname + "/public/pages/index.html"))
  .get("/contact", (req,res)=> res.sendFile(__dirname + "/public/pages/contact.html"))
  .get("/privacy-policy", (req,res)=> res.sendFile(__dirname + "/public/pages/privacy-policy.html"))
  .get("/liars-poker", (req,res)=> res.sendFile(__dirname + "/public/pages/liars-poker/join.html")) 
  .get("/liars-poker/help", (req,res)=> res.sendFile(__dirname + "/public/pages/liars-poker/help.html")) 
  .get("/liars-poker/rooms/:id", (req,res)=> {
    if(games[req.params.id] === undefined) {
      res.sendFile(__dirname + "/public/pages/error.html");
    }
    else {
      res.sendFile(__dirname + "/public/pages/liars-poker/game.html");
    }
  })
  .get('*', (req,res)=> res.sendFile(__dirname + "/public/pages/error.html"))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
/*
const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .use(express.static('public'))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
*/
const io = socketIO(server);

var Deck = require('card-deck');
var values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
var suits = ['null', 'clubs', 'diamonds', 'hearts', 'spades'];

io.of("/liars-poker").on('connection', client => {
  // console.log('Client connected: Liars Poker');

  client.on("disconnect", () => {
    if(client.gameId !== undefined) {
      const curGame = games[client.gameId];
      for(var i = curGame.clients.length - 1; i >= 0; i--) {
        if(client.id === curGame.clients[i].clientId) {
          curGame.clients.splice(i, 1);
        }
      }

      if(!curGame.active) {
        const payLoad = {
          "clientsBasicInfo": [],
          "hostId": curGame.hostId,
          "active": false,
          "success": true,
          "START_NUM_CARDS": -1,
          "MAX_NUM_CARDS": -1,
        }

        switch(curGame.clients.length) {
          case 1:
            curGame.START_NUM_CARDS = 8;
            curGame.MAX_NUM_CARDS = 11;
            break;
          case 2:
            curGame.START_NUM_CARDS = 8;
            curGame.MAX_NUM_CARDS = 11;
            break;
          case 3:
            curGame.START_NUM_CARDS = 6;
            curGame.MAX_NUM_CARDS = 9;
            break;
          case 4:
            curGame.START_NUM_CARDS = 4;
            curGame.MAX_NUM_CARDS = 7;
            break;
          case 5:
            curGame.START_NUM_CARDS = 3;
            curGame.MAX_NUM_CARDS = 6;
            break;
          case 6:
            curGame.START_NUM_CARDS = 3;
            curGame.MAX_NUM_CARDS = 5;
            break;
          case 7:
            curGame.START_NUM_CARDS = 2;
            curGame.MAX_NUM_CARDS = 4;
            break;
          case 8:
            curGame.START_NUM_CARDS = 2;
            curGame.MAX_NUM_CARDS = 4;
            break;
        }
        payLoad.START_NUM_CARDS = curGame.START_NUM_CARDS;
        payLoad.MAX_NUM_CARDS = curGame.MAX_NUM_CARDS;
        
        curGame.clients.forEach(c => {
          payLoad.clientsBasicInfo.push({
            "clientName": c.clientName
          });
        });
        //loop through all clients and tell them that people has joined
        curGame.clients.forEach(c => {
          io.of("/liars-poker").to(c.clientId).emit("join", payLoad);
        });
      }
      else {
        for(var i = curGame.alivePlayers.length - 1; i >= 0; i--) {
          if(client.id === curGame.alivePlayers[i].clientId) {
            curGame.alivePlayers.splice(i, 1);
          }
        }
        for(var i = curGame.deadPlayers.length - 1; i >= 0; i--) {
          if(client.id === curGame.deadPlayers[i].clientId) {
            curGame.deadPlayers.splice(i, 1);
          }
        }
        if(curGame.clients.length === 0) {
          delete games[client.gameId];
        }
      }
    }
    
    // console.log('Client disconnected');
  });

  //a user want to create a new game
  client.on("create", (clientId) => {

    const gameId = makeGameId(4);
    games[gameId] = {
      "id": gameId,
      "active": false,
      "hostId": undefined,
      "gameMode": "NORMAL",
      "clients": [],
      "alivePlayers": [],
      "deadPlayers": [],
      "turnIdx": 0,
      "deck": [],
      "poolCards": [],
      "sharedCards": [],
      "addedCards": [],
      "removedCards": [],
      "currentHand": [],
      "currentPlayer": null,
      "prevPlayer": null,
      "START_NUM_CARDS": 1,   // reset in init
      "MAX_NUM_CARDS": 4,     // reset in init
      "MIN_NUM_PLAYERS": 1,
      "MAX_NUM_PLAYERS": 5,
      "pressedOk": 0
    }

    const payLoad = {
      "gameId" : gameId
    }

    io.of("/liars-poker").to(clientId).emit("create", payLoad);
  });

  //a client want to join
  client.on("join", (result) => {
    const clientId = result.clientId;
    const clientName = sanitizeInput(result.clientName);
    const gameId = sanitizeInput(result.gameId);
    const curGame = games[gameId];

    if(curGame == undefined) {
      io.of("/liars-poker").to(clientId).emit("home");
    }
    else {
      if(curGame.hostId == undefined) {
        curGame.hostId = clientId;
      }
      const payLoad = {
        "clientsBasicInfo": [],
        "hostId": curGame.hostId,
        "active": false,
        "success": true,
        "START_NUM_CARDS": -1,
        "MAX_NUM_CARDS": -1,
      }
      if(curGame.active) {
        payLoad.active = true;
        io.of("/liars-poker").to(clientId).emit("join", payLoad);
      }
      else if(curGame.clients.length >= 8) {
        payLoad.success = false;
        io.of("/liars-poker").to(clientId).emit("join", payLoad);
      }
      else {
        client.join(gameId, function() {
          // console.log(Object.keys(client.rooms).length);
        });
        client.gameId = gameId;
          
        curGame.clients.push({
          "clientId": clientId,
          "gameId": gameId,
          "clientName": clientName,
          "numCards": curGame.START_NUM_CARDS,
          "cards": [],
          "cardsAsStr": "",
          "cardsAsURL": "",
          "alive": true
        });
        
        switch(curGame.clients.length) {
          case 1:
            curGame.START_NUM_CARDS = 8;
            curGame.MAX_NUM_CARDS = 11;
            break;
          case 2:
            curGame.START_NUM_CARDS = 8;
            curGame.MAX_NUM_CARDS = 11;
            break;
          case 3:
            curGame.START_NUM_CARDS = 6;
            curGame.MAX_NUM_CARDS = 9;
            break;
          case 4:
            curGame.START_NUM_CARDS = 4;
            curGame.MAX_NUM_CARDS = 7;
            break;
          case 5:
            curGame.START_NUM_CARDS = 3;
            curGame.MAX_NUM_CARDS = 6;
            break;
          case 6:
            curGame.START_NUM_CARDS = 3;
            curGame.MAX_NUM_CARDS = 5;
            break;
          case 7:
            curGame.START_NUM_CARDS = 2;
            curGame.MAX_NUM_CARDS = 4;
            break;
          case 8:
            curGame.START_NUM_CARDS = 2;
            curGame.MAX_NUM_CARDS = 4;
            break;
        }
        payLoad.START_NUM_CARDS = curGame.START_NUM_CARDS;
        payLoad.MAX_NUM_CARDS = curGame.MAX_NUM_CARDS;
        
        curGame.clients.forEach(c => {
          payLoad.clientsBasicInfo.push({
            "clientName": c.clientName
          });
        });
        //loop through all clients and tell them that people has joined
        curGame.clients.forEach(c => {
          io.of("/liars-poker").to(c.clientId).emit("join", payLoad);
        });
      }
    }
  });

  client.on("changeGameMode", (result) => {
    const curGame = games[sanitizeInput(result.gameId)];
    curGame.gameMode = result.gameMode;
  });

  //a client calls for the game to begin (init)
  client.on("init", (result) => {
    //TODO: Need to add more backend stuff
    const curGame = games[sanitizeInput(result.gameId)];
    if(curGame.clients.length < 2) {
      io.of("/liars-poker").to(result.clientId).emit("failStart");
    }
    else {
      curGame.active = true;
      curGame.clients.forEach(c => {
        curGame.alivePlayers.push(c);
      });

      const numPlayers =  curGame.alivePlayers.length;
      curGame.alivePlayers.forEach(c => {
        c.numCards = curGame.START_NUM_CARDS;
      });
      nextRound(curGame);
      update(curGame);
    }
  });

  //a client want to change name
  client.on("changeName", (result) => {
    
    const curGame = games[sanitizeInput(result.gameId)];
    const clientName = sanitizeInput(result.clientName);
    curGame.clients.forEach(c => {
      if(c.clientId === result.clientId) {
        c.clientName = clientName;
      }
    });

    const payLoad = {
      "newClientName": clientName,
      "clientsBasicInfo": []
    }
    curGame.clients.forEach(c => {
      payLoad.clientsBasicInfo.push({
          "clientName": c.clientName
      });
    });

    curGame.clients.forEach(c => {
      io.of("/liars-poker").to(c.clientId).emit("changeName", payLoad);
    });
  });

  //a client takes his turn (or attempts to)
  client.on("takeTurn", (result) => {
    const curGame = games[sanitizeInput(result.gameId)]; 
    const payLoad = {
      "addedCardsStr": "",
      "removedCardsStr": "",
      "currentHandStr": "",
      "addedCardsURL": "",
      "removedCardsURL": "",
      "currentHandURL": "",
      "result": "",
      "requestedHandStr": sanitizeInput(result.nextHandStr)
    }

    try { 
      var nextHand = makeHand(sanitizeInput(result.nextHandStr));
      if(handCompare(nextHand, curGame.currentHand) <= 0) {
        payLoad.result = "ERROR: weaker_hand";
        io.of("/liars-poker").to(result.clientId).emit("takeTurn", payLoad);
      }
      else {
        var prevHand = [];
        curGame.addedCards = [];
        curGame.removedCards = [];
        prevHand.push(...curGame.currentHand);
        curGame.currentHand = nextHand;
        curGame.prevPlayer = curGame.currentPlayer;
        curGame.turnIdx = (curGame.turnIdx + 1) % curGame.alivePlayers.length;
        curGame.currentPlayer = curGame.alivePlayers[curGame.turnIdx];
        curGame.addedCards.push(...curGame.currentHand);

        for(var i = prevHand.length - 1; i >= 0; i--) {
          var tp = false;
          for(var j = curGame.addedCards.length - 1; j >= 0; j--) {
            if(curGame.addedCards[j].rankVal === prevHand[i].rankVal && curGame.addedCards[j].suitVal === prevHand[i].suitVal) {
              tp = true;
              curGame.addedCards.splice(j, 1);
              break;
            }
          }
          if(!tp) {
            curGame.removedCards.push(prevHand[i]);
          }
        }
        payLoad.addedCardsStr = handAsString(curGame.addedCards);
        payLoad.removedCardsStr = handAsString(curGame.removedCards);
        payLoad.currentHandStr = handAsString(curGame.currentHand);
        payLoad.addedCardsURL = handAsURL(curGame.addedCards);
        payLoad.removedCardsURL = handAsURL(curGame.removedCards);
        payLoad.currentHandURL = handAsURL(curGame.currentHand);
        payLoad.result = "success";
        //update game screen for all clients
        curGame.alivePlayers.forEach(c => {
          io.of("/liars-poker").to(c.clientId).emit("takeTurn", payLoad);
        });
        curGame.deadPlayers.forEach(c => {
          io.of("/liars-poker").to(c.clientId).emit("takeTurn", payLoad);
        })
      }
    }
    catch(e) {
      payLoad.result = "ERROR: invalid_hand";
      io.of("/liars-poker").to(result.clientId).emit("takeTurn", payLoad);
    }
  });

  //a client challenges
  client.on("challenge", (result) => {
    const curGame = games[sanitizeInput(result.gameId)]; 
    const payLoad = {
      "gameContains": false,
      "playerEliminated": false,
      "eliminatedPlayerStr": null,
      "winnerDetermined": false,
      "winnerPlayerStr": null,
      "cardsInPlayStr": handAsString(curGame.poolCards),
      "currentHandStr": handAsString(curGame.currentHand),
      "cardsInPlayURL": handAsURL(curGame.poolCards),
      "currentHandURL": handAsURL(curGame.currentHand),
      "prevPlayerStr": curGame.prevPlayer.clientName,
      "currentPlayerStr": curGame.currentPlayer.clientName,
      "targetPlayer": null
    }

    if(gameContains(curGame)) {
      curGame.currentPlayer.numCards++;
      payLoad.gameContains = true;
    }
    else {
      curGame.prevPlayer.numCards++;
    }

    for(var i = curGame.alivePlayers.length - 1; i >= 0; i--) {
      if(curGame.alivePlayers[i].numCards === curGame.MAX_NUM_CARDS) {
        curGame.alivePlayers[i].numCards = 0;
        curGame.alivePlayers[i].cards = [];
        curGame.alivePlayers[i].cardsAsStr = "";
        curGame.alivePlayers[i].cardsAsURL = "",
        curGame.alivePlayers[i].alive = false;

        curGame.deadPlayers.push(curGame.alivePlayers[i]);
        payLoad.playerEliminated = true;
        payLoad.eliminatedPlayerStr = curGame.alivePlayers[i].clientName;
        curGame.alivePlayers.splice(i, 1);
      }
    }

    if(curGame.alivePlayers.length === 1) { //TODO: is 0 when testing; 1 normally
      payLoad.winnerDetermined = true;
      payLoad.winnerPlayerStr = curGame.alivePlayers[0].clientName;
    }
    else {
      nextRound(curGame); // probably is going to change - institute approve menu
    }
    //update game screen for all clients
    curGame.alivePlayers.forEach(c => { // TODO: fix all this
      payLoad.targetPlayer = c;
      io.of("/liars-poker").to(c.clientId).emit("challenge", payLoad);
    });
    curGame.deadPlayers.forEach(c => { // This is just a stopgap; needs fixing
      payLoad.targetPlayer = c;
      io.of("/liars-poker").to(c.clientId).emit("challenge", payLoad);
    });
  });

  client.on("ok", (result) => {
    const curGame = games[sanitizeInput(result.gameId)];
    curGame.pressedOk++;
    const payLoad = {
      "num_ok_needed": curGame.alivePlayers.length - curGame.pressedOk
    }
    if(payLoad.num_ok_needed === 0) {
      curGame.pressedOk = 0;
      update(curGame);
    }
    else {
      io.of("/liars-poker").to(result.clientId).emit("ok", payLoad);
    }
  });

  client.on("home", (result) => {

    const curGame = games[sanitizeInput(result.gameId)];
    client.leave(result.gameId, function() {
      // console.log(client.id + " now in rooms ", client.rooms);
    });
    curGame.clients.splice(curGame.clients.indexOf(result.client), 1);
    if(curGame.alivePlayers.indexOf(result.client) !== -1) {
      curGame.alivePlayers.splice(curGame.alivePlayers.indexOf(result.client), 1);
    }
    if(curGame.deadPlayers.indexOf(result.client) !== -1) {
      curGame.deadPlayers.splice(curGame.deadPlayers.indexOf(result.client), 1);
    }
    if(curGame.clients.length === 0) {
      delete games[sanitizeInput(result.gameId)];
    }
    client.gameId = undefined;

    io.of("/liars-poker").to(result.clientId).emit("home");
  });
  
});

io.of("/test").on('connection', client => {
  // console.log('Client connected: Test');

  client.on("join", () => {
    // console.log("Test function recieved");
  });
});

function populateDeck() {
  var deck = [];

  for(var i = 0; i < values.length; i++)
  {
    for(var j = 1; j < suits.length; j++)
    {
      var card = {
        "text": values[i] + "_of_" + suits[j],
        "rank": values[i],
        "suit": suits[j],
        "rankVal": i + 2,
        "suitVal": j,
        "imgURL": '/img/' + values[i] + "_of_" + suits[j] + '.png'
      }
      deck.push(card);
    }
  }
  return deck;
}

function nextRound(curGame) {
  curGame.deck = new Deck(populateDeck()).shuffle();
  curGame.poolCards = [];
  curGame.sharedCards = [];
  curGame.addedCards = [];
  curGame.removedCards = [];
  curGame.currentHand = [];

  curGame.alivePlayers.forEach(c => {
      c.cards = [];
      for(var i = 0; i < c.numCards; i++) {
          const curCard = curGame.deck.draw();
          c.cards.push(curCard);
          curGame.poolCards.push(curCard);
      }
      c.cards.sort((a, b) => cardCompare(b, a));
      c.cardsAsStr = handAsString(c.cards);
      c.cardsAsURL = handAsURL(c.cards);
  });
  if(curGame.gameMode === "HOLD_EM") {
      for(var i = 0; i < 5; i++) {
          const curCard = curGame.deck.draw();
          curGame.poolCards.push(curCard);
          curGame.sharedCards.push(curCard);
          curGame.currentHand.push(curCard);
      }
  }
  else if(curGame.gameMode === "NORMAL") {
      curGame.currentHand.push({
          "text": "2_of_null",
          "rank": '2',
          "suit": '?',
          "rankVal": 2,
          "suitVal": 0,
          "imgURL": '/img/2_of_null.png'
      }); // TODO: fully implement null suit
  }

  curGame.poolCards.sort((a, b) => cardCompare(b, a));
  //TODO: shuffle player
  curGame.turnIdx = Math.floor(Math.random() * curGame.alivePlayers.length);
  curGame.currentPlayer = curGame.alivePlayers[curGame.turnIdx];
  curGame.prevPlayer = curGame.alivePlayers[floorMod(curGame.turnIdx - 1, curGame.alivePlayers.length)];
}

function update(curGame) {
  const payLoad = {
      "isCurrentPlayer": false,
      "targetPlayer": null,
      "alivePlayersBasicInfo": [], 
      "gameMode": curGame.gameMode,
      "sharedCardsStr": handAsString(curGame.sharedCards),
      "currentHandStr": handAsString(curGame.currentHand),
      "sharedCardsURL": handAsURL(curGame.sharedCards),
      "currentHandURL": handAsURL(curGame.currentHand),
      "currentPlayerName": curGame.currentPlayer.clientName
  }
  curGame.alivePlayers.forEach(c => {
      payLoad.alivePlayersBasicInfo.push({
          "clientName": c.clientName,
          "numCards": c.numCards
      });
  });

  curGame.alivePlayers.forEach(c => {
      payLoad.targetPlayer = c;
      if(c.clientId === curGame.currentPlayer.clientId) {
          payLoad.isCurrentPlayer = true;
      }
      else {
          payLoad.isCurrentPlayer = false;
      }
      io.of("/liars-poker").to(c.clientId).emit("update", payLoad);
  });
  curGame.deadPlayers.forEach(c => {
    payLoad.targetPlayer = c;
    if(c.clientId === curGame.currentPlayer.clientId) {
        payLoad.isCurrentPlayer = true;
    }
    else {
        payLoad.isCurrentPlayer = false;
    }
    io.of("/liars-poker").to(c.clientId).emit("update", payLoad);
  });
}

function gameContains(curGame) {
  var pool = [];
  curGame.poolCards.forEach(c => {
      pool.push(c);
  });
  pool.sort((a, b) => cardCompare(b, a));

  var res = true;
  curGame.currentHand.forEach(c => {
      curGame.poolCards.forEach(p => {
          if((p.rankVal !== c.rankVal || p.suitVal !== c.suitVal) && (p.suitVal !== 0 && c.suitVal !== 0)) {
              res = false;
          }
      })
      pool.splice(pool.indexOf(c), 1);
  });
  return res;
}

function cardCompare(a, b) {
  if(a.rankVal > b.rankVal) return 1;
  else if(a.rankVal < b.rankVal) return -1;
  else {
      if(a.suitVal > b.suitVal) return 1;
      else if(a.suitVal < b.suitVal) return -1;
  }
  return 0;
}

function makeGameId(length) {
  var str = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for(var i = 0; i < length; i++) {
     str += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return str;
}

function floorMod(n, m) {
  return Math.floor(((n % m) + m) % m);
}

function sanitizeInput(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}