import * as tf from '@tensorflow/tfjs';
//const model = await tf.loadLayersModel('https://github.com/matthew-rosen-12/simple-cnn/raw/main/saved_model.pb');
import '@tensorflow/tfjs-backend-cpu';

import { getAsset } from './assets';


const MODEL_URL = '/model.json';


import { updateCollageSrc, reportPredictions } from './networking.js';

import { mergeNodesOntoCanvas } from './canvas.js';

export function recognize(image_list_nodes){
	let collage = document.createElement("img");
	collage.src = mergeNodesOntoCanvas(image_list_nodes);
	updateCollageSrc(collage.src);

	tf.loadLayersModel(MODEL_URL).then(model => {
		const classes = model.predict(tf.browser.fromPixels(collage).expandDims(0),{batchSize:10}).dataSync();
		reportPredictions(classes);
  	});

  	collage.remove();
}
