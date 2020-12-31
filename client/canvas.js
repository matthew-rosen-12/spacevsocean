import { getAsset } from './assets'; 

export function mergeNodesOntoCanvas(image_list_nodes){
	var canvas = document.createElement('canvas');

	canvas.width = 200;
	canvas.height = 200;
	let ctx = canvas.getContext("2d");
	var i;
	for (i = 0; i < image_list_nodes.length; i++) {
		const img = image_list_nodes[i];
		const xCord = (canvas.width/3)*(i%3);
		const yCord = (canvas.height/3)*(Math.floor(i/3));
		const centerXCord = xCord + canvas.width/6;
		const centerYCord = yCord + canvas.height/6;

		ctx.translate(centerXCord,centerYCord);
		ctx.rotate(parseInt(img.name)*Math.PI/180);
		ctx.drawImage(img,-centerXCord+xCord,-centerYCord+yCord, canvas.width/3, canvas.height/3);
		ctx.setTransform(1,0,0,1,0,0); // which is much quicker than save and restore	} 
	}
	const c = canvas.toDataURL();
	canvas.remove();
	return c;
}
