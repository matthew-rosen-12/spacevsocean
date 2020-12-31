
const Player = require('./player');
const Image = require('./image');
const Special = require('./special');
// rewrite this as a function latere
const ASSET_NAMES = [
  'starry_night_one.jpg',
  'starry_night_two.jpg',
  'starry_night_three.jpg',
  'ocean_one.jpg',
  'ocean_two.jpg',
  'ocean_three.jpg',
  'ocean_four.jpg',
  'ocean_five.jpg',
  'ocean_six.jpg',
];
const PLAYER_ASSETS = [
  [
  'coral_one.jpg',
  'mussels_one.jpg',
  'submarine_one.jpg',
  'volcano_one.jpg',
  'jellyfish_one.jpg',
  ],
  [
  'comet_one.jpg',
  'galaxy_one.jpg',
  'moon_one.jpg',
  'satellite_one.jpg',
  'space_rock_one.jpg',
  ]
]

const SPECIALS_LIST = [
  'flipCardPlus.jpg',
  'flipCardMinus.png',
  'rotateCardClockwise.png',
  'rotateCardCounterClockwise.png',
]

const bigFlipArrayPlus = [
  [0,1],
  [1,0],
]

const bigFlipArrayMinus = [
  [0,-1],
  [-1,0],
]

const bigFlipArrayCounterclockwise = [
  [.707,-.707],
  [.707,.707],
]

const bigFlipArrayClockwise = [
  [.707,.707],
  [-.707,.707],
]

function matrixMultiplaction(matrix, vector){
  xCord = Math.round(vector[0]*matrix[0][0]+vector[1]*matrix[0][1]);
  yCord = Math.round(vector[0]*matrix[1][0]+vector[1]*matrix[1][1]);
  return [xCord,yCord];
}

function makeImageList(){
  var imageList = {};
  ASSET_NAMES.forEach(function(item,index){
    imageList[index] = new Image(index, item, [Math.floor(index/3)-1, (index)%3-1], false);
  });
  return imageList;
}

function makeSpecials(){
  var specials = [];
  SPECIALS_LIST.forEach(function(item,index){
    specials.push(new Special(index, item, index));
  });
  return specials;
}

var playerCounter = 0;

class Game {

  makeImageList(index){
    ASSET_NAMES[index].forEach(constructImage(item,index,imageList))
    return this.imageList;
  }

  constructImage(item, index, imageList) {
    this.imageList[index] = new Image(index, item, [Math.floor(index/3)-1, (index)%3-1], false);
  }

  constructor() {
    this.collageSrc = '/assets/starter.jpg';
    this.specials= makeSpecials();
    this.sockets = {};
    this.players = {};
    this.images = makeImageList();

    this.gameOver = false;
    this.noTurnsLeft = 1+2*(PLAYER_ASSETS[0].length+SPECIALS_LIST.length);

    this.winner = null;
  }

  replaceImage(id, replacementName, socket){
    this.images[id]= new Image(this.images[id].id, replacementName, this.images[id].cord);
    this.players[socket.id].removeFromInventory(replacementName);
  }

  destroySpecial(id, socket){
    this.players[socket.id].removeFromSpecials(id);
  }

  addPlayer(name, socket) {
    this.sockets[socket.id] = socket;
    playerCounter = (playerCounter + 1) % 2;
    this.players[socket.id] = new Player(socket.id, name, PLAYER_ASSETS[playerCounter],this.specials);
    }

  handleRotation(i, socket) {
    this.images[i].rotate(this.players[socket.id].degrees);
    return this.images[i].rotation;
  }

  handleBigFlip(dir) {
    if (dir==0){
      for (const [key, value] of Object.entries(this.images)) {
        value.updateCord(matrixMultiplaction(bigFlipArrayPlus,value.cord));
      }
    }
    else if (dir==1){
      for (const [key, value] of Object.entries(this.images)) {
        value.updateCord(matrixMultiplaction(bigFlipArrayMinus,value.cord));
      }
    }
    else if (dir==2){
      for (const [key, value] of Object.entries(this.images)) {
        value.updateCord(matrixMultiplaction(bigFlipArrayClockwise,value.cord));
      }
    }
    else if (dir==3){
      for (const [key, value] of Object.entries(this.images)) {
        value.updateCord(matrixMultiplaction(bigFlipArrayCounterclockwise,value.cord));
      }
    }
  }

  gridUpdate(){
    var dictionary = this.images;

    var updatedImages = [];
    for (const [key, value] of Object.entries(dictionary)) {
      updatedImages.push(value);
    }

    updatedImages.sort(function(a,b){
      return 3*a.cord[0]+a.cord[1]-(3*b.cord[0]+b.cord[1]);
    });
    return updatedImages;
  }

  playerInventory(socket){
    return this.players[socket.id].inventory;
  }

  playerSpecials(socket){
    return this.players[socket.id].specials;
  }

  getNecessaryAssets(socket){
    return ASSET_NAMES.concat(PLAYER_ASSETS[0]).concat(PLAYER_ASSETS[1]).concat(SPECIALS_LIST);
  }

  playerUsername(socket){
    return this.players[socket.id].name;
  }

  collageSrcGetter(){
    return this.collageSrc;
  }

  collageSrcSetter(collageSrc){
    this.collageSrc = collageSrc;
  }

  cleanGame(){
    this.sockets = {};
    this.players = {};
    this.noTurnsLeft = 1+2*(PLAYER_ASSETS[0].length+SPECIALS_LIST.length);
  }

  turnsUpdate(){
    this.noTurnsLeft -= 1;
    if(this.noTurnsLeft == 0){
      this.gameOver = true;
    } 
  }

  gameOverGetter(){
    return this.gameOver;
  }

  gameOnSetter(){
    this.gameOver = false;
  }

  winnerSetter(winner){
    this.winner = winner;
  }

  winnerGetter(){
    return this.winner;
  }

  otherSocketIDGetter(socket){
    let othersocketIDs = Object.keys(this.sockets).filter(function(socketID) {
      return socketID !== socket.id;
    });
    return othersocketIDs[0];
  }

}

module.exports = Game;

