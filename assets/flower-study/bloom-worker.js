'use strict';
importScripts('bloom-renderer.js?v=2','bloom-gpu.js?v=2');
let gpu=FlowerBloomGPU.create(),atlas=null,sprites=[];
function renderCanvas(items,params){
  const columns=Math.min(4,items.length),width=columns*480,height=Math.ceil(items.length/columns)*400;
  if(!atlas||atlas.width!==width||atlas.height!==height){atlas=new OffscreenCanvas(width,height);sprites=[];}
  const c=atlas.getContext('2d');c.clearRect(0,0,width,height);
  const frames=items.map((item,index)=>{
    const key=JSON.stringify([item.plant,params]),tile=[index%columns*480,Math.floor(index/columns)*400,480,400];let cached=sprites[index];
    if(!cached||cached.key!==key||cached.stage!==item.stage){cached=sprites[index]={key,stage:item.stage,sprite:item.stage>.4?FlowerBloom.render(item.plant,item.stage,params):null};}
    if(cached.sprite)c.drawImage(cached.sprite,20,130,480,400,tile[0],tile[1],480,400);
    return {id:item.plant.id,stage:item.stage,anchor:cached.sprite?.anchor||[0,0],tile};
  });
  return {canvas:atlas,frames};
}
self.onmessage=({data})=>{
  if(data.prepare){
    for(const plant of data.prepare)FlowerBloom.prepare(plant,data.params);
    if(gpu){try{gpu.renderBatch(data.prepare.map(plant=>({plant,stage:1})),data.params)?.canvas.transferToImageBitmap().close();}catch{gpu=null;}}
    return;
  }
  let result;
  try{result=gpu?.renderBatch(data.batch,data.params);}catch{gpu=null;}
  const renderer=result?'gpu':'canvas';if(!result)result=renderCanvas(data.batch,data.params);
  const bitmap=result.canvas.transferToImageBitmap();self.postMessage({frames:result.frames,bitmap,renderer},[bitmap]);
};
