import {gsap} from 'gsap'
import './book.css'
export type BookPage={id:string;title:string;subtitle:string;cover:string;date?:string;photos?:string[]}
export const bookMotion={duration:.8,segments:20,threshold:.28,velocity:.45}
export function createBook(host:HTMLElement,pages:BookPage[],open:(id:string)=>void){
 let index=0,busy=false,direction=1,progress=0,start=0,last=0,time=0,velocity=0,pointer=-1,moved=false;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 host.innerHTML='<div class="folio" tabindex="0" role="region" aria-label="摄影作品翻页书"><div class="spread"><div class="folio-text"></div><button class="folio-art" aria-label="打开当前作品"></button><div class="curl" aria-hidden="true"></div><button class="edge edge-left" aria-label="上一主题"></button><button class="edge edge-right" aria-label="下一主题"></button></div><nav class="folio-nav" aria-label="翻页"><button data-go="first">首页</button><button data-go="prev">上一页</button><output aria-live="polite"></output><button data-go="next">下一页</button><button data-go="last">末页</button></nav><p class="folio-help">拖动书页边缘翻阅 · 点击手绘图查看照片 · ← →</p></div>';
 const root=host.querySelector<HTMLElement>('.folio')!,spread=host.querySelector<HTMLElement>('.spread')!,left=host.querySelector<HTMLElement>('.folio-text')!,art=host.querySelector<HTMLButtonElement>('.folio-art')!,curl=host.querySelector<HTMLElement>('.curl')!;
 const images=pages.map(p=>{const image=new Image();image.decoding='async';image.fetchPriority='high';image.alt=p.title+'手绘代表图';image.draggable=false;image.src=p.cover;return image});
 const ready=pages.map(()=>false);
 const preloads=images.map((image,i)=>image.decode().then(()=>{ready[i]=true}).catch(()=>{}));
 const render=()=>{const p=pages[index];left.replaceChildren();const n=document.createElement('p');n.textContent=`摄影手记 / ${String(index+1).padStart(2,'0')}`;const h=document.createElement('h2');h.textContent=p.title;const d=document.createElement('p');d.textContent=`${p.date||''}  ·  ${p.subtitle}`;left.append(n,h,d);art.replaceChildren(images[index]);host.querySelector('output')!.textContent=`${index+1} / ${pages.length}`;host.querySelectorAll<HTMLButtonElement>('[data-go],.edge').forEach(b=>{b.disabled=((b.dataset.go==='first'||b.dataset.go==='prev'||b.classList.contains('edge-left'))&&index===0)||((b.dataset.go==='last'||b.dataset.go==='next'||b.classList.contains('edge-right'))&&index===pages.length-1)})};
 const paint=(p:number)=>{progress=p;curl.style.transform=`rotateY(${direction===1?-180*p:180*p}deg)`;curl.style.opacity='1'};
 const begin=(dir:number)=>{if(busy||index+dir<0||index+dir>=pages.length||!ready[index]||!ready[index+dir])return false;busy=true;direction=dir;progress=0;curl.classList.toggle('reverse',dir===-1);curl.style.left=dir===1?'50%':'0';curl.style.width='50%';curl.style.transformOrigin=dir===1?'left center':'right center';curl.replaceChildren();const target=pages[index+dir];const sheet=document.createElement('div');sheet.className='turn-sheet';const front=document.createElement('div');front.className='sheet-face sheet-front';const back=document.createElement('div');back.className='sheet-face sheet-back';const textPage=target;const n=document.createElement('p');n.textContent=`摄影手记 / ${String(index+2).padStart(2,'0')}`;const h=document.createElement('h2');h.textContent=textPage.title;const d=document.createElement('p');d.textContent=`${textPage.date||''}  ·  ${textPage.subtitle}`;if(dir===1){front.style.backgroundImage=`url("${pages[index].cover}")`;back.className+=' sheet-text';back.append(n,h,d)}else{front.className+=' sheet-text';front.append(n,h,d);back.style.backgroundImage=`url("${target.cover}")`}sheet.append(front,back);curl.append(sheet);art.replaceChildren(images[index+dir]);paint(0);return true};
 const settle=(complete:boolean)=>{const state={p:progress};gsap.to(state,{p:complete?1:0,duration:reduced.matches?.12:bookMotion.duration*Math.max(.25,Math.abs((complete?1:0)-progress)),ease:'power2.out',onUpdate:()=>{if(reduced.matches){curl.style.opacity='0';spread.style.opacity=String(.5+Math.abs(state.p-.5))}else paint(state.p)},onComplete:()=>{if(complete)index+=direction;busy=false;curl.replaceChildren();spread.style.opacity='1';render()}})};
 let pending=false; const turn=(dir:number)=>{const target=index+dir;if(busy||pending||target<0||target>=pages.length)return;pending=true;Promise.all([preloads[index],preloads[target]]).then(()=>{pending=false;if(begin(dir))settle(true)})};
 art.onclick=()=>{if(!busy&&!moved)open(pages[index].id)};
 spread.onpointerdown=e=>{if(e.button!==0||busy)return;const target=e.target as HTMLElement;if(target.closest('.folio-text'))return;const rect=spread.getBoundingClientRect();const x=e.clientX-rect.left;if(x>rect.width*.12&&x<rect.width*.88)return;const dir=x<rect.width/2?-1:1;if(!begin(dir)){turn(dir);return;}pointer=e.pointerId;start=last=e.clientX;time=performance.now();velocity=0;moved=false;spread.setPointerCapture(pointer)};
 spread.onpointermove=e=>{if(e.pointerId!==pointer)return;const now=performance.now();velocity=(last-e.clientX)*direction/Math.max(1,now-time);last=e.clientX;time=now;const delta=(start-e.clientX)*direction;if(Math.abs(delta)>5)moved=true;paint(Math.max(0,Math.min(1,delta/(spread.clientWidth*.5))))};
 const release=(cancel=false)=>{if(pointer<0)return;spread.releasePointerCapture(pointer);pointer=-1;settle(!cancel&&(!moved||progress>bookMotion.threshold||velocity>bookMotion.velocity));setTimeout(()=>moved=false,100)};
 spread.onpointerup=()=>release();spread.onpointercancel=()=>release(true);
 host.querySelectorAll<HTMLButtonElement>('[data-go]').forEach(b=>b.onclick=()=>{if(busy)return;const go=b.dataset.go;if(go==='first'||go==='last'){index=go==='first'?0:pages.length-1;render()}else turn(go==='next'?1:-1)});
 root.onkeydown=e=>{if((e.target as HTMLElement).closest('input,textarea'))return;if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();if(busy)return;if(e.key==='Home'||e.key==='End'){index=e.key==='Home'?0:pages.length-1;render()}else turn(e.key==='ArrowRight'?1:-1)}};
 host.querySelector<HTMLButtonElement>('.edge-left')!.onclick=()=>turn(-1);host.querySelector<HTMLButtonElement>('.edge-right')!.onclick=()=>turn(1);
 render();root.addEventListener('pointermove',e=>{const r=spread.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5;const y=(e.clientY-r.top)/r.height-.5;spread.style.setProperty('--book-tilt',`${x*1.5}deg`);spread.style.setProperty('--book-lift',`${y*-3}px`)});root.addEventListener('pointerleave',()=>{spread.style.setProperty('--book-tilt','0deg');spread.style.setProperty('--book-lift','0px')});return {focus:()=>root.focus()};
}












