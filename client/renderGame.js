import { getAsset } from './assets';
import { newSpectator, rotate, bigFlip, replaceImage, destroySpecial, toggleTurns } from './networking.js';
import { recognize } from './tensorFlow.js';
import './css/main.css';

const playButton = document.getElementById('play-button');
const spectateButton = document.getElementById('spectate-button');
const usernameInput = document.getElementById('username-input');
const playMenu = document.getElementById('play-menu');

var yourTurn = false;
var turnCounter = 0;

let timeLeft = 10;
var timerInterval;

const grid = document.getElementsByClassName("grid-container")[0];


export function htmlYourTurn(){
  clearInterval(timerInterval);
  timeLeft = 10;
  yourTurn = true;
  timerInterval=window.setInterval(yourTurnCountDown, 1000);
}

function yourTurnCountDown(){
  document.getElementsByClassName('timer')[0].innerHTML='Time remaining: '+timeLeft.toString();
  timeLeft = timeLeft - 1;
  if(timeLeft==0){
    toggleTurns();
  }
}

export function htmlNotYourTurn(){
  clearInterval(timerInterval);
  timeLeft=10;
  yourTurn = false;
  timerInterval=window.setInterval(notYourTurnCountDown, 1000);
}

function notYourTurnCountDown(){
  document.getElementsByClassName('timer')[0].innerHTML='Opponent time remaining: '+timeLeft.toString();
  timeLeft = timeLeft - 1;
}

export function htmlRotateImage(i, degrees){
  const img = document.getElementById(i);
  img.name = degrees;
	img.style.transform=`rotate(${degrees}deg)`;
}

export function htmlGridUpdate(images){
  while (grid.firstChild) {
    grid.removeChild(grid.firstChild);
  }

  images.forEach(function(image,index){
      const c = getAsset(`${image.name}`).cloneNode(true); 
      c.classList.add("image"); c.id=image.id; c.name=image.rotation;
      grid.appendChild(c);
      htmlRotateImage(image.id,image.rotation)
  });
}

var clickedElement;

export function htmlInventoryUpdate(image_names){
  clickedElement = null;
  const inventory = document.getElementsByClassName("inventory")[0];
  while (inventory.firstChild) {
    inventory.removeChild(inventory.firstChild);
  }
  image_names.forEach(function(image_name,index){
    const copy = getAsset(`${image_name}`).cloneNode(true);
    copy.classList.add("small-image"); copy.id=100+index; copy.name=image_name;
    inventory.appendChild(copy);
  })
}

export function htmlSpecialsUpdate(images){
  const specialBox = document.getElementsByClassName("special-box")[0];
  while (specialBox.firstChild) {
    specialBox.removeChild(specialBox.firstChild);
  }
  images.forEach(function(image,index){
    const copy = getAsset(`${image.name}`).cloneNode(true);
    copy.classList.add("small-image"); copy.id=1000+image.id; copy.name=image.special;
    specialBox.appendChild(copy);
  })
}

document.body.addEventListener('click', event=> {

  if(yourTurn){

    if (event.target.id <=9 && event.target.id >=0){
      rotate(event.target.id);
    }
    if (event.target.id >=100 && event.target.id < 1000){
      if(event.target.classList.contains("clicked")){
        event.target.classList.remove("clicked");
        clickedElement=null;
      }
      else{
        if(clickedElement !== null){
          clickedElement.classList.remove("clicked");
        }
        event.target.classList.add("clicked");
        clickedElement= event.target;
      }
    }
    if(event.target.id>=1000){
      bigFlip(event.target.name);
      destroySpecial(event.target.id-1000);

      toggleTurns();
    }
  }

  if(event.target.id=='menu-button-2'){
    const menuButton= document.getElementById("menu-button-2");
    const timer = document.getElementsByClassName('timer')[0]
    playMenu.classList.remove('hidden');
    usernameInput.classList.remove('hidden');
    playButton.classList.remove('hidden');
    spectateButton.classList.remove('hidden');
    menuButton.classList.add("hidden");
    const winnerBanner = document.querySelector('span');
    winnerBanner.innerHTML = 'Space vs Ocean'; 
    document.getElementsByClassName("flex-parent-row")[2].classList.add("hidden");
    timer.innerHTML='Waiting for opponent...';
    timer.classList.add('hidden')
    document.getElementsByClassName('username')[0].innerHTML='';
  }

  return;
})

export function htmlGetWinner(){
  if(yourTurn){
    const grid = document.getElementsByClassName("grid-container")[0];
    let image_list_nodes = grid.childNodes;
    recognize(image_list_nodes);
  }

}

export function htmlReportWinner(winner){
  const winnerBanner = document.querySelector('span');
  winnerBanner.innerHTML = 'Winner is '+winner;
  const menuButton= document.getElementById("menu-button-2");
  menuButton.classList.remove("hidden");

  clearInterval(timerInterval);
  document.getElementsByClassName('timer')[0].innerHTML='Round Over';
  yourTurn= false;
}

export function htmlUpdateUsername(username){
  document.getElementsByClassName('username')[0].innerHTML=username
}

document.onkeydown = function(e) { 

  if (e.keyCode==37){
    bigFlip(1);
  }
  else if (e.keyCode==38){
    bigFlip(2);
  }

  if(yourTurn){
    if (e.keyCode>=49 && e.keyCode<=57){
      if(clickedElement){
        clickedElement.classList.remove("clicked");
        const grid = document.getElementsByClassName("grid-container")[0];
        replaceImage(grid.childNodes[e.keyCode-49].id, clickedElement.name);

        toggleTurns();
      }
    }
  }
}