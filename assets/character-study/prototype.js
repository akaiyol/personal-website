// Character study: paths are sampled into Unicode Braille, never displayed as vector art.
const style = document.createElement('link');
style.rel = 'stylesheet'; style.href = 'assets/character-study/prototype.css'; document.head.append(style);
document.title = 'Yolanda | character prototype';
document.body.className = 'character-study';
document.body.insertAdjacentHTML('beforeend', `<section class="study-shell" aria-label="Character prototype"><div class="study-header"><span>yolanda@web:~/character-study</span><a href="index.html#about-me">[ back to site ]</a></div><div class="study-stage"><canvas width="384" height="528" class="actor" role="img" aria-label="Yolanda in Braille artwork, wearing a captain’s cap, bow dress and boots, with short hair and a cheek bandage"></canvas><div class="dialogue"><span class="speaker">yolanda</span><p>I hope everyone looks ahead with excitement and curiosity rather than tenseness and mistrust.</p></div><div class="panel left" aria-hidden="true"></div><div class="panel right" aria-hidden="true"></div></div><div class="study-controls" role="group" aria-label="Character movements"><button data-mode="idle" aria-pressed="true">[ idle ]</button><button data-mode="delight" aria-pressed="false">[ delight ]</button><button data-mode="curious" aria-pressed="false">[ curious ]</button><button id="entrance">[ entrance ]</button><button id="pause" aria-pressed="false">[ pause ]</button></div></section>`);
const actor = document.querySelector('.actor'), canvas = document.createElement('canvas');
canvas.width=192; canvas.height=256;
const display=actor.getContext('2d');
const c=canvas.getContext('2d',{willReadFrequently:true});
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let mode='idle', paused=false, elapsed=0, previous=0, raf=0, lastDraw=-100, entering=false, entranceStart=0;
function path(d,fill='#aaa',stroke='#fff',width=2){const p=new Path2D(d);if(fill){c.fillStyle=fill;c.fill(p)}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke(p)}}
function ellipse(x,y,rx,ry,fill,stroke){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=1.3;c.stroke()}}
function limb(x,y,angle,shape,fill){c.save();c.translate(x,y);c.rotate(angle);path(shape,fill);c.restore()}
function draw(t){
 c.clearRect(0,0,192,256);
 const walking=entering&&!reduced.matches, gait=walking?Math.sin(t*11):Math.sin(t*1.8), joy=mode==='delight', curious=mode==='curious';
 const breath=Math.sin(t*2.1)*.8, bounce=joy?Math.abs(Math.sin(t*4))*2:0;
 c.save();c.translate(0,breath-bounce);
 // Boots, legs, swing from the hip rather than detached feet.
 for(const [x,phase] of [[83,1],[108,-1]])limb(x,207,walking?gait*.24*phase:0,'M-5 0 L6 0 L6 17 L9 27 Q4 31 -8 28 L-7 15 Z','#555');
 // Arms attach behind the sleeves; delight raises both hands.
 limb(66,157,joy?2+Math.sin(t*4)*.12:walking?gait*.35:-.12,'M-5 0 Q-11 10 -9 25 Q-14 34 -5 37 Q3 37 2 29 L5 4 Z','#aaa');
 limb(126,157,joy?-2-Math.sin(t*4)*.12:curious?-.55:walking?-gait*.35:.12,'M-5 0 L5 4 Q11 18 9 27 Q15 35 6 38 Q-2 38 -1 29 Z','#aaa');
 // Bell-shaped sailor dress with double hem and separate collar/bow.
 path('M78 146 Q95 139 113 146 L128 159 L121 170 Q120 189 133 211 Q96 227 59 211 Q72 188 70 170 L62 161 Z','#666');
 path('M62 161 L70 166 M122 166 L129 160 M61 207 Q95 222 131 207',null);
 path('M82 137 L81 151 Q96 162 111 151 L109 137','#bbb');
 path('M77 148 L94 157 L85 169 L75 151 M114 148 L97 157 L106 169 L117 152','#ddd');
 path('M95 159 Q79 150 82 165 L91 172 L95 164 L99 174 L108 165 Q111 152 97 159','#aaa');
 ellipse(96,162,2.8,3,'#fff');
 for(const y of [180,192,204])ellipse(96,y,1.8,2,'#fff');
 // Narrow shoulder bag from the supplied outfit.
 path('M67 151 L57 190',null,'#fff',2);
 path('M54 175 L64 177 L57 209 L47 207 Z','#222');
 path('M57 180 L52 202',null,'#fff',1.4);
 // Head and hat lean together; body stays rooted.
 c.save();c.translate(96,112);c.rotate(curious?-.12+Math.sin(t*1.4)*.025:Math.sin(t*1.2)*.025);c.translate(-96,-112);
 ellipse(96,107,44,43,'#555','#fff');
 ellipse(54,117,7,10,'#aaa','#fff');ellipse(138,117,7,10,'#aaa','#fff');
 path('M57 99 Q58 72 96 75 Q133 76 135 99 L133 121 Q125 148 97 150 Q68 148 59 125 Z','#111');
 // Side-swept hair and curved side locks.
 path('M56 100 Q56 73 92 73 Q128 72 136 99 L133 127 L127 135 Q129 113 124 103 Q104 104 85 88 Q77 103 63 105 L65 126 L60 131 Z','#111');
 const blink=!reduced.matches&&(t%5.4>5.13), happy=joy;
 for(const x of [78,113]){
  if(blink||happy)path(`M${x-7} 117 Q${x} ${happy?106:119} ${x+7} 117`,null,'#fff',2.4);
  else {ellipse(x,114,8,11,'#fff');ellipse(x+2,115,4,8,'#111');ellipse(x+3,111,1.6,2,'#fff');path(`M${x-7} 108 l-3 -4`,null);}
 }
 path('M93 123 Q96 120 100 123 L97 126 Z','#fff',null);
 path(joy?'M87 131 Q96 146 106 130 Q96 135 87 131':'M87 133 Q96 139 105 132',null,'#fff',1.8);
 c.save();c.translate(120,131);c.rotate(-.5);path('M-8 -3 L7 -3 L7 3 L-8 3 Z','#ddd');path('M-3 -2 L-3 2 M2 -2 L2 2',null,'#555',.8);c.restore();
 // Wide captain cap, band, visor and winged badge.
 path('M49 82 Q43 44 75 37 Q98 28 121 39 Q150 48 143 83 Q100 97 49 82 Z','#555');
 path('M49 76 Q94 87 143 76 L144 86 Q97 99 49 86 Z','#ddd');
 path('M47 86 Q95 99 146 84 Q133 107 97 101 Q65 99 47 86 Z','#333');
 path('M57 88 Q95 99 136 89',null);
 ellipse(97,61,6,7,'#ddd');path('M89 59 L75 53 L78 63 L90 67 M105 59 L119 53 L116 63 L104 67','#ddd');
 c.restore();
 if(joy){for(const [x,y] of [[40,89],[152,100]])path(`M${x} ${y-7} L${x+2} ${y-2} L${x+7} ${y} L${x+2} ${y+2} L${x} ${y+7} L${x-2} ${y+2} L${x-7} ${y} L${x-2} ${y-2} Z`,'#fff',null)}
 if(curious){c.fillStyle='#fff';c.font='22px monospace';c.fillText('?',149,66)}
 c.restore();
 const sample=document.createElement('canvas'); sample.width=128; sample.height=176; const sc=sample.getContext('2d');sc.drawImage(canvas,0,0,128,176);
 const data=sc.getImageData(0,0,128,176).data, rows=[];
 const bits=[[0,0,1],[0,1,2],[0,2,4],[1,0,8],[1,1,16],[1,2,32],[0,3,64],[1,3,128]];
 for(let y=0;y<176;y+=4){let row='';for(let x=0;x<128;x+=2){let b=0;for(const [dx,dy,bit]of bits){const px=x+dx,py=y+dy,i=(py*128+px)*4;let hash=Math.imul(px+17,374761393)^Math.imul(py+41,668265263);hash=Math.imul(hash^(hash>>>13),1274126177);const threshold=((hash^(hash>>>16))>>>0)/4294967296*240; if(data[i+3]>100&&data[i]>threshold)b|=bit}row+=String.fromCodePoint(0x2800+b)}rows.push(row)}
 display.clearRect(0,0,384,528); display.fillStyle='#c5b5ec';
 rows.forEach((row,cy)=>[...row].forEach((char,cx)=>{const code=char.codePointAt(0)-0x2800;for(const [dx,dy,bit] of bits)if(code&bit){display.beginPath();display.arc((cx*2+dx)*3+1.5,(cy*4+dy)*3+1.5,.94,0,Math.PI*2);display.fill()}}));
}
function frame(now){raf=0;if(paused||document.hidden)return;if(previous)elapsed+=Math.min((now-previous)/1000,.1);previous=now;
 if(entering){const age=elapsed-entranceStart;actor.style.setProperty('--walk-x',`${Math.min(0,-160+age*75)}px`);if(age>2.2){entering=false;actor.style.setProperty('--walk-x','0px')}}
 if(elapsed-lastDraw>1/12){draw(elapsed);lastDraw=elapsed}if(!reduced.matches)raf=requestAnimationFrame(frame)}
