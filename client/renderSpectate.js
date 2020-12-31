import { removeSpectator } from './networking.js';

const playButton = document.getElementById('play-button');
const spectateButton = document.getElementById('spectate-button');
const usernameInput = document.getElementById('username-input');
const playMenu = document.getElementById('play-menu');

let wrapper = document.getElementById('wrapper');
let spectateContainer = document.getElementsByClassName('spectate-container')[0];

// for the grid of grids
export function htmlSpectateRefresh(collageSrcList){
	 while (wrapper.firstChild) {
    	wrapper.removeChild(wrapper.firstChild);
  	}

	collageSrcList.forEach(function(collageSrc){
		console.log('collage src');
		console.log(collageSrc);
    	let collage = new Image();
		collage.src = collageSrc;
		collage.style.width = '20%';
		collage.style.height = '20%';
		wrapper.append(collage);
	});
}

// for a single grid
export function htmlSpectateUpdate(collageSrc, index){
    let collage = new Image();
	collage.src = collageSrc;
	collage.style.width = '20%';
	collage.style.height = '20%';

	if(wrapper.childNodes[index]){
		wrapper.insertBefore(collage, wrapper.childNodes[index]);
		wrapper.childNodes[index+1].remove();
	}
	else{
		wrapper.append(collage);
	}
}

spectateContainer.addEventListener('click', event=> {
  if(event.target.id=='menu-button'){
  	removeSpectator();
  	document.getElementById('play-menu').classList.remove('hidden');
  	playMenu.classList.remove('hidden');
    usernameInput.classList.remove('hidden');
    playButton.classList.remove('hidden');
    spectateButton.classList.remove('hidden');
	document.getElementsByClassName('spectate-container')[0].classList.add('hidden');
  }
  return;
})