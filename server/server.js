const Game = require('./game');

const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const socketio = require('socket.io');
const webpackConfig = require('../webpack.dev.js');

const app = express();
app.use(express.static('public'));

if (process.env.NODE_ENV === 'development') {
  // Setup Webpack for development
  const compiler = webpack(webpackConfig);
  app.use(webpackDevMiddleware(compiler));
} else {
  // Static serve the dist/ folder in production
  app.use(express.static('dist'));
}

const port = process.env.PORT || 3000;

const server = app.listen(port);
console.log(`Server listening on port ${port}`);

const io = socketio(server);

var roomsDict = {};
var noPlayers=0;

var gamesDict={};

var overGames = [];

var games = [];

var prevGame;

var oceanPoints = 0;
var spacePoints = 0;

const spectateRoom = 'spectate';

io.on('connection', socket => {
  console.log('Player connected!', socket.id);
  getLeaderboard(socket);

  // for games
  socket.on('new player', function(name){
    noPlayers +=1;
    if(noPlayers%2==1){
      roomsDict[socket.id] = noPlayers;
      socket.join(noPlayers);
      if(overGames.length == 0){
        gamesDict[socket.id] = new Game();
        prevGame = gamesDict[socket.id];
        games.push(gamesDict[socket.id]);
      }
      else{
        gamesDict[socket.id] = overGames.shift();
        prevGame = gamesDict[socket.id];
        gamesDict[socket.id].gameOnSetter();
        gamesDict[socket.id].cleanGame();
      }
    }
    else{
      gamesDict[socket.id] = prevGame;
      roomsDict[socket.id] = noPlayers-1;
      socket.join(noPlayers-1);
      toggleTurns(socket);
    }
    newPlayer(name,socket);
  });

  socket.on('new game', newGame);

  socket.on('rotate image', function(i){
    handleRotation(i, socket);
  });
  socket.on('big flip', function(dir){
    handleBigFlip(dir, socket);
  });
  socket.on('replace image', function(id, replacementName){
    replaceImage(id, replacementName, socket);
  });
  socket.on('destroy special', function(id){
    destroySpecial(id, socket);
  });

  socket.on('toggle turns', function(){
    toggleTurns(socket);
  });

  socket.on('predictions report', function(predictions){
    determineWinner(predictions, socket);
  });

  // for spectating
  socket.on('new spectator', function(){
    if(socket.id in gamesDict){
      //test if socket actually leaves game room if becoming spectator
      delete gamesDict[socket.id];
      socket.leave(roomsDict[socket.id]);
      delete roomsDict[socket.id];
    }
    socket.join(spectateRoom);
    socket.emit('collageSrc refresh', allCollageSrcGetter());
  });

  socket.on('collageSrc update', function(collageSrc){
    collageSrcUpdate(collageSrc, socket);
  });

  socket.on('remove spectator', function(){
    socket.leave(spectateRoom);
  });

  socket.on('disconnecting', () => {
    // if socket was a player
    if(socket.id in gamesDict){
      if(gamesDict[socket.id].otherSocketIDGetter(socket)==null){
        // if socket was last player and disconnected, game is not broadcast to spectators
        // to broadcast, add socket.emit('your turn'); right here
        noPlayers -= 1;
      }
      else{
        socket.to(gamesDict[socket.id].otherSocketIDGetter(socket)).emit('your turn');
      }
      if(!gamesDict[socket.id].gameOverGetter()){
        gameOver(socket);
      }
      delete gamesDict[socket.id];
      delete roomsDict[socket.id];
    }

  });

});

// for main game
function replaceImage(id, replacementName, socket){
  gamesDict[socket.id].replaceImage(id, replacementName, socket);
  list = gamesDict[socket.id].gridUpdate();
    socket.emit('inventory update', gamesDict[socket.id].playerInventory(socket));
    io.to(roomsDict[socket.id]).emit('grid update', list);
}

function newPlayer(name,socket){
  gamesDict[socket.id].addPlayer(name,socket);
  socket.emit('necessary assets', gamesDict[socket.id].getNecessaryAssets(socket));
}

function removePlayer(socket){
  gamesDict[socket.id].removePlayer(socket);
}

function newGame(){
  this.emit('grid update', gamesDict[this.id].gridUpdate());
  this.emit('inventory update', gamesDict[this.id].playerInventory(this));
  this.emit('specials update', gamesDict[this.id].playerSpecials(this));
  this.emit('username update', gamesDict[this.id].playerUsername(this));
}

function handleRotation(i,socket){
  io.to(roomsDict[socket.id]).emit('rotate image global', i, gamesDict[socket.id].handleRotation(i,socket));
}

function handleBigFlip(dir, socket){
  gamesDict[socket.id].handleBigFlip(dir);
  list = gamesDict[socket.id].gridUpdate();
  io.to(roomsDict[socket.id]).emit('grid update', list);
}

function destroySpecial(id, socket){
  gamesDict[socket.id].destroySpecial(id, socket);
  socket.emit('specials update', gamesDict[socket.id].playerSpecials(socket));
}

function toggleTurns(socket){
  socket.emit('not your turn');
  socket.to(gamesDict[socket.id].otherSocketIDGetter(socket)).emit('your turn');
  gamesDict[socket.id].turnsUpdate();
  if(gamesDict[socket.id].gameOverGetter()){
    gameOver(socket);
  }
}

function gameOver(socket){
  io.to(roomsDict[socket.id]).emit('game over');
  overGames.push(gamesDict[socket.id]);
}

function determineWinner(predictions, socket){

  var winner = 'space';

  var previousWinner = gamesDict[socket.id].winnerGetter();

  if(predictions[0]>=0.5){
    if(previousWinner == null){
      gamesDict[socket.id].winnerSetter('Space');
      spacePoints ++;
    }
    else if(previousWinner == 'Ocean'){
      gamesDict[socket.id].winnerSetter('Space');
      oceanPoints --;
      spacePoints ++;
    }
  }
  else{
    if(previousWinner == null){
      gamesDict[socket.id].winnerSetter('Ocean');
      oceanPoints ++;
    }
    else if(previousWinner == 'Space'){
      gamesDict[socket.id].winnerSetter('Ocean');
      spacePoints --;
      oceanPoints ++;
    }
    winner = 'Ocean';
  }

  leaderboardUpdate();

  io.to(roomsDict[socket.id]).emit('winner', winner);

}

function leaderboardUpdate(){
  io.emit('leaderboard update', spacePoints, oceanPoints);
}

function getLeaderboard(socket){
  socket.emit('leaderboard update', spacePoints, oceanPoints);
}

// for spectating
function allCollageSrcGetter(){
  var collageSrcList = [];
  var counter = 0;

  games.forEach(function(game){
    collageSrcList.push(game.collageSrcGetter());
  });
  return collageSrcList;
}

function collageSrcUpdate(collageSrc, socket){
  currentGame = gamesDict[socket.id];
  index = games.indexOf(currentGame);
  gamesDict[socket.id].collageSrcSetter(collageSrc);
  io.to(spectateRoom).emit('collageSrc update global', collageSrc, index);
}