function resume(){previous=0;if(!raf&&!paused&&!document.hidden){draw(elapsed);if(!reduced.matches)raf=requestAnimationFrame(frame)}}
document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{mode=button.dataset.mode;document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));draw(elapsed);resume()}));
document.querySelector('#pause').addEventListener('click',e=>{paused=!paused;e.currentTarget.setAttribute('aria-pressed',String(paused));e.currentTarget.textContent=paused?'[ resume ]':'[ pause ]';if(paused){cancelAnimationFrame(raf);raf=0;panelAnimations.forEach(a=>a.pause())}else{if(!paused)panelAnimations.forEach(a=>a.play());resume()}});
let panelAnimations=[];
document.querySelector('#entrance').addEventListener('click',()=>{
 if(reduced.matches){entering=false;actor.style.setProperty('--walk-x','0px');draw(elapsed);return}
 if(paused)document.querySelector('#pause').click();
 panelAnimations.forEach(a=>a.cancel());
 panelAnimations=[...document.querySelectorAll('.panel')].map((p,i)=>p.animate([{transform:`translateX(${i?101:-101}%)`},{transform:'translateX(0)',offset:.32},{transform:'translateX(0)',offset:.55},{transform:`translateX(${i?101:-101}%)`}],{duration:1500,easing:'cubic-bezier(.65,0,.35,1)'}));
 entering=true;entranceStart=elapsed+.6;resume();
});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;previous=0;panelAnimations.forEach(a=>a.pause())}else{if(!paused)panelAnimations.forEach(a=>a.play());resume()}});
reduced.addEventListener('change',()=>{cancelAnimationFrame(raf);raf=0;panelAnimations.forEach(a=>a.cancel());entering=false;actor.style.setProperty('--walk-x','0px');resume()});
draw(0);resume();
