const assets = {};

function downloadPromise(necessaryAssets){
  return Promise.all(necessaryAssets.map(downloadAsset));
}

function downloadAsset(assetName) {
  return new Promise(resolve => {
    const asset = new Image();
    asset.onload = () => {
      console.log(`Downloaded ${assetName}`);
      assets[assetName] = asset;
      resolve();
    };
    asset.src = `/assets/${assetName}`;
  });
}

export const downloadAssets = necessaryAssets => downloadPromise(necessaryAssets);

export const getAsset = assetName => assets[assetName];