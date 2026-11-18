'use strict';
importScripts('bloom-renderer.js?v=1');
self.onmessage=({data})=>{
  const sprite=FlowerBloom.render(data.plant,data.stage,data.params);
  const anchor=sprite.anchor,bitmap=sprite.transferToImageBitmap();
  self.postMessage({stage:data.stage,anchor,bitmap},[bitmap]);
};
