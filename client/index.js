import { newGame, newPlayer, newSpectator } from './networking';
import { downloadAssets } from './assets';
const playButton = document.getElementById('play-button');
const spectateButton = document.getElementById('spectate-button');
const usernameInput = document.getElementById('username-input');
const playMenu = document.getElementById('play-menu');

require("regenerator-runtime/runtime");

playButton.onclick = () => {
	newPlayer(usernameInput.value);
    document.getElementsByClassName("flex-parent-row")[2].classList.remove('hidden');
    document.getElementsByClassName("timer")[0].classList.remove('hidden');
    playMenu.classList.add('hidden');
    usernameInput.classList.add('hidden');
    playButton.classList.add('hidden');
    spectateButton.classList.add('hidden');
}

spectateButton.onclick = () => {
	newSpectator();
	document.getElementsByClassName('spectate-container')[0].classList.remove('hidden');
    playMenu.classList.add('hidden');
    usernameInput.classList.add('hidden');
    playButton.classList.add('hidden');
    spectateButton.classList.add('hidden');
}

export function playerGetNecessaryAssets(necessaryAssets){
	Promise.all([
	downloadAssets(necessaryAssets),
	]).then(()=>{
		newGame();
	})
}

export function htmlLeaderboardUpdate(spacePoints, oceanPoints){
    const oceanPointsHTML = document.getElementsByClassName('ocean-points')[0];
    oceanPointsHTML.innerHTML = oceanPoints;
    const spacePointsHTML = document.getElementsByClassName('space-points')[0];
    spacePointsHTML.innerHTML = spacePoints;
}
