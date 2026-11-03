// A monochrome character rig rendered as 2×4 Braille dot cells.
const stylesheet = document.createElement('link');
stylesheet.rel = 'stylesheet';
stylesheet.href = 'assets/character-study/prototype.css?v=2';
document.head.append(stylesheet);
document.title = 'Yolanda | character prototype';
document.body.className = 'character-study';
const quote = 'I hope everyone looks ahead with excitement and curiosity rather than tenseness and mistrust.';
document.body.insertAdjacentHTML('beforeend', `
  <section class="study-shell" aria-label="Character prototype">
    <div class="study-header"><span>yolanda@web:~/character-study</span><a href="index.html#about-me">[ back to site ]</a></div>
    <div class="study-stage">
      <canvas width="384" height="528" class="actor" role="img" aria-label="Yolanda in purple Braille artwork, with two braids, a cheek bandage, sailor collar and bow, pleated dress, shoulder bag and boots"></canvas>
      <div class="dialogue"><span class="speaker">yolanda</span><p class="spoken" aria-hidden="true"></p><p class="study-sr">${quote}</p><span class="dialogue-end" aria-hidden="true" hidden>▾</span></div>
      <div class="panel left" aria-hidden="true"></div><div class="panel right" aria-hidden="true"></div>
    </div>
    <div class="study-controls" role="group" aria-label="Character movements">
      <button data-mode="idle" aria-pressed="true">[ idle ]</button>
      <button data-mode="delight" aria-pressed="false">[ delight ]</button>
      <button data-mode="curious" aria-pressed="false">[ curious ]</button>
      <button id="talk">[ talk ]</button><button id="entrance">[ entrance ]</button>
      <button id="pause" aria-pressed="false">[ pause ]</button>
    </div>
  </section>`);
const actor = document.querySelector('.actor');
const output = actor.getContext('2d');
const surface = document.createElement('canvas');
surface.width = 192;
surface.height = 264;
const ink = surface.getContext('2d', { willReadFrequently: true });
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const spoken = document.querySelector('.spoken');
const endMark = document.querySelector('.dialogue-end');
const panels = [...document.querySelectorAll('.panel')];
const dotBits = [[0,0,1],[0,1,2],[0,2,4],[1,0,8],[1,1,16],[1,2,32],[0,3,64],[1,3,128]];

