import io from 'socket.io-client';
import { htmlReportWinner, htmlGetWinner, htmlRotateImage, htmlGridUpdate, htmlInventoryUpdate, htmlSpecialsUpdate, htmlUpdateUsername, htmlYourTurn, htmlNotYourTurn } from './renderGame';
import { playerGetNecessaryAssets, htmlLeaderboardUpdate } from './index';
import { htmlSpectateUpdate, htmlSpectateRefresh } from './renderSpectate';
const socketProtocol = (window.location.protocol.includes('https')) ? 'wss' : 'ws';
const socket = io(`${socketProtocol}://${window.location.host}`, { reconnection: false });

// for leaderboard
socket.on('leaderboard update', function(spacePoints, oceanPoints){
	htmlLeaderboardUpdate(spacePoints, oceanPoints);
})

// for game rooms
export function newPlayer(name){
	socket.emit('new player', name);
}

export function newGame(){
  	socket.emit('new game');
}
 
export function rotate(i){
	socket.emit('rotate image', i);
}

export function bigFlip(dir){
	socket.emit('big flip', dir);
}

export function replaceImage(id, replacementName){
	socket.emit('replace image', id, replacementName);
}

export function destroySpecial(id){
	socket.emit('destroy special', id);
}

export function reportPredictions(predictions){
	socket.emit('predictions report', predictions);
}

socket.on('color change global', function(i, color){
	htmlColorChange(i, color);
});

socket.on('rotate image global', function(i, degrees){
	htmlRotateImage(i, degrees);
});

socket.on('inventory update', function(image_names){
	htmlInventoryUpdate(image_names);
})

socket.on('grid update', function(images){
	htmlGridUpdate(images);
});

socket.on('necessary assets', function(necessaryAssets){
	playerGetNecessaryAssets(necessaryAssets);
})

socket.on('username update', function(username){
	htmlUpdateUsername(username);
})

socket.on('specials update', function(images){
	htmlSpecialsUpdate(images);
})

// for taking turns
export function toggleTurns(){
	socket.emit('toggle turns');
}

socket.on('your turn', function(){
	htmlYourTurn();
})

socket.on('not your turn', function(){
	htmlNotYourTurn();
})

socket.on('game over', function(){
	htmlGetWinner();
})

socket.on('winner', function(winner){
	htmlReportWinner(winner);
})

// for spectate rooms
export function newSpectator(){
	socket.emit('new spectator');
}

export function updateCollageSrc(collageSrc){
	socket.emit('collageSrc update', collageSrc);
}

export function removeSpectator(){
	socket.emit('remove spectator');
}

// refresh is for the grid of grids
socket.on('collageSrc refresh', function (collageSrcList){
	htmlSpectateRefresh(collageSrcList);
})

// refresh is for a single grid
socket.on('collageSrc update global', function (collageSrc, index){
	htmlSpectateUpdate(collageSrc, index);
})