// Surface patterns are anchored in each moving part's local coordinates.
// Bright cloth trim and skin contrast with dark hair, fabric folds and leather.
function material(name) {
  const tile = document.createElement('canvas');
  tile.width = 192; tile.height = 264;
  const ctx = tile.getContext('2d');
  ctx.fillStyle = '#000'; ctx.fillRect(0,0,192,264);
  ctx.fillStyle = '#fff';
  for (let y=0; y<264; y++) for (let x=0; x<192; x++) {
    let h = Math.imul(x+31,374761393)^Math.imul(y+13,668265263);
    h = Math.imul(h^(h>>>13),1274126177);
    const value = ((h^(h>>>16))>>>0)/4294967296;
    const light = Math.max(0,Math.min(1,1-(x-48)/100));
    const density = name==='skin' ? .91+.07*light : name==='trim' ? .92 :
      name==='cloth' ? .10+.16*light : name==='hair' ? .025 : .035;
    if (value<density) ctx.fillRect(x,y,1,1);
  }
  return ink.createPattern(tile,'repeat');
}
const materials = Object.fromEntries(['skin','trim','cloth','hair','leather'].map(name=>[name,material(name)]));
function shape(d, fill='black', stroke='white', width=1.15) {
  const p = new Path2D(d);
  if(fill){ink.fillStyle=materials[fill]||fill;ink.fill(p)}
  if(stroke){ink.strokeStyle=stroke;ink.lineWidth=width;ink.lineCap='round';ink.lineJoin='round';ink.stroke(p)}
}
function oval(x,y,rx,ry,fill='black',stroke=null,width=1) {
  ink.beginPath();ink.ellipse(x,y,rx,ry,0,0,Math.PI*2);
  if(fill){ink.fillStyle=materials[fill]||fill;ink.fill()}
  if(stroke){ink.strokeStyle=stroke;ink.lineWidth=width;ink.stroke()}
}
function around(x,y,angle,draw) {
  ink.save();ink.translate(x,y);ink.rotate(angle);ink.translate(-x,-y);draw();ink.restore();
}
const clamp = v=>Math.max(0,Math.min(1,v));
const ease = v=>{v=clamp(v);return v*v*(3-2*v)};
let clock=0, previous=null, raf=0, lastDraw=-1, paused=false;
let mode='idle', emoteStart=0, entranceStart=null, talkStart=.65;
const letters = [];
let letterTime=0;
for(const letter of quote){letters.push(letterTime);letterTime+=/[,.!?]/.test(letter)?.25:letter===' '?.025:.037}
const talkDuration=letterTime+.15;
function setMode(next) {
  mode=next;emoteStart=clock;
  document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===next)));
}
function talkState(t) {
  if(reduced.matches)return {count:quote.length,active:false,syllable:0};
  const age=t-talkStart;
  let count=0;
  while(count<letters.length&&letters[count]<=age)count++;
  const last=quote[count-1]||'';
  const active=age>=0&&age<talkDuration;
  return {count,active,syllable:active&&!/[,.!? ]/.test(last)?Math.floor(age*11)%4:0};
}
function braid(x,side,t,strength) {
  around(x,87,side*.045+Math.sin(t*2.3-side*.7)*(.065+strength*.045),()=>{
    shape(`M${x-6} 88 Q${x-11} 105 ${x-6} 120 L${x+5} 120 Q${x+10} 101 ${x+5} 88 Z`,'hair');
    shape(`M${x} 103 Q${x-11} 105 ${x-7} 116 Q${x-11} 121 ${x-6} 127 Q${x-9} 133 ${x-5} 139 Q${x-7} 146 ${x} 151 Q${x+7} 146 ${x+5} 139 Q${x+9} 133 ${x+6} 127 Q${x+11} 121 ${x+7} 116 Q${x+11} 105 ${x} 103 Z`,'hair','white',1.1);
    for(let i=0;i<4;i++){
      const y=108+i*10, flip=i%2?1:-1;
      shape(`M${x-flip*5} ${y} Q${x} ${y+3} ${x+flip*5} ${y+7}`,null,'white',1.25);
      shape(`M${x-flip*2} ${y+1} Q${x+flip*3} ${y+3} ${x+flip*4} ${y+5}`,null,'white',.6);
    }
    shape(`M${x-4} 149 L${x+4} 149 L${x+4} 152 L${x-4} 152 Z`,'trim',null);
    shape(`M${x-4} 153 Q${x-7} 160 ${x} 165 Q${x+7} 160 ${x+4} 153`,'hair');
  });
}
function arm(x,side,angle) {
  around(x,139,angle,()=>{
    shape(`M${x-5} 140 Q${x-8} 154 ${x-5} 169 Q${x-10} 178 ${x-2} 181 Q${x+7} 181 ${x+5} 171 L${x+5} 142 Z`,'skin','white',1.25);
    shape(`M${x-7} 140 L${x+7} 140 L${x+8} 150 Q${x} 155 ${x-8} 150 Z`,'cloth');
    shape(`M${x-7} 148 Q${x} 152 ${x+7} 148`,null,'white',1.8);
    shape(`M${x+side*2} 171 l${side*2} 3`,null,'black',.7);
  });
}
function thinkingArm(amount) {
  // Bend at an actual elbow, bringing the hand to the chin instead of a sideward pose.
  around(124,139,-.10-.25*amount,()=>{
    shape('M119 140 Q116 151 120 159 L129 159 L129 141 Z','skin','white',1.25);
    around(124,155,amount*3.0,()=>{
      shape('M120 155 L120 171 Q115 177 121 182 Q130 185 130 177 L128 155 Z','skin','white',1.25);
      shape('M126 176 l1 3',null,'black',.7);
    });
    shape('M117 140 L131 140 L132 150 Q124 155 116 150 Z','cloth');
    shape('M117 148 Q124 152 131 148',null,'white',1.8);
  });
}
function boot(x,step) {
  around(x,206,step,()=>{
    shape(`M${x-5} 205 L${x+5} 205 L${x+5} 218 L${x-5} 218 Z`,'skin');
    shape(`M${x-7} 217 Q${x} 220 ${x+6} 217 L${x+7} 233 Q${x+12} 238 ${x+7} 241 L${x-8} 241 Q${x-10} 238 ${x-7} 233 Z`,'leather','white',1.4);
    shape(`M${x-7} 219 Q${x} 222 ${x+6} 219 M${x-8} 237 Q${x} 239 ${x+9} 237`,null,'white',1);
    shape(`M${x-4} 223 L${x-4} 231`,null,'white',.7);
  });
}
function draw(t) {
  const still=reduced.matches;
  if(still)t=0;
  const talk=talkState(clock);
  const entryAge=entranceStart===null?-1:clock-entranceStart;
  const walking=!still&&entryAge>1.05&&entryAge<3.4;
  const walkPhase=t*10.8;
  const age=clock-emoteStart;
  const envelope=still?1:ease(age/.35)*(1-ease((age-2.1)/.7));
  const joy=mode==='delight'?envelope:0;
  const curious=mode==='curious'?envelope:0;
  const sway=still?0:Math.sin(t*.95)*2.8;
  const breath=still?0:Math.sin(t*2)*1.1;
  const hop=joy*Math.max(0,Math.sin((age-.25)*7))*4.5;
  const walkBob=walking?Math.abs(Math.sin(walkPhase))*1.8:0;
  const gait=walking?Math.sin(walkPhase):0;
  ink.clearRect(0,0,192,264);
  boot(83,gait*.23);boot(109,-gait*.23);
  ink.save();ink.translate(sway,-hop-walkBob);
  around(96,207,still?0:Math.sin(t*.95)*.018,()=>{
    // Shoulder and braid attachments move with the torso, with delayed tips.
    braid(51,-1,t,joy+curious);braid(141,1,t,joy+curious);
    const speechWeight=talk.active?ease((clock-talkStart)/.3)*ease((talkStart+talkDuration-clock)/.3):0;
    const gesture=(Math.sin(t*3.1)*.15-.18)*speechWeight;
    arm(68,-1,.10+joy*1.95+gait*.38+(still?0:Math.sin(t*1.7)*.09));
    if(mode!=='curious')arm(124,1,-.10-joy*1.95-gait*.38+gesture-(still?0:Math.sin(t*1.7+.6)*.09));
    // Structured dress: bodice, waist seam, independent pleats, cuffs and double hem.
    shape('M77 127 Q96 122 115 127 L127 138 L122 154 L117 157 L119 170 Q123 187 133 207 Q96 220 59 207 Q69 187 73 170 L75 157 L70 154 L65 139 Z','cloth','white',1.4);
    shape('M76 158 Q96 162 116 158',null,'white',.8);
    shape('M74 171 Q96 175 119 171',null,'white',.9);
    shape('M79 177 Q76 193 72 204 M90 178 L88 208 M103 178 L105 208 M115 178 Q118 194 121 204',null,'white',.85);
    shape('M63 202 Q96 214 130 202 L132 207 Q96 220 60 207 Z','trim','white',.8);
    shape('M65 200 Q96 211 128 200',null,'white',.8);
    shape('M88 118 L87 130 Q96 138 106 130 L105 118 Z','skin');
    shape('M77 127 L91 137 L86 149 L74 133 Z','trim');
    shape('M115 127 L101 137 L106 149 L119 133 Z','trim');
    shape('M78 132 L86 139 M114 132 L106 139',null,'black',1.3);
    // Bow has a central knot, two rounded loops and two separated tails.
    shape('M94 140 Q81 131 81 143 Q84 151 94 145 L89 157 L96 153 L99 157 L100 145 Q111 151 112 141 Q111 132 98 140 Z','cloth','white',1.3);
    shape('M86 141 L92 143 M108 141 L101 143 M94 148 L93 152 M100 148 L101 152',null,'white',.7);
    oval(97,142,3,3,'trim','white');
    shape('M96 159 L96 196',null,'white',.65);
    for(const y of [163,177,191]){oval(98,y,2,2,'trim','white',.5);oval(98,y,.6,.6,'black')}
    // Separate leather bag and strap from the fabric, preserving a black border.
    shape('M77 131 Q63 148 60 182',null,'black',4);
    shape('M77 131 Q63 148 60 182',null,'white',1.5);
    shape('M52 173 L65 175 L64 200 Q57 204 49 199 Z','leather','white',1.3);
    shape('M52 174 L64 176 L63 182 L51 180 Z','cloth');
    shape('M55 181 L59 181 L59 185 L55 185 Z','trim',null);
    // Face and hair turn together; head sits in front of the collar.
    ink.save();ink.translate(0,breath);
    const nod=Math.sin(t*5.1)*.025*speechWeight;
    around(96,105,(still?0:Math.sin(t*1.15)*.06)-curious*.19+joy*.025+nod,()=>{
      oval(96,77,46,48,'hair','white',1.25);
      oval(51,91,7,10,'skin','white');oval(141,91,7,10,'skin','white');
      shape('M54 69 Q57 42 96 42 Q135 42 138 69 L136 95 Q131 119 110 128 Q96 133 82 128 Q60 119 56 96 Z','skin','white',1.6);
      // Swept fringe with large, clean negative-space locks.
      shape('M51 83 Q44 43 73 30 Q101 17 126 38 Q145 50 141 85 L135 100 L129 88 L129 67 Q113 65 97 49 Q86 68 61 72 L61 93 L56 100 Z','hair','white',1.3);
      shape('M57 60 Q60 40 79 36 M65 58 Q75 39 89 36 M106 36 Q127 43 133 60 M99 43 Q113 57 124 60',null,'white',.85);
      // Eyes are solid shapes; highlights, pupils and lashes read without surface noise.
      const blink=!still&&((t%6.7>6.42&&t%6.7<6.61)||(t%11.3>10.91&&t%11.3<11.06));
      const happy=joy>.35;
      for(const [x,side] of [[77,-1],[115,1]]){
        if(blink||happy){shape(`M${x-9} 92 Q${x} ${happy?79:96} ${x+9} 92`,null,'black',2.8)}
        else{
          oval(x,88,10,14,'trim','black',1.5);
          const look=curious?1.5:(still?0:Math.sin(t*.67)*1.1);
          oval(x+look,89-curious*2,5.8,10,'black');
          oval(x-1+look,84-curious*2,2,3,'white');
          oval(x+2+look,94-curious*2,.9,1.2,'white');
          shape(`M${x+side*8} 79 l${side*3} -4 M${x+side*9} 84 l${side*4} -1`,null,'black',1.7);
        }
        shape(`M${x-6} ${69-curious*side*2} Q${x} ${66-curious*side*2} ${x+6} ${69-curious*side*2}`,null,'white',1.4);
      }
      shape('M93 100 Q96 97 100 100 L97 104 Z','black',null);
      // Mouth shapes follow the letter cadence, then return to a soft closed smile.
      if(talk.active&&talk.syllable===1)oval(97,113,3.2,4.8,'black');
      else if(talk.active&&talk.syllable===2)shape('M90 110 Q97 114 104 110 Q102 120 96 120 Q91 119 90 110 Z','black',null);
      else if(talk.active&&talk.syllable===3)oval(97,113,4.7,2,'black');
      else if(joy>.35)shape('M88 110 Q97 115 106 110 Q102 121 96 120 Q90 119 88 110 Z','black',null);
      else if(curious>.5)oval(97,114,2.2,2.5,'black');
      else shape('M89 112 Q97 119 105 112',null,'black',1.8);
      // A clean bandage interrupts the cheek texture with two defined pads.
      around(121,110,-.45,()=>{
        shape('M113 106 L129 106 L129 113 L113 113 Z','trim','black',.9);
        shape('M118 108 L124 108 L124 112 L118 112 Z','cloth',null);
      });
    });
    ink.restore();
    if(mode==='curious')thinkingArm(curious);
  });
  ink.restore();
  if(joy>.3)for(const [x,y,phase] of [[36,58,0],[155,68,1]]){
    const lift=still?0:Math.sin(age*6+phase)*2;
    shape(`M${x} ${y-5+lift} L${x+1.5} ${y-1+lift} L${x+5} ${y+lift} L${x+1.5} ${y+1+lift} L${x} ${y+5+lift} L${x-1.5} ${y+1+lift} L${x-5} ${y+lift} L${x-1.5} ${y-1+lift} Z`,'white',null);
  }
  if(curious>.4){ink.fillStyle='#fff';ink.font='18px monospace';ink.fillText('?',151,43+(still?0:Math.sin(t*2)))}
  // Quantize the finished articulated image into Braille cells, then draw only their dots.
  const pixels=ink.getImageData(0,0,192,264).data;
  output.clearRect(0,0,384,528);output.fillStyle='#c5b5ec';
  for(let y=0;y<264;y+=4)for(let x=0;x<192;x+=2){
    let cell=0;
    for(const [dx,dy,bit]of dotBits){const i=((y+dy)*192+x+dx)*4;if(pixels[i+3]>100&&pixels[i]>112)cell|=bit}
    for(const [dx,dy,bit]of dotBits)if(cell&bit){output.beginPath();output.arc((x+dx)*2+.5,(y+dy)*2+.5,.84,0,Math.PI*2);output.fill()}
  }
  spoken.textContent=quote.slice(0,talk.count);
  endMark.hidden=talk.count!==quote.length;
  let walkX=0,panelProgress=0;
  if(entranceStart!==null&&!still){
    const age=clock-entranceStart;
    panelProgress=age<.55?ease(age/.55):age<.9?1:1-ease((age-.9)/.65);
    walkX=age<1.05?-170:-170*(1-ease((age-1.05)/2.35));
    if(age>3.5)entranceStart=null;
  }
  actor.style.setProperty('--walk-x',`${walkX}px`);
  panels.forEach((p,i)=>p.style.transform=`translateX(${(i?1:-1)*(1-panelProgress)*101}%)`);
  if(mode!=='idle'&&!still&&age>2.85)setMode('idle');
}
function tick(now) {
  raf=0;
  if(paused||document.hidden)return;
  if(previous!==null)clock+=Math.min((now-previous)/1000,.08);
  previous=now;
  if(clock-lastDraw>=1/30){draw(clock);lastDraw=clock}
  if(!reduced.matches)raf=requestAnimationFrame(tick);
}
function resume(){previous=null;draw(clock);if(!raf&&!paused&&!document.hidden&&!reduced.matches)raf=requestAnimationFrame(tick)}
document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{setMode(button.dataset.mode);talkStart=-100;draw(clock);resume()}));
document.querySelector('#talk').addEventListener('click',()=>{setMode('idle');talkStart=clock;resume()});
document.querySelector('#entrance').addEventListener('click',()=>{
  if(paused)document.querySelector('#pause').click();
  setMode('idle');entranceStart=reduced.matches?null:clock;talkStart=clock+3.5;resume();
});
document.querySelector('#pause').addEventListener('click',event=>{
  paused=!paused;event.currentTarget.setAttribute('aria-pressed',String(paused));
  event.currentTarget.textContent=paused?'[ resume ]':'[ pause ]';
  if(paused){cancelAnimationFrame(raf);raf=0;previous=null}else resume();
});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){cancelAnimationFrame(raf);raf=0;previous=null}else resume();
});
reduced.addEventListener('change',()=>{cancelAnimationFrame(raf);raf=0;entranceStart=null;resume()});
resume();
